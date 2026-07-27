import Event from '../types/Event';
import { EventType } from '../types/EventType';
import { ImportResult, ParsedStage } from '../types/AiImport';

const CLAUDE_API_URL = '/api/claude';
const TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `Du bist ein Datenextraktions-Assistent für Radsport-Veranstaltungen.
Extrahiere den Veranstaltungsnamen, eine kurze Beschreibung und alle Etappen aus dem folgenden Text.

Gib NUR ein JSON-Objekt zurück, keinen anderen Text, keine Erklärungen.

Das JSON-Objekt hat folgende Struktur:
{
  "name": "Veranstaltungsname (z.B. Tour de France 2025)",
  "description": "Kurze Beschreibung der Veranstaltung (1-2 Sätze)",
  "stages": [...]
}

Jedes Objekt im stages-Array hat folgende Felder (alle optional, nur wenn erkennbar):
- stage: Etappennummer als String (z.B. "1", "2", "Prolog")
- date: Datum im Format "YYYY-MM-DD"
- startTime: Startzeit im Format "HH:MM"
- endTime: Endzeit im Format "HH:MM"
- from: Startort als String
- to: Zielort als String
- kilometers: Distanz als String (z.B. "185.5")
- type: Etappentyp, exakt einer dieser Werte: "Flachetappe" | "Hügeletappe" | "Bergetappe" | "Zeitfahren"
- mountainFinish: true oder false (Bergankunft)

Wenn du für ein Feld keine zuverlässige Information findest, lass es weg.
Achte besonders auf Start- und Endzeiten (startTime, endTime) und extrahiere sie, wann immer sie im Text erkennbar sind.
Wenn nur eine Startzeit angegeben ist, schätze eine plausible Endzeit basierend auf der Distanz (kilometers): Rechne bei Radetappen mit einer Durchschnittsgeschwindigkeit von etwa 40 km/h und runde auf volle Viertelstunden. Ohne Distanz nimm 4-5 Stunden Fahrzeit an.
Beispiel-Ausgabe:
{"name":"Tour de France 2025","description":"Die 112. Austragung der Tour de France.","stages":[{"stage":"1","date":"2025-07-05","startTime":"12:30","endTime":"17:15","from":"Florenz","to":"Rimini","kilometers":"206","type":"Flachetappe","mountainFinish":false}]}`;

export async function callClaudeApi(text: string, apiKey: string): Promise<ImportResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 4096,
                system: SYSTEM_PROMPT,
                messages: [{ role: 'user', content: text }],
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 401) return { success: false, error: 'INVALID_API_KEY' };
        if (response.status === 429) return { success: false, error: 'RATE_LIMITED' };
        if (!response.ok) return { success: false, error: 'NETWORK_ERROR' };

        const data = await response.json();
        const rawText: string = data?.content?.[0]?.text ?? '';

        let parsed: { name?: string; description?: string; stages?: ParsedStage[] };
        try {
            const json = JSON.parse(extractJson(rawText));
            if (Array.isArray(json)) {
                parsed = { name: '', description: '', stages: json };
            } else {
                parsed = json;
            }
        } catch {
            return { success: false, error: 'PARSE_ERROR' };
        }

        const stages = parsed.stages ?? [];
        if (stages.length === 0) {
            return { success: false, error: 'NO_STAGES_FOUND' };
        }

        return {
            success: true,
            name: parsed.name ?? '',
            description: parsed.description ?? '',
            stages,
        };
    } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof DOMException && err.name === 'AbortError') {
            return { success: false, error: 'TIMEOUT' };
        }
        return { success: false, error: 'NETWORK_ERROR' };
    }
}

function extractJson(text: string): string {
    const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (fenced) return fenced[1].trim();

    const bracketMatch = text.match(/\[[\s\S]*\]/);
    if (bracketMatch) return bracketMatch[0];

    return text.trim();
}

function toISODate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function parseTime(timeStr: string, baseDate: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
}

function isEmptyEvent(e: Event): boolean {
    return !e.date && !e.from && !e.to && !e.kilometers;
}

export type ColumnOverwrite = Record<string, boolean>;

export function mergeStages(existing: Event[], parsed: ParsedStage[], cols?: ColumnOverwrite): Event[] {
    const ow = cols ?? {};
    const result = existing.filter(e => !isEmptyEvent(e)).map(e => ({ ...e }));

    for (const stage of parsed) {
        if (!stage.date) {
            result.push(parsedToEvent(stage));
            continue;
        }

        const idx = result.findIndex(e => e.date && toISODate(e.date) === stage.date);

        if (idx !== -1) {
            const ev = result[idx];
            const canWrite = (field: string, existing: unknown) => ow[field] || !existing;
            if (stage.stage && canWrite('stage', ev.stage)) ev.stage = stage.stage;
            if (stage.from && canWrite('from', ev.from)) ev.from = stage.from;
            if (stage.to && canWrite('to', ev.to)) ev.to = stage.to;
            if (stage.kilometers && canWrite('kilometers', ev.kilometers)) ev.kilometers = stage.kilometers;
            if (stage.type && canWrite('type', ev.type)) ev.type = stage.type;
            if (stage.mountainFinish !== undefined && canWrite('mountainFinish', ev.mountainFinish)) ev.mountainFinish = stage.mountainFinish;
            const baseDate = ev.date!;
            if (stage.startTime && canWrite('startTime', ev.startTime)) ev.startTime = parseTime(stage.startTime, baseDate);
            if (stage.endTime && canWrite('endTime', ev.endTime)) ev.endTime = parseTime(stage.endTime, baseDate);
            if (stage.date && canWrite('date', null)) {
                const newDate = new Date(stage.date);
                ev.date = newDate;
            }
            const times = applyDefaultTimes(ev.startTime, ev.endTime, ev.date!);
            ev.startTime = times.startTime;
            ev.endTime = times.endTime;
        } else {
            result.push(parsedToEvent(stage));
        }
    }

    return result;
}

function applyDefaultTimes(
    startTime: Date | null,
    endTime: Date | null,
    baseDate: Date,
): { startTime: Date; endTime: Date } {
    const defaultStart = parseTime('11:00', baseDate);
    const defaultEnd = parseTime('17:00', baseDate);

    let start = startTime ?? defaultStart;
    let end = endTime ?? defaultEnd;

    if (end <= start) {
        if (endTime && !startTime) {
            start = new Date(end.getTime() - 3_600_000);
        } else {
            end = new Date(start.getTime() + 3_600_000);
        }
    }

    return { startTime: start, endTime: end };
}

function parsedToEvent(stage: ParsedStage): Event {
    const date = stage.date ? new Date(stage.date) : null;
    let startTime: Date | null = null;
    let endTime: Date | null = null;

    if (date) {
        const rawStart = stage.startTime ? parseTime(stage.startTime, date) : null;
        const rawEnd = stage.endTime ? parseTime(stage.endTime, date) : null;
        const times = applyDefaultTimes(rawStart, rawEnd, date);
        startTime = times.startTime;
        endTime = times.endTime;
    }

    return {
        id: crypto.randomUUID(),
        stage: stage.stage ?? '',
        date,
        startTime,
        endTime,
        from: stage.from ?? '',
        to: stage.to ?? '',
        kilometers: stage.kilometers ?? '',
        type: stage.type ?? EventType.FLAT,
        mountainFinish: stage.mountainFinish ?? false,
    };
}

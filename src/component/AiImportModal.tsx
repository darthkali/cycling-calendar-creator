import React, { useState, useRef } from 'react';
import { ParsedStage, ImportError } from '../types/AiImport';
import { EventType } from '../types/EventType';
import { callClaudeApi } from '../services/aiImportService';
import { getApiKey } from '../utils/apiKeyStorage';
import './AiImportModal.css';

type ModalState = 'idle' | 'loading' | 'preview' | 'error';

const STAGE_COLUMNS = ['stage', 'date', 'startTime', 'endTime', 'from', 'to', 'kilometers', 'type', 'mountainFinish'] as const;
type StageColumn = typeof STAGE_COLUMNS[number];

const COLUMN_LABELS: Record<StageColumn, string> = {
    stage: 'Etappe',
    date: 'Datum',
    startTime: 'Start',
    endTime: 'Ende',
    from: 'Von',
    to: 'Nach',
    kilometers: 'km',
    type: 'Art',
    mountainFinish: 'Berg',
};

export type OverwriteConfig = {
    name: boolean;
    description: boolean;
    columns: Record<StageColumn, boolean>;
};

export type ImportData = {
    name: string;
    description: string;
    stages: ParsedStage[];
    overwrite: OverwriteConfig;
};

type Props = {
    onClose: () => void;
    onImport: (data: ImportData) => void;
};

const ERROR_MESSAGES: Record<ImportError, string> = {
    NO_API_KEY: 'Kein API-Key konfiguriert – bitte zuerst in den Einstellungen hinterlegen.',
    INVALID_API_KEY: 'API-Key ungültig – bitte in den Einstellungen prüfen.',
    RATE_LIMITED: 'Anfragelimit erreicht – bitte warte kurz und versuche es erneut.',
    TIMEOUT: 'Zeitüberschreitung – bitte versuche es erneut.',
    NO_STAGES_FOUND: 'Keine Etappen erkannt – bitte prüfe den eingefügten Text.',
    PARSE_ERROR: 'Fehler bei der Verarbeitung – bitte versuche es erneut.',
    NETWORK_ERROR: 'Netzwerkfehler – bitte versuche es erneut.',
};

const AiImportModal: React.FC<Props> = ({ onClose, onImport }) => {
    const [text, setText] = useState('');
    const [state, setModalState] = useState<ModalState>('idle');
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [errorKey, setErrorKey] = useState<ImportError | null>(null);
    const [editedStages, setEditedStages] = useState<ParsedStage[]>([]);
    const [importName, setImportName] = useState('');
    const [importDescription, setImportDescription] = useState('');
    const [overwrite, setOverwrite] = useState<OverwriteConfig>({
        name: true,
        description: true,
        columns: Object.fromEntries(STAGE_COLUMNS.map(c => [c, true])) as Record<StageColumn, boolean>,
    });
    const abortRef = useRef<AbortController | null>(null);
    const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);


    function startProgressAnimation() {
        setProgress(0);
        setStatusText('Analysiere Etappen…');
        let current = 0;
        progressRef.current = setInterval(() => {
            current = Math.min(current + 1.5, 85);
            setProgress(current);
        }, 400);
    }

    function stopProgressAnimation(success: boolean) {
        if (progressRef.current) clearInterval(progressRef.current);
        setProgress(success ? 100 : 0);
    }

    async function handleImport() {
        const apiKey = getApiKey();
        if (!apiKey) {
            setErrorKey('NO_API_KEY');
            setModalState('error');
            return;
        }

        setModalState('loading');
        startProgressAnimation();

        const result = await callClaudeApi(text, apiKey);
        stopProgressAnimation(result.success);

        if (result.success) {
            setImportName(result.name);
            setImportDescription(result.description);
            setEditedStages(result.stages.map(s => ({ ...s })));
            setModalState('preview');
        } else {
            setErrorKey(result.error);
            setModalState('error');
        }
    }

    function handleCancel() {
        abortRef.current?.abort();
        if (progressRef.current) clearInterval(progressRef.current);
        onClose();
    }

    function handleConfirm() {
        onImport({ name: importName, description: importDescription, stages: editedStages, overwrite });
        onClose();
    }

    function handlePreviewChange(idx: number, field: keyof ParsedStage, value: string | boolean) {
        setEditedStages(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    }

    return (
        <div className="ai-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
            <div className={`ai-modal-box${state === 'preview' ? ' ai-modal-wide' : ''}`}>
                <h2 className="ai-modal-title">KI-Import</h2>

                {(state === 'idle' || state === 'error') && (
                    <>
                        <p className="ai-modal-hint">
                            Termintext von einer Website einfügen – die KI erkennt Etappen automatisch.
                        </p>
                        <textarea
                            className="ai-modal-textarea input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Etappenplan hier einfügen…"
                            rows={10}
                        />
                        {state === 'error' && errorKey && (
                            <p className="ai-modal-error">{ERROR_MESSAGES[errorKey]}</p>
                        )}
                        <div className="ai-modal-actions">
                            <button className="btn btn-secondary" onClick={handleCancel}>Abbrechen</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleImport}
                                disabled={text.trim().length === 0}
                            >
                                Importieren
                            </button>
                        </div>
                    </>
                )}

                {state === 'loading' && (
                    <div className="ai-modal-loading">
                        <div className="ai-progress-bar">
                            <div className="ai-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="ai-status-text">{statusText}</p>
                        <button className="btn btn-secondary" onClick={handleCancel}>Abbrechen</button>
                    </div>
                )}

                {state === 'preview' && (
                    <>
                        <p className="ai-modal-hint">
                            Erkannte Daten prüfen und bei Bedarf korrigieren:
                        </p>
                        <div className="ai-preview-meta">
                            <label className="ai-overwrite-row">
                                <input type="checkbox" checked={overwrite.name}
                                    onChange={e => setOverwrite(prev => ({ ...prev, name: e.target.checked }))} />
                                <span>Name:</span>
                                <input value={importName} onChange={e => setImportName(e.target.value)} />
                            </label>
                            <label className="ai-overwrite-row">
                                <input type="checkbox" checked={overwrite.description}
                                    onChange={e => setOverwrite(prev => ({ ...prev, description: e.target.checked }))} />
                                <span>Beschreibung:</span>
                                <input value={importDescription} onChange={e => setImportDescription(e.target.value)} />
                            </label>
                        </div>
                        <div className="ai-modal-actions">
                            <button className="btn btn-secondary" onClick={() => setModalState('idle')}>Zurück</button>
                            <button className="btn btn-primary" onClick={handleConfirm}>Übernehmen</button>
                        </div>
                        <p className="ai-overwrite-hint">Häkchen = Spalte überschreibt bestehende Werte</p>
                        <div className="ai-preview-scroll">
                            <table className="ai-preview-table">
                                <thead>
                                    <tr>
                                        {STAGE_COLUMNS.map(col => (
                                            <th key={col}>
                                                <label className="ai-col-check">
                                                    <input type="checkbox"
                                                        checked={overwrite.columns[col]}
                                                        onChange={e => setOverwrite(prev => ({
                                                            ...prev,
                                                            columns: { ...prev.columns, [col]: e.target.checked },
                                                        }))} />
                                                    {COLUMN_LABELS[col]}
                                                </label>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {editedStages.map((s, i) => (
                                        <tr key={i}>
                                            <td><input value={s.stage ?? ''} onChange={e => handlePreviewChange(i, 'stage', e.target.value)} /></td>
                                            <td><input value={s.date ?? ''} placeholder="YYYY-MM-DD" onChange={e => handlePreviewChange(i, 'date', e.target.value)} /></td>
                                            <td><input value={s.startTime ?? ''} placeholder="HH:MM" onChange={e => handlePreviewChange(i, 'startTime', e.target.value)} /></td>
                                            <td><input value={s.endTime ?? ''} placeholder="HH:MM" onChange={e => handlePreviewChange(i, 'endTime', e.target.value)} /></td>
                                            <td><input value={s.from ?? ''} onChange={e => handlePreviewChange(i, 'from', e.target.value)} /></td>
                                            <td><input value={s.to ?? ''} onChange={e => handlePreviewChange(i, 'to', e.target.value)} /></td>
                                            <td><input value={s.kilometers ?? ''} onChange={e => handlePreviewChange(i, 'kilometers', e.target.value)} /></td>
                                            <td>
                                                <select value={s.type ?? ''} onChange={e => handlePreviewChange(i, 'type', e.target.value as EventType)}>
                                                    <option value="">–</option>
                                                    {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <input type="checkbox" checked={s.mountainFinish ?? false} onChange={e => handlePreviewChange(i, 'mountainFinish', e.target.checked)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AiImportModal;

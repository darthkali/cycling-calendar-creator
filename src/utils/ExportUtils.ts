// src/utils/ExportUtils.ts
import { createEvents, EventAttributes } from 'ics';
import {DateTime, convertDateAndTimeToDateTime, getNow} from './DateTime';
import Event from '../types/Event';
import EventType from '../types/EventType';

type ExportToICSParams = {
    events: Event[];
    name: string;
    description: string;
    getIconForEventType: (type: EventType) => string;
};

export const exportToICS = ({
                                events,
                                name,
                                description,
                                getIconForEventType,
                            }: ExportToICSParams) => {
    const icsEvents: EventAttributes[] = events
        .filter(event => event.date && event.startTime && event.endTime)
        .map(event => {
            const icon = getIconForEventType(event.type);
            const mountainFinish = event.mountainFinish ? ' ⛰️ Bergankunft' : ''
            const title = `${icon}${name}: ${event.stage}. Etappe: ${event.from} - ${event.to}, ${event.kilometers} km${mountainFinish}`;

            const start: DateTime = convertDateAndTimeToDateTime(event.date!, event.startTime!);
            const end: DateTime = convertDateAndTimeToDateTime(event.date!, event.endTime!);

            const editedDescription = `🌋 = Bergetappe\n🗻 = Hügeletappe\n🛣️ = Flachetappe\n⏱️ = Zeitfahren\n\n${description}`

            return {
                title,
                start,
                end,
                description: editedDescription,
                location: `${event.from} - ${event.to}`,
            };
        });

    createEvents(icsEvents, (error, value) => {
        if (error) {
            console.error(error);
            return;
        }
        const blob = new Blob([value], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}_${getNow()}.ics`;
        a.click();
        URL.revokeObjectURL(url);
    });
};

export const exportToJson = (name: string, description: string, events: Event[]) => {
    const data = { name, description, events };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `${name}_${getNow()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

export const importFromJson = (
    event: React.ChangeEvent<HTMLInputElement>,
    setName: React.Dispatch<React.SetStateAction<string>>,
    setDescription: React.Dispatch<React.SetStateAction<string>>,
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>
) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            const data = JSON.parse(result);

            const convertedEvents: Event[] = data.events.map((event: Event) => ({
                ...event,
                date: event.date ? new Date(event.date) : null,
                startTime: event.startTime ? new Date(event.startTime) : null,
                endTime: event.endTime ? new Date(event.endTime) : null,
            }));

            setName(data.name);
            setDescription(data.description);
            setEvents(convertedEvents);
        };
        reader.readAsText(file);
    }
};

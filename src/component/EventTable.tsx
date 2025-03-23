// src/components/EventTable.tsx
import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { enGB } from 'date-fns/locale/en-GB';
import './EventTable.css';
import EventRow from './EventRow';
import {EventType} from '../types/EventType';
import Event  from '../types/Event';
import { exportToICS, exportToJson, importFromJson } from '../utils/ExportUtils';
import { areAllEventRequiredFieldsFilled, areRequiredFieldsFilled } from '../utils/EventValidation';

registerLocale('en-GB', enGB);

const EventTable: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([
        {
            stage: '1',
            date: null,
            startTime: null,
            endTime: null,
            from: '',
            to: '',
            kilometers: '',
            type: EventType.FLAT,
            mountainFinish: false
        }
    ]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (events.length === 0) {
            setEvents([{
                stage: '1',
                date: null,
                startTime: null,
                endTime: null,
                from: '',
                to: '',
                kilometers: '',
                type: EventType.FLAT,
                mountainFinish: false
            }]);
        }
    }, [events]);

    const handleChange = (index: number, field: keyof Event, value: any) => {
        const newEvents = [...events];
        newEvents[index][field] = value;
        setEvents(newEvents);
    };

    const addRow = () => {
        const lastEvent = events[events.length - 1];
        if (!areRequiredFieldsFilled(lastEvent)) {
            if (!window.confirm('Du hast Datum, Startzeit und/oder Endzeit in der letzten Zeile nicht ausgefüllt. Willst du dennoch eine neue Zeile einfügen?')) {
                return;
            }
        }

        const newDate = lastEvent && lastEvent.date ? new Date(lastEvent.date.getTime() + 86400000) : null; // Einen Tag hinzufügen
        const newStartTime = lastEvent?.startTime ? new Date(lastEvent.startTime.getTime()) : null;
        const newEndTime = lastEvent?.endTime ? new Date(lastEvent.endTime.getTime()) : null;

        let lastStage = 0;
        for (let i = events.length - 1; i >= 0; i--) {
            const stage = parseInt(events[i].stage);
            if (!isNaN(stage)) {
                lastStage = stage;
                break;
            }
        }
        const newStage = (lastStage + 1).toString();

        const newEvent: Event = {
            stage: newStage,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            from: '',
            to: '',
            kilometers: '',
            type: EventType.FLAT,
            mountainFinish: false
        };

        setEvents([...events, newEvent]);
    };

    const deleteRow = (index: number) => {
        const newEvents = events.filter((_, i) => i !== index);
        let lastStage = 0;
        for (let i = 0; i < newEvents.length; i++) {
            const stage = parseInt(newEvents[i].stage);
            if (!isNaN(stage)) {
                newEvents[i].stage = (lastStage + 1).toString();
                lastStage++;
            }
        }
        setEvents(newEvents);
    };

    const getIconForEventType = (type: EventType): string => {
        switch (type) {
            case EventType.MOUNTAIN:
                return '🌋';
            case EventType.HILL:
                return '🗻';
            case EventType.FLAT:
                return '🛣️';
            case EventType.TIME_TRAIL:
                return '⏱️';
            default:
                return '';
        }
    };

    const handleExportToICS = () => {
        exportToICS({
            events,
            name,
            description,
            getIconForEventType
        });
    };

    const handleExportToJson = () => {
        exportToJson(name, description, events);
    };

    const handleImportFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
        importFromJson(event, setName, setDescription, setEvents);
    };

    return (
        <div>
            <div className="input-container">
                <div className="input-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Name:"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-common input-name"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="description">Beschreibung:</label>
                    <input
                        id="description"
                        type="text"
                        placeholder="Beschreibung:"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-common input-description"
                    />
                </div>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Etappe</th>
                    <th>Datum</th>
                    <th>Startzeit</th>
                    <th>Endzeit</th>
                    <th>Von</th>
                    <th>Nach</th>
                    <th>Kilometer</th>
                    <th>Art</th>
                    <th>Bergankunft</th>
                    <th>Aktion</th>
                </tr>
                </thead>
                <tbody>
                {events.map((event, index) => (
                    <EventRow
                        key={index}
                        event={event}
                        index={index}
                        handleChange={handleChange}
                        deleteRow={deleteRow}
                    />
                ))}
                </tbody>
            </table>
            <button onClick={addRow}>Add Row</button>
            <button
                onClick={handleExportToICS}
                disabled={!areAllEventRequiredFieldsFilled(events)}
            >
                Export to .ics
            </button>
            <button onClick={handleExportToJson}>Export to JSON</button>
            <input type="file" accept=".json" onChange={handleImportFromJson} />
        </div>
    );
};

export default EventTable;

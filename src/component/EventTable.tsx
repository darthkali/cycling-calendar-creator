import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { enGB } from 'date-fns/locale/en-GB';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import './EventTable.css';
import EventRow from './EventRow';
import {EventType} from '../types/EventType';
import Event  from '../types/Event';
import { exportToICS, exportToJson, importFromJson } from '../utils/ExportUtils';
import { areAllEventRequiredFieldsFilled, areRequiredFieldsFilled } from '../utils/EventValidation';
import AiImportModal from './AiImportModal';
import { mergeStages } from '../services/aiImportService';
import type { ImportData } from './AiImportModal';

registerLocale('en-GB', enGB);

function createEvent(stage: string): Event {
    return {
        id: crypto.randomUUID(),
        stage,
        date: null,
        startTime: null,
        endTime: null,
        from: '',
        to: '',
        kilometers: '',
        type: EventType.FLAT,
        mountainFinish: false,
    };
}

function renumberStages(events: Event[]): Event[] {
    return events.map((e, i) => ({ ...e, stage: (i + 1).toString() }));
}

const EventTable: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([createEvent('1')]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleChange = (index: number, field: keyof Event, value: unknown) => {
        const newEvents = [...events];
        (newEvents[index] as Record<string, unknown>)[field] = value;
        setEvents(newEvents);
    };

    const addRow = () => {
        const lastEvent = events[events.length - 1];
        if (!areRequiredFieldsFilled(lastEvent)) {
            if (!window.confirm('Du hast Datum, Startzeit und/oder Endzeit in der letzten Zeile nicht ausgefüllt. Willst du dennoch eine neue Zeile einfügen?')) {
                return;
            }
        }

        const newDate = lastEvent && lastEvent.date ? new Date(lastEvent.date.getTime() + 86400000) : null;
        const newStartTime = lastEvent?.startTime ? new Date(lastEvent.startTime.getTime()) : null;
        const newEndTime = lastEvent?.endTime ? new Date(lastEvent.endTime.getTime()) : null;

        const newEvent: Event = {
            ...createEvent((events.length + 1).toString()),
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
        };

        setEvents([...events, newEvent]);
    };

    const deleteRow = (index: number) => {
        const newEvents = events.filter((_, i) => i !== index);
        if (newEvents.length === 0) {
            setEvents([createEvent('1')]);
            return;
        }
        setEvents(renumberStages(newEvents));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setEvents(prev => {
            const oldIndex = prev.findIndex(e => e.id === active.id);
            const newIndex = prev.findIndex(e => e.id === over.id);
            return renumberStages(arrayMove(prev, oldIndex, newIndex));
        });
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

    const handleAiImport = (data: ImportData) => {
        if (data.name && (data.overwrite.name || !name)) setName(data.name);
        if (data.description && (data.overwrite.description || !description)) setDescription(data.description);
        setEvents(prev => renumberStages(mergeStages(prev, data.stages, data.overwrite.columns)));
    };

    return (
        <div>
            {showImportModal && (
                <AiImportModal
                    onClose={() => setShowImportModal(false)}
                    onImport={handleAiImport}
                />
            )}
            <div className="input-container">
                <div className="input-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Name:"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input input-name"
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
                        className="input input-description"
                    />
                </div>
            </div>
            <div className="table-actions">
                <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>🤖 KI-Import</button>
                <button className="btn btn-secondary" onClick={addRow}>+ Zeile hinzufügen</button>
                <button
                    className="btn btn-primary"
                    onClick={handleExportToICS}
                    disabled={!areAllEventRequiredFieldsFilled(events)}
                >
                    Export to .ics
                </button>
                <button className="btn btn-secondary" onClick={handleExportToJson}>Export to JSON</button>
                <label className="btn btn-secondary">
                    <i className="fas fa-upload"></i> JSON Import
                    <input type="file" accept=".json" onChange={handleImportFromJson} className="sr-only" />
                </label>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
            >
                <table className="event-table">
                    <thead>
                    <tr>
                        <th className="col-handle"></th>
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
                    <SortableContext items={events.map(e => e.id)} strategy={verticalListSortingStrategy}>
                        <tbody>
                        {events.map((event, index) => {
                            const prevDate = index > 0 ? events[index - 1].date : null;
                            const hasDateConflict = !!(event.date && prevDate && event.date < prevDate);
                            return <EventRow
                                key={event.id}
                                event={event}
                                index={index}
                                hasDateConflict={hasDateConflict}
                                handleChange={handleChange}
                                deleteRow={deleteRow}
                            />;
                        })}
                        </tbody>
                    </SortableContext>
                </table>
            </DndContext>
        </div>
    );
};

export default EventTable;

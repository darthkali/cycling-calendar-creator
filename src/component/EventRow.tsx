import React from 'react';
import Event from '../types/Event.ts';
import {EventType} from '../types/EventType.ts';
import DatePicker from 'react-datepicker';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type EventRowProps = {
    event: Event;
    index: number;
    hasDateConflict: boolean;
    handleChange: (index: number, field: keyof Event, value: unknown) => void;
    deleteRow: (index: number) => void;
};

const EventRow: React.FC<EventRowProps> = ({ event, index, hasDateConflict, handleChange, deleteRow }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: event.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className={`${isDragging ? 'drag-row-active' : ''}${hasDateConflict ? ' date-conflict' : ''}`}>
            <td>
                <button
                    className="drag-handle"
                    {...attributes}
                    {...listeners}
                    type="button"
                    tabIndex={-1}
                >
                    <i className="fas fa-grip-vertical"></i>
                </button>
            </td>
            <td>
                <input
                    type="text"
                    className="input-stage input"
                    value={event.stage}
                    disabled
                />
            </td>
            <td className="date-cell">
                <DatePicker
                    selected={event.date}
                    onChange={(date: Date | null) => handleChange(index, 'date', date)}
                    dateFormat="dd.MM.yyyy"
                    placeholderText="00.00.0000"
                    locale="en-GB"
                    className={`input-date input${hasDateConflict ? ' input-warning' : ''}`}
                />
                {hasDateConflict && <span className="date-conflict-icon" data-tooltip="Datum liegt vor der vorherigen Etappe">⚠️</span>}
            </td>
            <td>
                <DatePicker
                    selected={event.startTime}
                    onChange={(time: Date | null) => handleChange(index, 'startTime', time)}
                    showTimeSelect
                    showTimeSelectOnly
                    placeholderText="00:00"
                    timeIntervals={5}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    locale="en-GB"
                    className="input-start-time input"
                />
            </td>
            <td>
                <DatePicker
                    selected={event.endTime}
                    onChange={(time: Date | null) => handleChange(index, 'endTime', time)}
                    showTimeSelect
                    showTimeSelectOnly
                    placeholderText="00:00"
                    timeIntervals={5}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    locale="en-GB"
                    className="input-end-time input"
                />
            </td>
            <td>
                <input
                    type="text"
                    className="input-from input"
                    placeholder={"Berlin"}
                    value={event.from}
                    onChange={(e) => handleChange(index, 'from', e.target.value)}
                />
            </td>
            <td>
                <input
                    type="text"
                    className="input-to input"
                    placeholder={"Paris"}
                    value={event.to}
                    onChange={(e) => handleChange(index, 'to', e.target.value)}
                />
            </td>
            <td>
                <input
                    type="text"
                    className="input-kilometers input"
                    placeholder={"0"}
                    value={event.kilometers}
                    onChange={(e) => handleChange(index, 'kilometers', e.target.value)}
                />
            </td>
            <td>
                <select
                    className="input-type input"
                    value={event.type}
                    onChange={(e) => handleChange(index, 'type', e.target.value)}
                >
                    <option key={'nothing'} value={'nothing'}>{}</option>
                    {Object.values(EventType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </td>
            <td>
                <input
                    type="checkbox"
                    className="input-mountain-finish checkbox"
                    checked={event.mountainFinish}
                    onChange={(e) => handleChange(index, 'mountainFinish', e.target.checked)}
                />
            </td>
            <td>
                <button onClick={() => deleteRow(index)} className="btn btn-danger-ghost btn-icon btn-sm">
                    <i className="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    );
};

export default EventRow;

import React from 'react';
import Event from '../types/Event.ts';
import {EventType} from '../types/EventType.ts';
import DatePicker from 'react-datepicker';
import './EventRow.css';

type EventRowProps = {
    event: Event;
    index: number;
    handleChange: (index: number, field: keyof Event, value: any) => void;
    deleteRow: (index: number) => void;
};

const EventRow: React.FC<EventRowProps> = ({ event, index, handleChange, deleteRow }) => {
    return (
        <tr key={index}>
            <td>
                <input
                    type="text"
                    className="input-stage input-common"
                    value={event.stage}
                    onChange={(e) => handleChange(index, 'stage', e.target.value)}
                />
            </td>
            <td>
                <DatePicker
                    selected={event.date}
                    onChange={(date) => handleChange(index, 'date', date)}
                    dateFormat="dd.MM.yyyy"
                    placeholderText="00.00.0000"
                    locale="en-GB"
                    className="input-date input-common"
                />
            </td>
            <td>
                <DatePicker
                    selected={event.startTime}
                    onChange={(time) => handleChange(index, 'startTime', time)}
                    showTimeSelect
                    showTimeSelectOnly
                    placeholderText="00:00"
                    timeIntervals={5}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    locale="en-GB"
                    className="input-start-time input-common"
                />
            </td>
            <td>
                <DatePicker
                    selected={event.endTime}
                    onChange={(time) => handleChange(index, 'endTime', time)}
                    showTimeSelect
                    showTimeSelectOnly
                    placeholderText="00:00"
                    timeIntervals={5}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    locale="en-GB"
                    className="input-end-time input-common"
                />
            </td>
            <td>
                <input
                    type="text"
                    className="input-from input-common"
                    placeholder={"Berlin"}
                    value={event.from}
                    onChange={(e) => handleChange(index, 'from', e.target.value)}
                />
            </td>
            <td>
                <input
                    type="text"
                    className="input-to input-common"
                    placeholder={"Paris"}
                    value={event.to}
                    onChange={(e) => handleChange(index, 'to', e.target.value)}
                />
            </td>
            <td>
                <input
                    type="text"
                    className="input-kilometers input-common"
                    placeholder={"0"}
                    value={event.kilometers}
                    onChange={(e) => handleChange(index, 'kilometers', e.target.value)}
                />
            </td>
            <td>
                <select
                    className="input-type input-common"
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
                    className="input-mountain-finish input-common"
                    checked={event.mountainFinish}
                    onChange={(e) => handleChange(index, 'mountainFinish', e.target.checked)}
                />
            </td>
            <td>
                <button onClick={() => deleteRow(index)} className="delete">
                    <i className="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    );
};

export default EventRow;

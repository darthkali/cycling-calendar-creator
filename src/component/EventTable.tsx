import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './EventTable.css';

enum EventType {
    HILL = 'Huegeletappe',
    FLAT = 'Flachetappe',
    MOUNTAIN = 'Bergetappe'
}

type Event = {
    stage: string;
    date: Date | null;
    startTime: Date | null;
    endTime: Date | null;
    from: string;
    to: string;
    kilometers: string;
    type: EventType;
    mountainFinish: boolean;
};

const EventTable = () => {
    const [events, setEvents] = useState<Event[]>([
        { stage: '1', date: null, startTime: null, endTime: null, from: '', to: '', kilometers: '', type: EventType.HILL, mountainFinish: false }
    ]);

    useEffect(() => {
        if (events.length === 0) {
            setEvents([{ stage: '1', date: null, startTime: null, endTime: null, from: '', to: '', kilometers: '', type: EventType.HILL, mountainFinish: false }]);
        }
    }, [events]);

    const handleChange = (index: number, field: keyof Event, value: any) => {
        const newEvents = [...events];
        newEvents[index][field] = value;
        setEvents(newEvents);
    };

    const addRow = () => {
        const lastEvent = events[events.length - 1];
        const newDate = lastEvent && lastEvent.date ? new Date(lastEvent.date.getTime() + 86400000) : null; // Add one day (86400000 ms)
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
            startTime: lastEvent ? lastEvent.startTime : null,
            endTime: lastEvent ? lastEvent.endTime : null,
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

    const exportToICS = () => {
        // Implement .ics export logic here
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div>
                <table>
                    <thead>
                    <tr>
                        <th>Etappe</th>
                        <th>Datum</th>
                        <th>Uhrzeit start</th>
                        <th>Uhrzeit Ende</th>
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
                        <tr key={index}>
                            <td>
                                <input
                                    type="text"
                                    value={event.stage}
                                    onChange={(e) => handleChange(index, 'stage', e.target.value)}
                                />
                            </td>
                            <td>
                                <DatePicker
                                    selected={event.date}
                                    onChange={(date) => handleChange(index, 'date', date)}
                                    dateFormat="dd.MM.yyyy"
                    placeholderText="Datum wählen"
                                />
                            </td>
                            <td>
                                <TimePicker
                                    value={event.startTime}
                                    onChange={(time) => handleChange(index, 'startTime', time)}
                                    ampm={false}
                                />
                            </td>
                            <td>
                                <TimePicker
                                    value={event.endTime}
                                    onChange={(time) => handleChange(index, 'endTime', time)}
                                    ampm={false}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={event.from}
                                    onChange={(e) => handleChange(index, 'from', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={event.to}
                                    onChange={(e) => handleChange(index, 'to', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={event.kilometers}
                                    onChange={(e) => handleChange(index, 'kilometers', e.target.value)}
                                />
                            </td>
                            <td>
                                <select
                                    value={event.type}
                                    onChange={(e) => handleChange(index, 'type', e.target.value)}
                                >
                                    {Object.values(EventType).map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={event.mountainFinish}
                                    onChange={(e) => handleChange(index, 'mountainFinish', e.target.checked)}
                                />
                            </td>
                            <td>
                                <button onClick={() => deleteRow(index)} className="delete">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <button onClick={addRow}>Add Row</button>
                <button onClick={exportToICS}>Export to .ics</button>
            </div>
        </LocalizationProvider>
    );
};

export default EventTable;
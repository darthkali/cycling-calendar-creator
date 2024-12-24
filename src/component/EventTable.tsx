import {useState, useEffect} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {registerLocale} from 'react-datepicker';
import enGB from 'date-fns/locale/en-GB';
import './EventTable.css';

registerLocale('en-GB', enGB);

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
        {
            stage: '1',
            date: null,
            startTime: null,
            endTime: null,
            from: '',
            to: '',
            kilometers: '',
            type: EventType.HILL,
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
                type: EventType.HILL,
                mountainFinish: false
            }]);
        }
    }, [events]);

    const handleChange = (index: number, field: keyof Event, value: any) => {
        const newEvents = [...events];
        newEvents[index][field] = value;
        setEvents(newEvents);
    };

    const areRequiredFieldsFilled = (event: Event) => {
        return event.date && event.startTime && event.endTime;
    };

    const addRow = () => {
        const lastEvent = events[events.length - 1];
        if (!areRequiredFieldsFilled(lastEvent)) {
            if (!window.confirm('Du hast Datum, Startzeit und oder Endzeit in der letzten Zeile nicht ausfefüllt. Das solltest du aber tun, da es dir das ausfüllen erleichtert. Willst du dennoch eine neue Zeile einfügen?')) {
                return;
            }
        }

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
                ))}
                </tbody>
            </table>
            <button onClick={addRow}>Add Row</button>
            <button onClick={exportToICS}>Export to .ics</button>
        </div>
    );
};

export default EventTable;
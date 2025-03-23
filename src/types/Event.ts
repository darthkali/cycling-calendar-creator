import {EventType} from './EventType';

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

export default Event;

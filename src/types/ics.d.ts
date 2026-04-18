import { DateTime } from '../utils/DateTime';

export interface EventAttributes {
    title: string;
    start: DateTime;
    end: DateTime;
    description?: string;
    location?: string;
}

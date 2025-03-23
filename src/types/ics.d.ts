// src/types/ics.d.ts
import { DateTime } from '../utils/DateTime';

export interface EventAttributes {
    title: string;
    start: DateTime;
    end: DateTime;
    description?: string;
    location?: string;
    // Weitere Eigenschaften nach Bedarf
}

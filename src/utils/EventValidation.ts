// src/utils/EventValidation.ts
import Event from '../types/Event';

export const areRequiredFieldsFilled = (event: Event): boolean => {
    return Boolean(event.date && event.startTime && event.endTime);
};

export const areAllEventRequiredFieldsFilled = (events: Event[]): boolean => {
    return events.every(event => areRequiredFieldsFilled(event));
};

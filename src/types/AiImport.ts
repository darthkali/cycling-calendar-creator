import { EventType } from './EventType';

export type ParsedStage = {
    stage?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    from?: string;
    to?: string;
    kilometers?: string;
    type?: EventType;
    mountainFinish?: boolean;
};

export type ImportError =
    | 'NO_API_KEY'
    | 'INVALID_API_KEY'
    | 'RATE_LIMITED'
    | 'TIMEOUT'
    | 'NO_STAGES_FOUND'
    | 'PARSE_ERROR'
    | 'NETWORK_ERROR';

export type ImportResult =
    | { success: true; name: string; description: string; stages: ParsedStage[] }
    | { success: false; error: ImportError };

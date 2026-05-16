export type EventDef = {
    uri:       string
    label:     string
    subreddit: string
    language:  string
    region:    string
    dateFrom:  string  // YYYY-MM-DD
    dateTo:    string  // YYYY-MM-DD
}

export const EVENTS: EventDef[] = [
    {
        uri:       'http://narratives.poc/event/blm-denmark-2020',
        label:     'BLM Denmark 2020',
        subreddit: 'BlackLivesMatter',
        language:  'en',
        region:    'DK',
        dateFrom:  '2020-05-25',
        dateTo:    '2021-01-01',
    },
    {
        uri:       'http://narratives.poc/event/maui-fires-2023',
        label:     'Maui Fires 2023',
        subreddit: 'maui',
        language:  'en',
        region:    'US',
        dateFrom:  '2023-08-08',
        dateTo:    '2024-01-01',
    },
    {
        uri:       'http://narratives.poc/event/Greenland',
        label:     'Greenland',
        subreddit: 'greenland',
        language:  'en',
        region:    'GLOBAL',
        dateFrom:  '2025-01-01',
        dateTo:    '2025-03-01',
    },
]

export const EVENT_BY_LABEL = Object.fromEntries(EVENTS.map(e => [e.label, e]))
export const EVENT_BY_URI   = Object.fromEntries(EVENTS.map(e => [e.uri,   e]))

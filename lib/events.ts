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
        uri:       'http://narratives.poc/event/gaza-2024',
        label:     'Gaza 2024',
        subreddit: 'IsraelPalestine',
        language:  'en',
        region:    'GLOBAL',
        dateFrom:  '2023-10-07',
        dateTo:    '2025-01-01',
    },
    {
        uri:       'http://narratives.poc/event/ukraine-2022',
        label:     'Ukraine 2022',
        subreddit: 'ukraine',
        language:  'en',
        region:    'GLOBAL',
        dateFrom:  '2022-02-24',
        dateTo:    '2023-01-01',
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

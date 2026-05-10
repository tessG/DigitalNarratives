export type EventDef = {
    uri:       string
    label:     string
    subreddit: string
    language:  string
    region:    string
}

export const EVENTS: EventDef[] = [
    {
        uri:       'http://narratives.poc/event/blm-denmark-2020',
        label:     'BLM Denmark 2020',
        subreddit: 'BlackLivesMatter',
        language:  'en',
        region:    'DK',
    },
    {
        uri:       'http://narratives.poc/event/gaza-2024',
        label:     'Gaza 2024',
        subreddit: 'IsraelPalestine',
        language:  'en',
        region:    'GLOBAL',
    },
    {
        uri:       'http://narratives.poc/event/ukraine-2022',
        label:     'Ukraine 2022',
        subreddit: 'ukraine',
        language:  'en',
        region:    'GLOBAL',
    },
]

export const EVENT_BY_LABEL = Object.fromEntries(EVENTS.map(e => [e.label, e]))
export const EVENT_BY_URI   = Object.fromEntries(EVENTS.map(e => [e.uri,   e]))

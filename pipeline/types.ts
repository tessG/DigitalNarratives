export type Post = {
    id:        string    // e.g. "reddit_abc123"
    platform:  'reddit'
    subreddit: string
    content:   string   // title + selftext joined
    date:      string   // YYYY-MM-DD
    url:       string
    score:     number
    eventUri:  string   // e.g. "http://narratives.poc/event/blm-denmark-2020"
    language:  string   // ISO 639-1, e.g. "en"
    region:    string   // ISO 3166-1 alpha-2 or "GLOBAL"
}

export type AnnotatedPost = Post & {
    tags: string[]      // full URIs, e.g. "http://narratives.poc/ontology#Hero"
}

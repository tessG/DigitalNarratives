export type Post = {
    id: string           // e.g. "reddit_abc123"
    platform: 'reddit'
    subreddit: string
    content: string      // title + selftext joined
    date: string         // YYYY-MM-DD
    url: string
    score: number
}

export type AnnotatedPost = Post & {
    tags: string[]       // full URIs, e.g. "http://narratives.poc/ontology#Hero"
}

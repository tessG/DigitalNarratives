import * as fs from 'fs'
import * as path from 'path'
import { EVENT_BY_URI } from '../lib/events'
import type { AnnotatedPost } from './types'

loadEnv()

const ANNOTATED_PATH = path.join(process.cwd(), 'pipeline', 'data', 'annotated.json')
const POST_BASE      = 'http://narratives.poc/post/'
const ANN_BASE       = 'http://narratives.poc/annotation/'
const EVENT_BASE     = 'http://narratives.poc/event/'
const NAR            = 'http://narratives.poc/ontology#'
const BATCH_SIZE     = 20

function sparqlEscape(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
}

function buildInsert(posts: AnnotatedPost[], eventUris: Set<string>): string {
    const triples: string[] = []

    // Event nodes (one per unique event in this batch)
    for (const uri of eventUris) {
        const def = EVENT_BY_URI[uri]
        if (!def) continue
        triples.push(
            `<${uri}> a <${NAR}Event> ;`,
            `  <http://www.w3.org/2000/01/rdf-schema#label> "${def.label}" .`,
        )
    }

    for (const post of posts) {
        const postUri = `<${POST_BASE}${post.id}>`
        triples.push(
            `${postUri} a <${NAR}Post> ;`,
            `  <${NAR}content>  "${sparqlEscape(post.content)}" ;`,
            `  <${NAR}date>     "${post.date}" ;`,
            `  <${NAR}platform> "${post.platform}" ;`,
            `  <${NAR}language> "${post.language}" ;`,
            `  <${NAR}region>   "${post.region}" ;`,
            `  <${NAR}event>    <${post.eventUri}> .`,
        )

        post.tags.forEach((tagUri, i) => {
            const annUri = `<${ANN_BASE}${post.id}_${i}>`
            triples.push(
                `${annUri} a <${NAR}Annotation> ;`,
                `  <${NAR}post> ${postUri} ;`,
                `  <${NAR}tag>  <${tagUri}> .`,
            )
        })
    }

    return `INSERT DATA {\n${triples.join('\n')}\n}`
}

async function sparqlUpdate(update: string): Promise<void> {
    const { GRAPHDB_URL, GRAPHDB_REPO } = process.env
    if (!GRAPHDB_URL || !GRAPHDB_REPO) throw new Error('Set GRAPHDB_URL and GRAPHDB_REPO in .env.local')

    const res = await fetch(`${GRAPHDB_URL}/repositories/${GRAPHDB_REPO}/statements`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    `update=${encodeURIComponent(update)}`,
    })
    if (!res.ok) throw new Error(`GraphDB update failed: ${res.status} ${await res.text()}`)
}

async function main() {
    if (!fs.existsSync(ANNOTATED_PATH)) throw new Error(`Run annotate.ts first — ${ANNOTATED_PATH} not found`)

    const posts: AnnotatedPost[] = JSON.parse(fs.readFileSync(ANNOTATED_PATH, 'utf-8'))
    const withTags = posts.filter(p => p.tags.length > 0)
    console.log(`${posts.length} posts, ${withTags.length} have tags — ingesting in batches of ${BATCH_SIZE}…`)

    for (let i = 0; i < withTags.length; i += BATCH_SIZE) {
        const batch = withTags.slice(i, i + BATCH_SIZE)
        const eventUris = new Set(batch.map(p => p.eventUri))
        const update = buildInsert(batch, eventUris)
        await sparqlUpdate(update)
        process.stdout.write(`\r  ${Math.min(i + BATCH_SIZE, withTags.length)}/${withTags.length} ingested…`)
    }

    console.log(`\nDone. ${withTags.length} posts loaded into GraphDB.`)
}

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) return
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        const val = trimmed.slice(eq + 1).trim()
        if (key && !(key in process.env)) process.env[key] = val
    }
}

main().catch(err => { console.error(err.message); process.exit(1) })

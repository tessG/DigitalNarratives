import * as fs from 'fs'
import * as path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { TAGS, ontologyPrompt } from './ontology'
import type { Post, AnnotatedPost } from './types'

loadEnv()

const DATA_DIR       = path.join(process.cwd(), 'pipeline', 'data')
const POSTS_PATH     = path.join(DATA_DIR, 'posts.json')
const ANNOTATED_PATH = path.join(DATA_DIR, 'annotated.json')

const TAG_URIS   = new Set(TAGS.map(t => t.uri))
const TAG_LABELS = Object.fromEntries(TAGS.map(t => [t.label.toLowerCase().replace(/\s+/g, ''), t.uri]))

const SYSTEM_PROMPT = `You annotate social media posts using a narrative analysis ontology.

${ontologyPrompt()}

Respond with a JSON object: { "tags": ["<label>", ...] }
Only include tags that are clearly present in the post. Use exact label names from the ontology.
An empty array is valid if no tags apply. Output only the JSON object, no explanation.`

async function annotatePost(client: Anthropic, post: Post): Promise<string[]> {
    const msg = await client.messages.create({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: post.content.slice(0, 2000) }],
    })

    const text = msg.content.find(b => b.type === 'text')?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return []

    try {
        const { tags } = JSON.parse(match[0]) as { tags: string[] }
        return (tags ?? []).flatMap(label => {
            const normalized = label.toLowerCase().replace(/\s+/g, '')
            if (TAG_URIS.has(label)) return [label]
            if (TAG_LABELS[normalized]) return [TAG_LABELS[normalized]]
            return []
        })
    } catch {
        return []
    }
}

async function main() {
    if (!fs.existsSync(POSTS_PATH)) throw new Error(`Run scrape.ts first — ${POSTS_PATH} not found`)

    const posts: Post[] = JSON.parse(fs.readFileSync(POSTS_PATH, 'utf-8'))

    // Resume: load any already-annotated posts
    const existing: AnnotatedPost[] = fs.existsSync(ANNOTATED_PATH)
        ? JSON.parse(fs.readFileSync(ANNOTATED_PATH, 'utf-8'))
        : []
    const done = new Set(existing.map(p => p.id))

    const todo = posts.filter(p => !done.has(p.id))
    console.log(`${posts.length} posts total, ${done.size} already annotated, ${todo.length} to process`)

    if (todo.length === 0) { console.log('Nothing to do.'); return }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const results: AnnotatedPost[] = [...existing]

    for (let i = 0; i < todo.length; i++) {
        const post = todo[i]
        process.stdout.write(`\r  [${i + 1}/${todo.length}] ${post.id}…`)
        const tags = await annotatePost(client, post)
        results.push({ ...post, tags })

        // Write after every 10 posts so progress survives interruption
        if ((i + 1) % 10 === 0 || i === todo.length - 1) {
            fs.writeFileSync(ANNOTATED_PATH, JSON.stringify(results, null, 2))
        }

        await new Promise(r => setTimeout(r, 300))
    }

    console.log(`\nWrote ${results.length} annotated posts → ${ANNOTATED_PATH}`)
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

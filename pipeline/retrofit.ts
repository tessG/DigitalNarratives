/**
 * Retrofits existing posts in GraphDB to the event-aware data model.
 * Links all posts that lack nar:event to the BLM Denmark 2020 event,
 * and patches in language/region defaults for the same posts.
 *
 * Safe to re-run: FILTER NOT EXISTS guards prevent double-patching.
 */
import * as fs from 'fs'
import * as path from 'path'
import { EVENT_BY_LABEL } from '../lib/events'

loadEnv()

const NAR = 'http://narratives.poc/ontology#'
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const BLM = EVENT_BY_LABEL['BLM Denmark 2020']

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
    if (!BLM) throw new Error('BLM Denmark 2020 not found in event registry')

    console.log('Creating BLM event node…')
    await sparqlUpdate(`
        PREFIX nar:  <${NAR}>
        PREFIX rdfs: <${RDFS}>
        INSERT DATA {
            <${BLM.uri}> a nar:Event ;
                rdfs:label "${BLM.label}" .
        }
    `)

    console.log('Linking untagged posts to BLM event…')
    await sparqlUpdate(`
        PREFIX nar: <${NAR}>
        INSERT {
            ?post nar:event    <${BLM.uri}> ;
                  nar:language "${BLM.language}" ;
                  nar:region   "${BLM.region}" .
        }
        WHERE {
            ?post a nar:Post .
            FILTER NOT EXISTS { ?post nar:event ?any }
        }
    `)

    console.log('Done — all existing posts linked to BLM Denmark 2020.')
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

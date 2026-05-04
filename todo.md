# Vibe coding session — Narrative Fingerprint Explorer

## 1. Domain exploration
- Read and discussed the ELIAS job posting at Pioneer Centre for AI
- Explored what "infrastructure for digital narratives" means
- Discussed the difference between social media narratives and literary narratives
- Established that the unit of analysis is a pattern across posts — a situated subgraph — not a single post

## 2. Narrative theory grounding
- Discussed Lakoff, Entman, Greimas, Propp, Labov, Herman, Ryan, Fludernik, Benedict Anderson
- Established why narrative knowledge is intuitive in the same way spatial knowledge is
- Discussed the DETR image placement model as an analogy for AI-suggests / human-validates annotation

## 3. POC scoping
- Defined the POC as a narrative fingerprint explorer for a single event
- Chose the Bwalya Sørensen / BLM Denmark event (2020–2025) as the corpus
- Decided on manual annotation for the POC, no AI pipeline yet

## 4. Ontology design
- Defined four abstract layer concepts: `NarrativeRole`, `FramingFunction`, `AffectiveRegister`, `CausalStructure`
- Chose two theories: Greimas (actantial model) and Entman (framing theory)
- Mapped concrete theory nodes under each abstract concept
- Decided on a three-layer graph: abstract → theory → data (posts + annotations)
- Decided to keep everything in one graph rather than separate stores
- Chose to make `Annotation` a first-class node rather than a bare edge, to carry metadata

## 5. Turtle file
- Wrote the full ontology in Turtle (RDF) format
- Included abstract layer, theory layer, 10 sample posts, and annotations
- Added 3 ambivalent posts in a second Turtle file to enable tension queries

## 6. Infrastructure setup
- Created a DigitalOcean droplet (Ubuntu 24, 2GB RAM, Basic plan)
- Installed Docker
- Pulled and ran GraphDB Free in a Docker container
- Added swap space to work around memory constraints on the 2GB droplet
- Created a `narratives` repository in the GraphDB workbench
- Loaded both Turtle files into the default graph via the import tool

## 7. SPARQL query layer
- Wrote and tested queries directly in the GraphDB workbench:
    - Tag frequency ranking
    - Posts by tag
    - Tag co-occurrence
    - Most narratively complex posts
    - Frame shift over time (SystemicCause vs IndividualCause across the timeline)
    - Tension query (posts with contradictory narrative frames)
- Learned the annotation-as-pivot pattern: start at the annotation node, reach left to the ontology, reach right to the post

## 8. Next.js project setup
- Created a Next.js project locally (App Router, TypeScript, Tailwind)
- Added `.env.local` with GraphDB URL and repository name
- Confirmed GraphDB is queryable from the local machine over HTTP

## 9. API routes
- Created `/api/tag-frequency` — tag frequency ranking
- Created `/api/posts-by-tag` — posts filtered by tag label
- Created `/api/cooccurrence` — co-occurring tag pairs
- Created `/api/temporal-arc` — frame shift over time
- Created `/api/tension-posts` — posts with contradictory frames
- Identified shared boilerplate across routes (candidate for `lib/sparql.ts` refactor)

## 10. Dashboard UI
- Designed a four-cell grid layout with an event selector in the header
- Built the layout in `page.tsx` with inline styles matching the mockup
- Wired all four cells to their respective API routes
- Added proportional inline bars to the tag frequency cell
- Added a stacked bar chart for the temporal arc cell
- Added European date formatting (DD/MM/YYYY)
- Added a "contradictory" badge to tension posts

## 11. Documentation
- Wrote `README.md` covering the concept, architecture, ontology, stack, and next steps
- Named the repo description: *POC for a narrative fingerprint explorer — a graph-based infrastructure for annotating and analysing digital narratives on social media*
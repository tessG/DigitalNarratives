# Narrative Fingerprint Explorer

POC for a narrative fingerprint explorer — a graph-based infrastructure for annotating and analysing digital narratives on social media.

## What it does

This project explores what it would look like to build infrastructure for computational narrative analysis. Given a corpus of social media posts about a real-world event, the system surfaces how that event is collectively framed — which narrative roles are activated, what causal logic dominates, how the emotional register shifts over time, and where ambivalent or contradictory posts sit in the corpus.

The current dataset covers the Bwalya Sørensen / BLM Denmark event (2020–2025) across 13 annotated posts.

## Concept

A **narrative fingerprint** is the combined picture of how a society narrativises a specific event. It is not a single measurement but the aggregate of several:

- **Tag frequency** — which narrative concepts appear most often
- **Frame shift over time** — how the dominant causal frame evolves across the timeline
- **Co-occurrence** — which concepts cluster together consistently
- **Tension posts** — posts that hold contradictory narrative frames simultaneously

Together these constitute a fingerprint of collective sense-making around an event.

## Architecture

```
GraphDB (RDF triple store)
    ↑ SPARQL over HTTP
Next.js API routes
    ↑ JSON
Next.js React dashboard
```

## Ontology

The knowledge graph has three layers:

**Abstract layer** — theory-agnostic root concepts that serve as stable anchors for cross-cultural and cross-linguistic comparison:
- `NarrativeRole`
- `FramingFunction`
- `AffectiveRegister`
- `CausalStructure`

**Theory layer** — concrete concepts drawn from narrative and framing theory, hanging off the abstract layer:
- Narrative roles from Greimas' actantial model (Hero, Villain, Victim, Helper, Opponent, Sender)
- Framing functions from Entman's framing theory (ProblemDefinition, CausalAttribution, MoralJudgement, RemedySuggestion)
- Affective registers drawn from affect theory (Outrage, Solidarity, Disgust, Fear, Shame)
- Causal structures drawn from argumentation theory (SystemicCause, IndividualCause, ExternalCause)

**Data layer** — social media posts and their annotations, connected to theory nodes through intermediate annotation nodes that carry metadata (annotator, validation status).

The ontology is written in Turtle (RDF) and loaded into GraphDB.

## Stack

- **GraphDB** — RDF triple store, running in Docker on DigitalOcean
- **SPARQL** — query language for the graph
- **Next.js** (App Router) — API routes and React frontend
- **TypeScript**
- **Tailwind CSS**

## Running locally

GraphDB must be running and accessible. Set the following in `.env.local`:

```
GRAPHDB_URL=http://your-graphdb-host:7200
GRAPHDB_REPO=narratives
```

Load `narrative_ontology.ttl` and `ambivalent_posts.ttl` into your GraphDB repository via the workbench import tool.

Then:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What's next

- Annotator wizard — a step-by-step UI for validating AI-suggested tags post by post
- Claude API pipeline — pre-annotation of posts using a researcher-configured theoretical lens derived from the ontology
- Real post data — replacing paraphrased sample posts with scraped social media content
- Multiple events — so the event selector actually switches between corpora
- Refactor shared SPARQL boilerplate into `lib/sparql.ts`

## Background

Built in one day as a learning project exploring RDF ontology design, SPARQL query patterns, graph theory applied to narrative analysis, and Next.js. Informed by narrative theory (Greimas, Entman, Labov, Herman) and the research agenda of computational narrative analysis.
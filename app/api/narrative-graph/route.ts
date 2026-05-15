import { sparqlQuery } from '@/lib/sparql'

const ABSTRACT_NODES = [
    { uri: 'http://narratives.poc/ontology#NarrativeRole',     label: 'Narrative Role' },
    { uri: 'http://narratives.poc/ontology#FramingFunction',   label: 'Framing Function' },
    { uri: 'http://narratives.poc/ontology#AffectiveRegister', label: 'Affective Register' },
    { uri: 'http://narratives.poc/ontology#CausalStructure',   label: 'Causal Structure' },
]

type TheoryBinding = {
    node:   { value: string }
    label:  { value: string }
    parent: { value: string }
    count:  { value: string }
}

type CoocBinding = {
    tagA:    { value: string }
    tagB:    { value: string }
    coCount: { value: string }
}

export async function GET(request: Request) {
    const eventUri    = new URL(request.url).searchParams.get('event') ?? ''
    const eventFilter = eventUri ? `?ann nar:post ?post . ?post nar:event <${eventUri}> .` : ''
    const coocFilter  = eventUri ? `?post nar:event <${eventUri}> .` : ''

    try {
        const [theoryBindings, coocBindings] = await Promise.all([
            sparqlQuery(`
                PREFIX nar:  <http://narratives.poc/ontology#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

                SELECT ?node ?label ?parent (COUNT(DISTINCT ?ann) AS ?count) WHERE {
                    ?node a ?parent .
                    FILTER(?parent IN (
                        nar:NarrativeRole, nar:FramingFunction,
                        nar:AffectiveRegister, nar:CausalStructure
                    ))
                    ?node rdfs:label ?label .
                    OPTIONAL {
                        ?ann nar:tag ?node .
                        ${eventFilter}
                    }
                }
                GROUP BY ?node ?label ?parent
            `),
            sparqlQuery(`
                PREFIX nar: <http://narratives.poc/ontology#>

                SELECT ?tagA ?tagB (COUNT(DISTINCT ?post) AS ?coCount) WHERE {
                    ?ann1 nar:post ?post ; nar:tag ?tagA .
                    ?ann2 nar:post ?post ; nar:tag ?tagB .
                    FILTER(str(?tagA) < str(?tagB))
                    ${coocFilter}
                }
                GROUP BY ?tagA ?tagB
                ORDER BY DESC(?coCount)
            `),
        ])

        const theoryNodes = (theoryBindings as TheoryBinding[]).map(b => ({
            uri:    b.node.value,
            label:  b.label.value,
            parent: b.parent.value,
            count:  parseInt(b.count.value),
        }))

        const abstractNodes = ABSTRACT_NODES.map(a => ({
            ...a,
            parent: null,
            count: theoryNodes
                .filter(n => n.parent === a.uri)
                .reduce((sum, n) => sum + n.count, 0),
        }))

        const nodes    = [...abstractNodes, ...theoryNodes]
        const nodeUris = new Set(nodes.map(n => n.uri))

        const hierarchyEdges = theoryNodes.map(n => ({
            source: n.parent,
            target: n.uri,
            weight: 1,
            type:   'hierarchy' as const,
        }))

        const coocEdges = (coocBindings as CoocBinding[])
            .filter(b => nodeUris.has(b.tagA.value) && nodeUris.has(b.tagB.value))
            .map(b => ({
                source: b.tagA.value,
                target: b.tagB.value,
                weight: parseInt(b.coCount.value),
                type:   'cooccurrence' as const,
            }))

        return Response.json({ nodes, edges: [...hierarchyEdges, ...coocEdges] })
    } catch (e) {
        return Response.json({ error: e instanceof Error ? e.message : 'unknown error' }, { status: 500 })
    }
}

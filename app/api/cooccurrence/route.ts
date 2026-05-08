import { sparqlQuery } from '@/lib/sparql'

type Binding = {
    labelA: { value: string }
    labelB: { value: string }
    coCount: { value: string }
}

export async function GET() {
    try {
        const bindings = await sparqlQuery(`
            PREFIX nar: <http://narratives.poc/ontology#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            SELECT ?labelA ?labelB (COUNT(?post) as ?coCount) WHERE {
              ?ann1 nar:post ?post ; nar:tag ?tagA .
              ?ann2 nar:post ?post ; nar:tag ?tagB .
              ?tagA rdfs:label ?labelA .
              ?tagB rdfs:label ?labelB .
              FILTER(str(?labelA) < str(?labelB))
            }
            GROUP BY ?labelA ?labelB
            ORDER BY DESC(?coCount)
        `)
        const results = bindings.map((b: Binding) => ({
            tagA: b.labelA.value,
            tagB: b.labelB.value,
            count: parseInt(b.coCount.value)
        }))
        return Response.json(results)
    } catch (e) {
        return Response.json({ error: e instanceof Error ? e.message : 'unknown error' }, { status: 500 })
    }
}

import { sparqlQuery } from '@/lib/sparql'

type Binding = {
    tagLabel: { value: string }
    count:    { value: string }
}

export async function GET(request: Request) {
    const eventUri   = new URL(request.url).searchParams.get('event') ?? ''
    const eventFilter = eventUri ? `?post nar:event <${eventUri}> .` : ''

    try {
        const bindings = await sparqlQuery(`
            PREFIX nar:  <http://narratives.poc/ontology#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            SELECT ?tagLabel (COUNT(?ann) as ?count) WHERE {
                ?ann a nar:Annotation ;
                     nar:tag ?tag ;
                     nar:post ?post .
                ?tag rdfs:label ?tagLabel .
                ${eventFilter}
            }
            GROUP BY ?tagLabel
            ORDER BY DESC(?count)
        `)
        const results = bindings.map((b: Binding) => ({
            tag:   b.tagLabel.value,
            count: parseInt(b.count.value),
        }))
        return Response.json(results)
    } catch (e) {
        return Response.json({ error: e instanceof Error ? e.message : 'unknown error' }, { status: 500 })
    }
}

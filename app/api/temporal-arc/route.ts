import { sparqlQuery } from '@/lib/sparql'

type Binding = {
    date:     { value: string }
    tagLabel: { value: string }
    count:    { value: string }
}

export async function GET(request: Request) {
    const eventUri    = new URL(request.url).searchParams.get('event') ?? ''
    const eventFilter = eventUri ? `?post nar:event <${eventUri}> .` : ''

    try {
        const bindings = await sparqlQuery(`
            PREFIX nar:  <http://narratives.poc/ontology#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            SELECT ?date ?tagLabel (COUNT(?ann) as ?count) WHERE {
                ?ann nar:post ?post ;
                     nar:tag  ?tag .
                ?post nar:date ?date .
                ?tag rdfs:label ?tagLabel .
                FILTER(?tag IN (nar:SystemicCause, nar:IndividualCause))
                ${eventFilter}
            }
            GROUP BY ?date ?tagLabel
            ORDER BY ?date
        `)
        const results = bindings.map((b: Binding) => ({
            date:  b.date.value,
            tag:   b.tagLabel.value,
            count: parseInt(b.count.value),
        }))
        return Response.json(results)
    } catch (e) {
        return Response.json({ error: e instanceof Error ? e.message : 'unknown error' }, { status: 500 })
    }
}

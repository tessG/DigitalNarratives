import { sparqlQuery } from '@/lib/sparql'

type Binding = {
    content: { value: string }
    date: { value: string }
    platform: { value: string }
}

export async function GET() {
    try {
        const bindings = await sparqlQuery(`
            PREFIX nar: <http://narratives.poc/ontology#>

            SELECT DISTINCT ?content ?date ?platform WHERE {
              {
                ?ann1 nar:post ?post ; nar:tag nar:Hero .
                ?ann2 nar:post ?post ; nar:tag nar:Disgust .
              } UNION {
                ?ann1 nar:post ?post ; nar:tag nar:Villain .
                ?ann2 nar:post ?post ; nar:tag nar:Solidarity .
              } UNION {
                ?ann1 nar:post ?post ; nar:tag nar:Hero .
                ?ann2 nar:post ?post ; nar:tag nar:Villain .
              }
              ?post nar:content ?content ;
                    nar:date ?date ;
                    nar:platform ?platform .
            }
            ORDER BY ?date
        `)
        const results = bindings.map((b: Binding) => ({
            content: b.content.value,
            date: b.date.value,
            platform: b.platform.value
        }))
        return Response.json(results)
    } catch (e) {
        return Response.json({ error: e instanceof Error ? e.message : 'unknown error' }, { status: 500 })
    }
}

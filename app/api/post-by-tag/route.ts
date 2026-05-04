import {sparqlQuery} from "@/lib/sparql";

type Binding = {
    content: { value: string }
    date: { value: string }
    platform: { value: string }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')

    const bindings = await sparqlQuery(`
        PREFIX nar: <http://narratives.poc/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT ?content ?date ?platform WHERE {
            ?ann nar:post ?post ;
                 nar:tag ?tagNode .
            ?tagNode rdfs:label "${tag}" .
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
}
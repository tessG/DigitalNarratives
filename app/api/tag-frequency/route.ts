type Binding = {
    tagLabel: { value: string }
    count: { value: string }
}

export async function GET() {
    const query = `
        PREFIX nar: <http://narratives.poc/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT ?tagLabel (COUNT(?ann) as ?count) WHERE {
            ?ann a nar:Annotation ;
                 nar:tag ?tag .
            ?tag rdfs:label ?tagLabel .
        }
        GROUP BY ?tagLabel
        ORDER BY DESC(?count)
    `

    const url = `${process.env.GRAPHDB_URL}/repositories/${process.env.GRAPHDB_REPO}`

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/sparql-results+json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: `query=${encodeURIComponent(query)}`
    })

    const data = await response.json()

    const results = data.results.bindings.map((b: Binding) => ({
        tag: b.tagLabel.value,
        count: parseInt(b.count.value)
    }))

    return Response.json(results)
}
export async function sparqlQuery(query: string) {
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
    return data.results.bindings
}
export async function sparqlQuery(query: string, retries = 3): Promise<any[]> {
    const url = `${process.env.GRAPHDB_URL}/repositories/${process.env.GRAPHDB_REPO}`
    let lastError: Error | null = null

    for (let attempt = 0; attempt < retries; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 500 * attempt))
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/sparql-results+json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                method: 'POST',
                body: `query=${encodeURIComponent(query)}`,
            })
            if (!response.ok) throw new Error(`GraphDB ${response.status}: ${await response.text()}`)
            const data = await response.json() as { results: { bindings: unknown[] } }
            return data.results.bindings
        } catch (e) {
            lastError = e instanceof Error ? e : new Error(String(e))
        }
    }

    throw lastError!
}

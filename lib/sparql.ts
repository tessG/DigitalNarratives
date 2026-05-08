import { cacheLife } from 'next/cache'

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
    if (!response.ok) {
        throw new Error(`GraphDB ${response.status}: ${await response.text()}`)
    }
    const data = await response.json()
    return data.results.bindings
}

export async function getTagFrequency(): Promise<{ tag: string; count: number }[]> {
    'use cache'
    cacheLife('hours')
    const bindings = await sparqlQuery(`
        PREFIX nar: <http://narratives.poc/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT ?tagLabel (COUNT(?ann) as ?count) WHERE {
            ?ann a nar:Annotation ;
                 nar:tag ?tag .
            ?tag rdfs:label ?tagLabel .
        }
        GROUP BY ?tagLabel
        ORDER BY DESC(?count)
    `)
    return bindings.map((b: { tagLabel: { value: string }; count: { value: string } }) => ({
        tag: b.tagLabel.value,
        count: parseInt(b.count.value)
    }))
}

export async function getCooccurrence(): Promise<{ tagA: string; tagB: string; count: number }[]> {
    'use cache'
    cacheLife('hours')
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
    return bindings.map((b: { labelA: { value: string }; labelB: { value: string }; coCount: { value: string } }) => ({
        tagA: b.labelA.value,
        tagB: b.labelB.value,
        count: parseInt(b.coCount.value)
    }))
}

export async function getTemporalArc(): Promise<{ date: string; tag: string; count: number }[]> {
    'use cache'
    cacheLife('hours')
    const bindings = await sparqlQuery(`
    PREFIX nar: <http://narratives.poc/ontology#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?date ?tagLabel (COUNT(?ann) as ?count) WHERE {
    ?ann nar:post ?post ;
         nar:tag ?tag .
    ?post nar:date ?date .
    ?tag rdfs:label ?tagLabel .
    FILTER(?tag IN (nar:SystemicCause, nar:IndividualCause))
    }
    GROUP BY ?date ?tagLabel
    ORDER BY ?date
  `)
    return bindings.map((b: { date: { value: string }; tagLabel: { value: string }; count: { value: string } }) => ({
        date: b.date.value,
        tag: b.tagLabel.value,
        count: parseInt(b.count.value)
    }))
}

export async function getTensionPosts(): Promise<{ content: string; date: string; platform: string }[]> {
    'use cache'
    cacheLife('hours')
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
    return bindings.map((b: { content: { value: string }; date: { value: string }; platform: { value: string } }) => ({
        content: b.content.value,
        date: b.date.value,
        platform: b.platform.value
    }))
}

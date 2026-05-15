export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return

    const ping = async () => {
        const url = `${process.env.GRAPHDB_URL}/repositories/${process.env.GRAPHDB_REPO}`
        if (!url.startsWith('http')) return
        try {
            await fetch(url, {
                method:  'POST',
                headers: {
                    'Accept':       'application/sparql-results+json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%201',
            })
        } catch {
            // keepalive — ignore failures
        }
    }

    await ping()
    setInterval(ping, 5 * 60 * 1000)
}

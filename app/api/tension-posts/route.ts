import { getTensionPosts } from '@/lib/sparql'

export async function GET() {
    try {
        const results = await getTensionPosts()
        return Response.json(results)
    } catch (e) {
        return Response.json({ error: e instanceof Error ? e.message : 'unknown error' }, { status: 500 })
    }
}

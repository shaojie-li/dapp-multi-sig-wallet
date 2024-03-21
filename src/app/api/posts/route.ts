import { getPosts, insertPost } from '@/model/posts';

export async function GET(req: Request) {
    const posts = await getPosts();
    return Response.json(posts);
}

export async function POST(req: Request) {
    const result = await insertPost();
    return Response.json(result);
}
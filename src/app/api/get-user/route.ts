import { users } from "@prisma/client";
import { getUsers, insertUser } from "@/model/user";

export async function GET(req: Request, res: Response) {
    const users = await getUsers();
    return Response.json(users)
} 

export async function POST() {
    const user: users = {
        email: '3029932838@qq.com',
        id: 5,
        nickname: null,
        avatar_url: null,
        uuid: 'c911c68c-372a-4134-a930-e813148def64',
        created_at: new Date(),
    }
    const result = await insertUser(user);

    return Response.json(result);
}
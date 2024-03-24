import { existsSync, promises } from 'fs'
import { join } from 'path'

export async function POST(req: Request, res: Response) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    // const hash = formData.get('hash')
    const name = formData.get('name') as string
    const offset = formData.get('offset') as string

    const fileBuffer = await file.arrayBuffer()
    // const ext = extname(name)
    const filename = join(process.cwd(), `public/${name}`)
    
    try {
        if (+offset) {
            if (!existsSync(filename)) {
                return Response.json(
                    {
                        success: false, message: "文件不存在",
                    },
                    { status: 400 }
                )
            }
            await promises.appendFile(filename, Buffer.from(fileBuffer));
            return Response.json(
                {
                    success: true, message: "appended", offset
                },
                { status: 200 }
            );
        } 
        await promises.writeFile(`${filename}`, Buffer.from(fileBuffer))
        return Response.json(
            {
                success: true, message: "created", offset
            },
            { status: 200 }
        );
    } catch (error: any) {
        return Response.json(
            { success: false, message: error.message },
            { status: 200 }
        )
    }
}

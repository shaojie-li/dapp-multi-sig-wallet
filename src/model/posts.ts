import { TestIfUppercase } from '@prisma/client';
import { prisma } from './prisma';

export const getPosts = async () => {
    const posts = await prisma.testIfUppercase.findMany({
        orderBy: {
            id: "asc"
        }
    });
    return posts;
}

export const insertPost = async () => {
    const post: TestIfUppercase = {
        id: 3,
        created_at: new Date(),
        content: "新闻内容3..."
    }
    const result = await prisma.testIfUppercase.create({
        data: post,
        select: {
            id: true,
            content: true,
        },
    })
    return result;
}
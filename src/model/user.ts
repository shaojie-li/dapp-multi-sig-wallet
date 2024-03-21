import { users } from "@prisma/client"
import { prisma } from "./prisma"

export const getUsers = async () => {
    const users = await prisma.users.findMany();
    return users;
}

export const insertUser = async (user: users) => {
    const result = await prisma.users.create({ data: user });
    return result;
}
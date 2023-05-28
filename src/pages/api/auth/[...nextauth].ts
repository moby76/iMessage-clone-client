import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()//PrismaClient - интерфейс/посредник между prisma и клиентом. Нужно сгенерировать при первом запуске приложения командой: npx prisma generate --schema=src/prisma/schema.prisma

export default NextAuth({
    adapter: PrismaAdapter(prisma),//Адаптер для связи с БД
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
              }
            }
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token, user }) {//user - это добавленные значения(?)
            // console.log('Inside Of SessionCallback');
            
            // // Send properties to the client, like an access_token and user id from a provider.
            // session.accessToken = token.accessToken
            // session.user.id = token.id

            // return { ...session, customProperty: 'Pavel' }
            //NOTE - вернуть в API смешанные вместе значения пользователя из сессии(name, email, image) и значения из БД(id, username)
            return { ...session, user: { ...session.user, ...user } }
        }
    }
})
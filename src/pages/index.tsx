// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'


import { Box } from "@chakra-ui/react"
import { Session } from "next-auth";
import type { NextPage, NextPageContext } from "next"; //NextPage тип typescript от nextjs для лучшего понимания что -тот компонент является страницей(?)

//Использование метода signIn() гарантирует, что пользователь вернется на страницу, с которой он начал, после завершения процесса входа.
//Чтобы выйти из системы, используйте метод signOut(), чтобы гарантировать, что пользователь вернется на страницу, с которой он начал, после завершения процесса выхода.
//Использование React Hook useSession() в клиенте NextAuth.js — лёгкий способ получить доступ к текущему аутентифицированному пользователю.
import { getSession, useSession } from 'next-auth/react'
import Auth from "../components/Auth/Auth"
import Chat from "../components/Chat/Chat"

//------------SECTION----------- - запуск сеанса/сессии для авторизации/выхода
const Home: NextPage = () => {
    const { data: session } = useSession()//Данные сеанса(), возвращаемые клиенту, не содержат конфиденциальной информации, такой как маркер сеанса или токены OAuth. Он содержит минимальную полезную нагрузку, которая включает в себя достаточно данных, необходимых для отображения информации на странице о пользователе, который вошел в систему для целей презентации (например, имя, адрес электронной почты, изображение).
    
    // console.log('Heare is SESSION', session)

    //Функция дя повторной перезагрузки сессии БЕЗ ПЕРЕЗАГРУЗКИ СТРАНИЦЫ если пользователь создал имя для ЧАТА
    const reloadSession = () => {
        const event = new Event("visibilitychange")//отслеживание  активности вкладки браузера(,)
        document.dispatchEvent(event)//сгенерировать содержимое окна браузера(document) по событию event --^
    }

    return (
        <Box>
            {/* Выведем кастомное имя пользователя из сеанса/сессии. Будет вывотиться при условии если оно создано  */}
            {/* {session?.user.username} */}
            {/* реализовать условие: если пользователь в системе  */}
            {session?.user?.username ? (
                //и у него есть кастомное имя пользователя username(отличное от имени аккаунта в Гугл) то попадаем в компонент Chat
                
                <Chat session={session} />) : (//передать в компонент Chat данные из сессии
                //и у него нет кастомного имени пользователя то попадаем в компонент Auth для создания такого имени

                // передадим в комп. Auth даннные { data: session } из функции useSession бидлиотеки 'next-auth/react'
                // и нашу функцию reloadSession
                <Auth session={session} reloadSession={reloadSession} />
            )}
        </Box>
    )
}

//------------SECTION----------- - функциональность SSR: сформируем функцию для получения данных сессии из клиента, для обработки хи на стороне сервера
//Если вы экспортируете функцию с именем getServerSideProps (рендеринг на стороне сервера) со страницы, 
//Next.js будет предварительно отображать эту страницу при каждом запросе, используя данные, возвращаемые getServerSideProps.
//NOTE - всё что происходит внутри функции getServerSideProps "крутится" на стороне сервера и соответственно нам не доступны хуки Реакта (например useSession)
export async function getServerSideProps(context: NextPageContext) {//NextPageContext - тип для context

    // NextAuth.js предоставляет хелпер getSession(), который следует вызывать на стороне клиента только для возврата текущего активного сеанса.
    const session = await getSession(context)

    return {//вернуть сессию в пропсах страницы(?)
        props: { 
            session 
        },
    }
}

export default Home
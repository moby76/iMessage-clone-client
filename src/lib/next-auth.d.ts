//этот файл будет расширять объект Session пакета 'next-auth'

import 'next-auth'//импортируем пакет который будем расширять(дополнять)
// import { Session } from 'next-auth'

declare module 'next-auth' {//объявитть модуль для изменения

    //добавим созданные поля в интерфейс Session библиотеки 'next-auth'
    //интерфейс Session в свою очередь является дополнителем для interface DefaultSession в котором по умолчанию только 3 поля: name, email, image 
    interface Session {
        user: User
    }
    //Создать интерфейс. 
    //Интерфейс - это определение кастомного типа данных, но без реализации. 
    //Интерфейс определяет свойства и методы, которые объект должен реализовать
    interface User {
        id: string//добавим поле id
        username: string//добавим поле username
    }
}
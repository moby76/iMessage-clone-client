//здесь будут созданы типы описывающие наши данные, переменные и т.д используемые в компонентах при вызове мутаций и запросов на КЛИЕНТЕ через userOperations.ts

//TypeScript ничего "не знает" о типах из graphQL по этому нужно прописать для них типы
//создать тип для данных мутаций или запросов которые будут в запросах/мутациях 
// import { ConversationPopulated, MessagePopulated } from '../../../server/src/util/types'

import { Prisma, PrismaClient } from "@prisma/client";


//------------SECTION----------- - Пользователи/участники
export interface CreateUserNameData {
    createUserName: {//мутация на которую распространяются эти типы. //NOTE - название должно совпадать с названием мутации, т.к. мы переопределяем её здесь!!!
        success: boolean
        error: string
    }
}

//так-же создать типы для переменных используемых в мутации --^
export interface CreateUserNameVariables {
    username: string
}

//создать интерфейсы для использования при реализации запроса на поиск пользователя
export interface SearchUsersData { //декларируем тип-запос(Query) searchUsers из userTypeDefs
    searchUsers: Array<SearchedUser>
}

export interface SearchedUser {//--^    //декларируем тип SearchedUser из userTypeDefs
    id: string,
    username: string
}

// export interface User {//--^    //декларируем тип User из userTypeDefs
//     id: string,
//     username: string
// }

export interface SearchUsersInput {
    username: string//должен быть аналогичен тому который в userOperations.ts --> Queries --> searchUsers
}

//------------SECTION----------- - Обсуждения(диалоги)

//интерфейс для данных при запросе диалогов
export interface ConversationData {
    conversations: Array<ConversationPopulated>//conversations - это название запроса в typeDefs и resolvers. ConversationPopulated - представление структуры возвращаемых этой подпиской данных. Импортировано с Бэкэнда('../../../server/src/utils/types')
    //FIXME - Но что делать если бэкенд и фронтенд лежат на разных сервисах?
}

//интерфейс для данных возвращаемых мутацией createConversation
export interface CreateConversationData {
    createConversation: {//мутация-опрерация
        conversationId: string
    }
}
//интерфейс для вводимых значений мутации-операции createConversation. Это будет массив строковых значений
export interface CreateConversationInput {
    participantIds: Array<string>
}

//интерфейс для данных для подписки на удаления диалога - conversationDeleted
export interface ConversationDeletedData {
    conversationDeleted: {
        id: string;
    };
}

//интерфейс для данных для подписки обновления диалога - conversationUpdated
export interface ConversationUpdatedData {
    conversationUpdated: {
        conversation: ConversationPopulated;
    };
}

//------------SECTION----------- - Сообщения (Massages) ----------------------------

//интерфейс для данных 
export interface MessagesData {
    messages: Array<MessagePopulated>
}

//интерфейс для переменных
export interface MessagesVariables {
    conversationId: string
}

// интерфейс для подписок
export interface MessageSubscriptionData {
    subscriptionData: {
        data: {
            messageSent: MessagePopulated //messageSent - это название подписки в typeDefs и resolvers. MessagePopulated - представление структуры возвращаемых этой подпиской данных. Импортировано с Бэкэнда('../../../server/src/utils/types')
        }
    }
}

//------------SECTION----------- - Создание сгенерированных типов для переиспользования их в коде --------------

// создадим переменную с помощью "сгенерированного типа" Призмы для переиспользования в других частях кода на основе заполнения данных для участников диалога
export const participantPopulated = Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {// в которое включим все данные поля user --> которое является ссылочным на модель User
        // и разрешим только id  и имя пользователя
        select: {// комманда select - выбор включаемых полей с подтверждением логическим true/false
            id: true,
            username: true
        }
    }
})

// создадим переменную conversationPopulated с помощью "сгенерированного типа" Призмы для переиспользования в других частях кода на основе заполнения данных для диалогов с помощью компонента Призмы - validator
export const conversationPopulated = Prisma.validator<Prisma.ConversationInclude>()({//ConversationInclude автоматически-сгенерированный тип данных пакетом Prisma при запуске комманды "npx prisma generate"(❓)
    participants: {// включим поле participants --> ConversationParticipant[](массив модели/коллекции ConversationParticipant)
        include: participantPopulated// переменная с заполненными занными участников диалога 
    },
    // и id и имя отправителя последнего сообщения
    latestMessage: {// включим поле latestMessage --> ссылочное на модель Message
        include: {// 
            sender: {// поле sender --> ссылочное на модель User
                // и так-же разрешим только id  и имя пользователя
                select: {
                    id: true,
                    username: true
                }
            }
        }
    }
})

// ----------------------------------------------------------------------------------------------------------

//------------SECTION----------- - Conversations(Диалоги) ------------------------

// тип для данных которые будут в диалогах. Должно в точности повторять содержимое переменной conversationPopulated в conversationResolvers.ts
// с помощью "сгенерированного типа" Призмы - ConversationGetPayload в получим раннее созданный в conversationResolvers.ts тип-переменную conversationPopulated
export type ConversationPopulated = Prisma.ConversationGetPayload<{ include: typeof conversationPopulated }>

//по аналогичному --^ принципу создадим тип для participantPopulated, что является частью conversationPopulated. Для отдельного переиспользования
export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{ include: typeof participantPopulated }>

//------------SECTION----------- - MessageInclude -----------------------------

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
    sender: {
        select: {
            id: true,
            username: true
        }
    }
})

//тип полученный на основе сформированного в messageResolvers шаблона messagePopulated
export type MessagePopulated = Prisma.MessageGetPayload<{ include: typeof messagePopulated }>


//здесь будут созданы типы описывающие наши данные, переменные и т.д используемые в компонентах при вызове мутаций и запросов на КЛИЕНТЕ через userOperations.ts

//TypeScript ничего "не знает" о типах из graphQL по этому нужно прописать для них типы
//создать тип для данных мутаций или запросов которые будут в запросах/мутациях 
import { ConversationPopulated, MessagePopulated } from '../../../server/src/util/types'


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






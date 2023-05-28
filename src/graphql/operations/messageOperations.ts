//В этом файле запросы к мутациям/запросам/подпискам определённых для обработки Диалогов для вызова их на стороне клиента/React/apollo-client(из компонентов, страниц и т.д.)
//они скомбинированы по типам 

import { gql } from '@apollo/client';

export const MessageFields = `
    id
    sender {
        id
        username
    }
    body
    createdAt
`

export default {//NOTE - в данном случае имя переменной при экспорте не указано, по этому, при импорте данного функционала в компонентах/страницах можно присваивать кастомное имя переменной
    Query: {
        messages: gql`
            query Messages($conversationId: String!){
                messages(conversationId: $conversationId){
                    ${MessageFields}
                }
            }
        `
    },
    Mutation: {
        sendMessage: gql`
            mutation SendMessage(
                $id: String!
                $conversationId: String!
                $senderId: String!
                $body: String!
            ){
                sendMessage(
                    id: $id, 
                    conversationId: $conversationId, 
                    senderId: $senderId, 
                    body: $body
                )
            }
        `
    },
    Subscription: {
        messageSent: gql`
            subscription MessageSent($conversationId: String!){
                messageSent(conversationId: $conversationId){
                    ${MessageFields}
                }
            }
        `
    }
}
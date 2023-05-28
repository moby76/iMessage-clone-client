//В этом файле запросы к мутациям/запросам/подпискам определённых для обработки Диалогов для вызова их на стороне клиента/React/apollo-client(из компонентов, страниц и т.д.)
//они скомбинированы по типам 

import { gql } from '@apollo/client';
import { MessageFields } from './messageOperations';

const ConversationFields = `
        id
        participants {
            user {
                id
                username
            }
            hasSeenLatestMessage
        }
        latestMessage {
            ${MessageFields}
        }
        updatedAt
`

export default {//NOTE - в данном случае имя переменной при экспорте не указано, по этому, при импорте данного функционала в компонентах/страницах можно присваивать кастомное имя переменной
    Queries: {
        conversations: gql`
            query Conversations{
                conversations {
                   ${ConversationFields} 
                }                
            }
        `
    },
    Mutations: {
        createConversation: gql`#это имя мутации будет использовано в компонентах React
            mutation CreateConversation($participantIds: [String]!){#это имя мутации не обязательно, но для общего обозначения/разметки
                createConversation(participantIds: $participantIds){#это имя мутации должно соответствовать названию мутации на сервере
                   conversationId
                }
            },
        `,
        deleteConversation: gql`
            mutation DeleteConversation($conversationId: String!) {
                deleteConversation(conversationId: $conversationId)
      }
    `,
        markConversationAsRead: gql`
            mutation MarkConversationAsRead(
                $userId: String!
                $conversationId: String!
      ) {
        markConversationAsRead(userId: $userId, conversationId: $conversationId)
      }
    `,
    },
    Subscriptions: {
        conversationCreated: gql`
            subscription ConversationCreated {
                conversationCreated {
                    ${ConversationFields}
                }
            }
        `,
        conversationUpdated: gql`
      subscription ConversationUpdated {
        conversationUpdated {
          conversation {
            ${ConversationFields}
          }
        }
      }
    `,
        conversationDeleted: gql`
      subscription ConversationDeleted {
        conversationDeleted {
          id
        }
      }
    `,
    }
}
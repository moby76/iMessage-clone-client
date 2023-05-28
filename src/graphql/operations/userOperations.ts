//В этом файле запросы к мутациям/запросам/подпискам определённых для обработки Пользователей для вызова их на стороне клиента/React/apollo-client(из компонентов, страниц и т.д.)
//они скомбинированы по типам 

import { gql, useQuery, useMutation } from '@apollo/client';

export default {//NOTE - в данном случае имя переменной при экспорте не указано, по этому, при импорте данного функционала в компонентах/страницах можно присваивать кастомное имя переменной
    Queries: {
        searchUsers: gql`
            query SearchUsers($username: String!){
                searchUsers(username: $username){
                    id
                    username
                    # email
                }
            }
        `
    },
    Mutations: {
        createUserName: gql`#это имя мутации будет использовано в операциях
            mutation CreateUserName($username: String!){#это имя мутации не обязательно, но для общего обозначения/разметки
                createUserName(username: $username){#это имя мутации должно соответствовать названию мутации на сервере
                    success
                    error
                }
            }
        `
    },
    Subscriptions: {}
}
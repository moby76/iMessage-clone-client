//Здесь будет создан экземпляр клиента Апполо через который будет происходить связь с grapql API(сервером)

import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { getSession } from 'next-auth/react'

const URI = process.env.NEXT_PUBLIC_SERVER_URI

//STEP-1 Создать http-ссылку
const httpLink = new HttpLink({
    uri: `http://${URI}/graphql` || `https://${URI}/graphql`,
    // uri: process.env.NEXT_PUBLIC_SERVER_URI,
    credentials: 'include' // получение/отправка запросов из любых источников
})

// // если будет производиться загрузка файлов то используем класс createUploadLink из пакета apollo-upload-client
// const httpLink = createUploadLink({//
//     uri: 'http://localhost:5000/graphql'
//     //заменить перед деплоем на git & Netlify
//     // uri: 'https://floating-spire-77624.herokuapp.com/graphql'
//  })

//STEP-2 Создать webSocket-ссылку
//перед созданием webSocket-ссылки в среде Next.js сначала нужно убедиться что окно браузера активно( typeof window !== 'undefined' ) иначе - вернём NULL - ссылка не будет создана
const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(createClient({
  url: `ws://${URI}/graphql/subscriptions`,
  // url: `ws://${URI}/graphql/subscriptions`,
  //добавить параметры соединения из next-auth/react которые попадают в контекст graphql-ws на сервер при первом подключении с apollo-server
  connectionParams: async () => ({
      session: await getSession()
  })
})) : null

//STEP-3 создать разделённую ссылку
//перед созданием разделённой ссылки в среде Next.js нужно пройти проверку на то что мы в браузере ( typeof window !== 'undefined' ) и webSocket-ссылка создана
// иначе переходим на получение данных через http-ссылку
const splitLink = typeof window !== 'undefined' && wsLink != null ? split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  ) : httpLink

//STEP-4 создание непосредственно клиента 
export const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),//хранилище временных данных на клиенте  
    // connectToDevTools: true
})

// export default client

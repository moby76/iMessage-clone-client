// Next.js использует компонент App для инициализации страниц. Вы можете переопределить его и управлять инициализацией страницы, а также:

//Использование предоставленного <SessionProvider> позволяет экземплярам useSession() совместно использовать объект сеанса между компонентами,
//используя скрытое использование React Context. Он также заботится об обновлении сеанса и синхронизации между вкладками/окнами.
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'//Вы используете typescript, поэтому вы должны объявить тип аргументов, передаваемых функции. AppProps — это тип этого объекта.

// После установки пользовательского интерфейса Chakra вам необходимо настроить ChakraProvider в корне вашего приложения.
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '../chakra/theme'

//для соединения и получения даныых из graphQL API с сервера подключим компонент ApolloProvider из библиотеки @apollo/client и "клиент" созданный нами в папке ../graphql/apollo-client
import { ApolloProvider } from '@apollo/client'
import { client } from '../graphql/apollo-client'
import { Toaster } from 'react-hot-toast'


//Свойство Component является активной страницей, поэтому всякий раз, когда вы перемещаетесь между маршрутами, Component будет переходить на новую страницу.
//pageProps — это объект с начальными свойствами, которые были предварительно загружены для вашей страницы одним из наших методов выборки данных, в противном случае это пустой объект.
function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {

	return (
		<ApolloProvider client={client}>
			{/** для передачи контекста в на компоненты приложения в течении сессии */}
			<SessionProvider session={session}>
				{/* обернуть содержимое приложения в ChakraProvider что-бы компоненты Chakra-UI применялись ко всем компонентам */}
				<ChakraProvider theme={theme}>
					<Component {...pageProps} />
					<Toaster />
				</ChakraProvider>
			</SessionProvider>
		</ApolloProvider>
	)
}

export default App
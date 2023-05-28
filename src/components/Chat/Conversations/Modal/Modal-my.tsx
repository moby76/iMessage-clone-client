//Основной компонент модального окна. Обёртка для остальных компонентов окна

import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Text, Stack, Input } from "@chakra-ui/react"
import { Session } from "next-auth"
import React, { useState } from "react"
//получим запросы и мутации для фронтенда для пользователя из папки graphql/operations присвоив имя UserOperations

import UserOperations from "../../../../graphql/operations/userOperations"
import ConversationOperations from "../../../../graphql/operations/conversationOperations"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client"
import { CreateConversationData, CreateConversationInput, SearchUsersData, SearchUsersInput, SearchedUser } from "../../../../util/types-shad"
import UsersSearchList from "./UsersSearchList"
import Participants from "./Participants"
import { toast } from "react-hot-toast"
import { useRouter } from "next/router"


interface ConvesationsModalProps {
    session: Session// тип session будет получать из переопределённого интерфейса Session пакета "next-auth"
    isOpen: boolean
    onClose: () => void//вернёт пустое значение
}

const ConvesationsModal: React.FC<ConvesationsModalProps> = ({ isOpen, onClose, session }) => {

    //получить идентификатор текущего пользователя(свой) из сеанса/сессии
    const { user: { id: userId } } = session

    // определить роутер используя хук useRouter пакета 'next/router'
    const router = useRouter()

    //Создать стейт для поиска участника по пользовательскому имени 
    const [thisUsername, setUsername] = useState("")

    //Создать стейт для участников которые будут в обсуждении - это будет массив из элементов соответств. интерфейсу User из ../../../../util/types
    const [participants, setParticipants] = useState<Array<SearchedUser>>([])

    // ************** Реализация взаимодействия с apollo-client->server. *******************

    // Запрос на получение пользователя по имени из БД - (searchUsers)
    // const { data, loading, error } = useQuery(UserOperations.Queries.searchUsers)//NOTE - вместо хука useQuery используем хук useLazyQuery
    const [searchUsersFunction, { data, loading, error }] = useLazyQuery<SearchUsersData, SearchUsersInput>(UserOperations.Queries.searchUsers)//хук useLazyQuery запускается только когда срабатывает функция вызывающая его, в отличии от useQuery который вызывается уже при рендеринге компонента
    // console.log('HEARE IS A SEARCH DATA', data);

    // Запрос на активацию мутации для создания  диалога (createConversation)
    const [createConversationFunction, { loading: createConversationLoading }] = useMutation<CreateConversationData, CreateConversationInput>(ConversationOperations.Mutations.createConversation)
    //******************************************************************************** */

    // FUNCTION  - Функция отвечающая за поиск пользователя при заполнении формы и отправке запроса
    const onSubmitSearch = (event: React.FormEvent) => {//async можно не указывать т.к. эта ф-ция обращается к асинхронному хуку useLazyQuery
        event.preventDefault()//для предотвращения перезагрузки страницы

        //вызовем функцию searchUsersFunction ⤴️ реализующую запрос на поиск
        searchUsersFunction({ variables: { username: thisUsername } })
        // console.log('INSIDE ONSUBMIT', thisUsername);
    }

    // FUNCTION  - Функция передающая найденного пользователя в список участников чата
    const addParticipant = (user: SearchedUser) => {
        //STEP-1 преобразуем предыдущее состояние participants в массив в котором уже включены предыдущие ...prev, и добавляется новый user
        setParticipants((prev) => [...prev, user])
        //STEP-2 - очищаем состояние поиска пользователя по имени(стейт thisUsername)
        setUsername("")
        //TODO - исключить возможность дублирования добавления участника в список при случайном повторном нажатии на кнопку - "Выбрать"
    }

    // FUNCTION  - функция удаляющая участника из чата. удалить используя фильтр по id с помощью метода js .filter передав в него фильтр текущего
    //Метод filter() создаёт новый массив со всеми элементами, прошедшими проверку, задаваемую в передаваемой функции. https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    const removePartipiant = (userId: string) => { //параметр userId будет получать аргументом значение из компонента <Participants>
        //здесь параметр prev = значению всех элементов типа User уже раннее сформированного функцией addParticipant массива participants(строка 27)
        setParticipants((prev) => prev.filter((p) => p.id !== userId))//p.id можно понимать как User.id.... p - это элемент пересоздаваемого методом .filter массива на основе который оставляет только значения элементов с id(User.id) НЕ равными значению userId.
    }

    // FUNCTION  - функция для начала общения. Активируется при нажатии кнопки "Начать общение". Асинхронная функция
    const onCreateConversation = async () => {
        const participantIds = [ userId, ...participants.map((p) => p.id) ]//получим новый массив - идентификаторов на основе сформированного массива участников(participants) + идентификатор текущего пользователя - thisUserId
        try {
            //Активируем мутацию для создания диалога через функцию createConversationFunction
            const { data } = await createConversationFunction({ variables: { participantIds: participantIds } })//получим данные(id) на участников диалога по их id(элементы массива participantIds) из мутации
            // console.log('ДАННЫЕ БЕСЕДЫ', data);

            //выполним проверку 
            if (!data?.createConversation) {
                throw new Error('Ошибка создания диалога')
            }

            // при успешном получении данных вытянем id диалога для передачи его в дальнейшем в качестве аргумента для создания адреса в роутер
            const { createConversation: { conversationId } } = data

            // добавим эти данные --^ в роутер в качестве параметра запроса (query)
            router.push({ query: { conversationId } }) 

            //TODO - очистить стейт participants и thisUsername и и закрыть окно в случае удачно-созданного диалога
            setParticipants([])//обнуляем стейт participants
            setUsername("")//обнуляем стейт thisUsername
            onClose()//активируем ф-цию onClose(библиотеки "@chakra-ui/react"(❓)) - закрытия окна
            
        } catch (error: any) {
            console.log('Ошибка создания диалога', error);
            toast.error(error?.message)
        }
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg={"#2d2d2d"} pb={4}>
                    <ModalHeader>Начать диалог</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {/* При отправке формы будет вызвана ф-ция onSubmitSearch. событие onSubmit*/}
                        <form onSubmit={onSubmitSearch}>
                            <Stack spacing={4}>
                                <Input
                                    placeholder="Введите имя пользователя"
                                    value={thisUsername}
                                    onChange={(event) => setUsername(event.target.value)}
                                />
                                <Button type="submit" isDisabled={!thisUsername} isLoading={loading}>Искать</Button>
                            </Stack>
                        </form>
                        {/* выведем компонент списка найденных польз. но только при условии что данные из запроса searchUsers пришли*/}
                        {/* передадим в него найденных пользователей(users) и функцию(addParticipant) на добавление их в участники чата*/}
                        {data?.searchUsers && (
                            <UsersSearchList users={data.searchUsers} addParticipant={addParticipant} />
                        )}
                        {/* При условии добавления/выбора хоть одного участника в массив participants(если его длина > 0) вывести список выбранных и кнопку для активации диалога */}
                        {participants.length !== 0 && (
                            <>
                                {/* Компонент отображения списка выбранных участников + возможность удалить */}
                                <Participants participants={participants} removePartipiant={removePartipiant} />
                                {/* Создать кнопку активирующую диалог с добавлением в него выбранных участников */}
                                <Button bg={"brand.100"} _hover={{ bg: "brand.100" }} _active={{ bg: "whiteAlpha.200" }} width={"100%"} mt={6} onClick={onCreateConversation} isLoading={createConversationLoading}>
                                    Начать общение
                                </Button>
                            </>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}

export default ConvesationsModal
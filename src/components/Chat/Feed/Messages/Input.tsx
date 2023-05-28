import { Box, Input } from "@chakra-ui/react"
import { Session } from "next-auth"
import React, { useState } from "react"
import { toast } from "react-hot-toast"
import { ObjectId } from 'bson' //получим объект ObjectId из пакета bson для формирования id создаваемых сообщений для БД mongoDB
import MessageOperations from '../../../../graphql/operations/messageOperations'
import { useMutation } from "@apollo/client"
import { SendMessageArguments } from "../../../../../../server/src/util/types"
import { MessagesData } from "../../../../util/types";

interface MessageInputProps {
    session: Session
    conversationId: string
}

const MessageInput: React.FC<MessageInputProps> = ({ session, conversationId }) => {

    const [messageBody, setMessageBody] = useState("")

    // --------------------- активируем мутацию для создания сообщения - sendMessage--------------------
    const [sendMessageFunction] = useMutation<{ sendMessage: boolean }, SendMessageArguments>(MessageOperations.Mutation.sendMessage)

    //-------------------------------------------------------------------------------------

    // FUNCTION  - функция срабатывающая при отправке сообщения
    const onSendMessage = async (event: React.FormEvent) => {
        event.preventDefault()

        try {
            //TODO - вызвать мутацию отправки сообщения//
            //STEP-1 - получить id текущего пользователя
            const { user: { id: senderId } } = session
            //STEP-2 - создать id для сообщения
            const messageId = new ObjectId().toString()
            //STEP-3 - создать константу для всего наового сообщения
            const newMessage: SendMessageArguments = {
                id: messageId, // --^
                senderId: senderId, // --^
                conversationId: conversationId,
                body: messageBody // значение из инпута
            }

            // Очистить поле ввода обнулив значение messageBody функцией setMessageBody ("")
            setMessageBody("");//

            //STEP-4 - запустить функцию резольвера мутации - sendMessageFunction, с одновременной деструктуиризацией аргументов предоставленных хуком useMutation(data, errors)
            const { data, errors } = await sendMessageFunction({
                variables: {
                    ...newMessage //используем спред-оператор для передачи всех значений(параметров) из переменной newMessage(id, senderId, conversationId, body)
                },
                //STEP-4 .1 активировать условие для оптимистического рендеринга. активировав параметру optimisticResponse предоставляемый хуком useMutation
                optimisticResponse: {
                    sendMessage: true//и передать туда мутацию sendMessage со значением true
                },
                //STEP-4 .2 запустим обновление кэша Аполло. это обновит наш UI ещё до того как получим ответ от сервера
                update: (cache) => {
                    //STEP-4 .3 создать "снимок/слепок" кэша Аполло
                    const existing = cache.readQuery<MessagesData>({//получить запрос который будет обрабатываться в кэше
                        query: MessageOperations.Query.messages,//запрос на получение сообщений
                        variables: { conversationId },// и переменную по которой будут определяться/отфильтровываться сообщения из молученного массива 
                    }) as MessagesData//расширить шаблон MessagesData(?) для использования в данном компоненте(?)

                    //STEP-4 .4 перезаписать кэш-запрос --^ 
                    cache.writeQuery<MessagesData, { conversationId: string }>({
                        query: MessageOperations.Query.messages,//указать обновляемый запрос 
                        variables: { conversationId },// и переменную по которой будут определяться сообщения для обновления(те в которых будет id данного диалога)
                        data: {// третьим параметром указать обновляемые данные из запроса
                            ...existing,//развернуть созданный "слепок" кэша --^
                            messages: [//слиянием значений создать новый массив из значений объекта newMessage и данных текучего пользователя + значений которые уже есть в кэше 
                                {// создать новый объект для кэша.                                     
                                    id: messageId,
                                    body: messageBody,
                                    senderId: session.user.id,
                                    conversationId,
                                    sender: {                                
                                        id: session.user.id,
                                        username: session.user.username,
                                    },
                                    createdAt: new Date(Date.now()),
                                    updatedAt: new Date(Date.now()),
                                },
                                ...existing.messages,//и добавить в массив значения сообщений из кэша(уже находящихся там)
                            ],
                        },
                    });
                },

            })
            //STEP-5 - отработать ошибку
            if (!data?.sendMessage || errors) {//если не получены данные из резольвера (в нашем случае - это логическое "true/false") или есть ошибка
                throw new Error('Ошибка при отправке сообщения')
            }
        } catch (error: any) {
            console.log('Ошибка при создании сообщения', error);
            toast.error(error?.message)
        }
    }

    return (
        <Box px={4} py={6} width={'100%'} >
            {/* Это Инпут */}
            <form onSubmit={onSendMessage}>
                <Input
                    value={messageBody}
                    onChange={(event) => setMessageBody(event.target.value)}
                    placeholder="Введите сообщение"
                    resize={"none"}
                    size={'md'}
                    _focus={{ border: "1px solid", borderColor: "whiteAlpha.100" }}
                    _hover={{ borderColor: "whiteAlpha.500" }}
                />
            </form>
        </Box>
    )
}

export default MessageInput
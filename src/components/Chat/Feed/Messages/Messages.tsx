//Компонент вывода сообщений в потоке 
// сниппет - tsrsfc

import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import { MessageSubscriptionData, MessagesData, MessagesVariables } from "../../../../util/types";
import MessageOperations, { MessageFields } from '../../../../graphql/operations/messageOperations'
import toast from "react-hot-toast";
import SkeletonLoader from "../../../common/SkeletonLoader";
import React,{ useEffect, useRef } from "react";
import MessageItem from "./MessageItem";

interface MessagesProps {
    userId: string
    conversationId: string
}

const Messages: React.FC<MessagesProps> = ({ userId, conversationId }) => {

    // -------------------------- выполнить запрос на сообщения к БД используя резеольвер запроса messages ------------------------
    const {
         data, 
         loading, 
         error, 
         subscribeToMore // этот метод обеспечивает обновление подписки внутри запроса. Используется для добавления нового элемента подписки, например в списке
        } = useQuery<MessagesData, MessagesVariables>(MessageOperations.Query.messages, {
        variables: { conversationId },
        onError: ({ message }) => {
            toast.error(message)
        },
        // onCompleted: () => {}
    })
    //-------------------------------------------------------------------------------------------------------------------------------- 

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // FUNCTION  - Функция срабатываемая при отправке сообщения. Запускает подписку на сообщения
    const subscribeToMoreMessages = (conversationId: string) => {
        return subscribeToMore({
            //объявить какая подписка будет срабатывать
            document: MessageOperations.Subscription.messageSent,
            //в переменных указать идентификатор диалога который будет обновляться
            variables: {
                conversationId
            },
            //
            updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {

                //выполнить проверку на новые данные: если нет новых данных - вернуть предыдущие значения в Apollo-кэш
                if (!subscriptionData) return prev
                                    
                console.log('Это новое сообщение', subscriptionData)

                //если есть данные новые, создать, основываясь на структуре шаблона из 
                const newMessage = subscriptionData.data.messageSent

                // вернём обновлённй объединённый массив
                return Object.assign({}, prev, {
                    messages:
                        //NOTE - для предотвращения дублирования рендеринга новых сообщений из обновлённой подписки и из кэша Апполо(функционал в компоненте MessageInput)
                        //поставим условие: если отправитель, то для него вернуть только предыдущие сообщения. так-как у него и так получит обновлённый кэш. 
                        newMessage.sender.id === userId
                            ? prev.messages// отправитель получит только предыдущие значения
                            : [newMessage, ...prev.messages]// для другого участника вернётся обновлённая подписка из БД
                })
            },
        })
    }

    //вызвать эту --^ функцию. Только при изменении идентификатора диалога
    useEffect(() => {
        // subscribeToMoreMessages(conversationId)
        // console.log('Запущено из useEffect subscribeToMoreMessages', data?.messages.length);
        const unsubscribe = subscribeToMoreMessages(conversationId);//в аргументе функции указать id диалога
        return () => unsubscribe();
    }, [conversationId]);//и указать что эта функция будет срабатывать только на данный диалог(значение conversationId из сторки браузера)

    useEffect(() => {
        if (!messagesEndRef.current || !data) return;
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, [data, messagesEndRef.current]);

    //если при получении данных из резольвера, то вернём пустое 
    if (error) {
        return null
    }
    // console.log('Это данные из компоненты сообщения', data)    

    return (
        //Вывести сообщения
        <Flex direction={"column"} justify={"flex-end"} overflow={"hidden"}>
            {loading && (//пока активно loading - идёт получение данных выведем SkeletonLoader
                <Stack spacing={4} px={2}>
                    <SkeletonLoader count={4} height="80px" width="270px" />
                    {/* <span>Загрузка сообщений</span> */}
                </Stack>
            )}
            {data?.messages && (
                <Flex direction={"column-reverse"} overflowY={"scroll"} height={"100%"}>
                    {data.messages.map((message) => (
                        <MessageItem
                            key={message.id}
                            message={message}//передаём само мообщение из массива messages
                            sentByMe={message.sender.id === userId}//передаём логическое true-значение если значение id отправителя = значению userId из текущей сессии
                        />
                        // <div key={idx}>{message.body}</div>
                    ))}
                </Flex>
            )}
        </Flex>
    )
};

export default Messages;

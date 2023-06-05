//Компонент отображающий диалоги. Располагается в левой колонке чата
//Является родительским для компонента <ConversationsList> - списка с найденными диалогами

import { Box } from "@chakra-ui/react"
import { Session } from "next-auth"
import ConversationsList from "./ConversationsList"
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client"
import ConversationOperations from "../../../graphql/operations/conversationOperations"
import { ConversationData, ConversationUpdatedData, ConversationDeletedData } from "../../../util/types"
import { ConversationPopulated, ParticipantPopulated } from '../../../util/types'
import { cache, useEffect } from "react"
import { useRouter } from "next/router"
import SkeletonLoader from "../../common/SkeletonLoader"


//Декларация типов для пропсов(аргументов)
interface ConversationsWrapperProps {
    session: Session// тип session будет получать из переопределённого интерфейса Session пакета "next-auth"
}

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({ session }) => {
    // Инициируем роутер
    const router = useRouter()

    // получим conversationId из строки браудля составления условия изменения медиазапроса CSS
    const { query: { conversationId } } = router

    //получить id текущего пользователя
    const { user: { id: userId } } = session

    // ************** Реализация взаимодействия с apollo-client->server. *******************

    // активируем запрос на получение списка диалогов []
    const {
        data: conversationsData,
        error: conversationsError,
        loading: conversationsLoading,
        subscribeToMore // этот метод обеспечивает обновление подписки внутри запроса. Используется для добавления нового элемента подписки, например внутри списка
    } = useQuery<ConversationData, null>(ConversationOperations.Queries.conversations)//аргумент null для 2-го параметра - шаблона переменных
    // console.log('Это диалоги', conversationsData);

    // активируем мутацию помечающую диалог как прочитанный
    const [markConversationAsReadFunction] = useMutation<
    { markConversationAsRead: boolean }, { userId: string; conversationId: string }
    >(ConversationOperations.Mutations.markConversationAsRead)

    // подключить подписку которая срабатывает при обновлении диалога {}
    //REVIEW - Вы используете хук useSubscription клиента Apollo для выполнения подписки из React. 
    //Непосредственное выполнение подписки (в одиночном варианте), например отдельный еонкретный диалог
    useSubscription<ConversationUpdatedData, null>(//аргумент null для 2-го параметра - шаблона переменных - не будет переменных 
        //1-й аргумент функци-хука useSubscription - подключим подписку из
        ConversationOperations.Subscriptions.conversationUpdated, //
        //2-й аргумент функци-хука useSubscription
        {
            // onData функция обратного вызова, которая будет запускаться каждый раз, когда компонент useSubscription Hook/Subscription получает данные.
            //опции объекта параметров состоит из текущего экземпляра клиента Apollo(client) и полученных данных подписки(data).
            onData: ({ client, data }) => {
                const { data: subscriptionData, loading, error } = data; //полученные данные подписки в data и присвоить алиас subscriptionData
                // console.log('Запуск из onData', subscriptionData);
                
                if (!subscriptionData) return // если данные не получены вернём всё как есть

                //получим диалог из подписки conversationUpdated с помощью шаблона ConversationUpdatedData
                const { conversationUpdated: { conversation: updatedConversation } } = subscriptionData //присвоить диалогу алиас updatedConversation 

                //Реализовать что-бы не происходила маркировка диалога собеседника при отправке сообщения ему. Так как происходит обновление диалога, то срабатывает обновление кэша 
                //сравнить по id: диалог из мутации markConversationAsRead и подписки conversationUpdated
                //если --^ совпадают(находится в текущем диалоге) - то логическая константа currentlyViewingConversation(true)
                const currentlyViewingConversation = updatedConversation.id === conversationId//значение переданное в пропсы и оно равно значению из URL

                //если совпадают, то в функции onViewConversation первый параметр - conversationId оставляем без изменений, 
                //а для второго параметра - hasSeenLatestMessage присваиваем логическое значение false, 
                //что принудит запустить обновление кэша и привоить для поля hasSeenLatestMessage значение true
                if (currentlyViewingConversation) {
                    onViewConversation(conversationId, false);
                }
            },
        }
    );

    // подключить подписку на удаление диалога
    useSubscription<ConversationDeletedData, null>(ConversationOperations.Subscriptions.conversationDeleted, {//аргумент null для 2-го параметра - шаблона переменных
        //опции объекта параметров состоит из текущего экземпляра клиента Apollo(client) и полученных данных подписки(data)
        onData: ({ client, data }) => {
            console.log("HERE IS SUB DATA", data);
            const { data: subscriptionData } = data;

            if (!subscriptionData) return;

            // Получить запрос на получение диалогов из кэша Аполло-клиента (client) методом readQuery и присвоить константе existing
            const existing = client.readQuery<ConversationData>({
                query: ConversationOperations.Queries.conversations
                // id:
                // variables:
            })

            // Веернуть всё как есть если не найдены 
            if (!existing) return;

            //получить диалоги из запроса
            const { conversations } = existing

            // получить id из созданной транзакции на удаление в мутации удаления резольвера --> подписке conversationDeleted
            // предоставленных через шаблон ConversationDeletedData, и присвоить ему алиас deletedConversationId
            const { conversationDeleted: { id: deletedConversationId } } = subscriptionData;

            // перезаписать в кэш Аполло-клиента новые данные исключив из данных найденный диалог на удаление
            client.writeQuery<ConversationData>({
                query: ConversationOperations.Queries.conversations,//вернём запрос
                data: {//с новыми данными
                    conversations: conversations.filter(//исключив
                        (conversation) => conversation.id !== deletedConversationId//диалог с раннее найденным id(deletedConversationId)
                    ),
                },
            });
            router.push("/");
        },
    }
    );


    //***************** Конец секции *************************************************** */   

    // FUNCTION  -  Функция срабатываемая при нажатии на один из списка диалогов в (к-т ConversationItem). 
    const onViewConversation = async (
        // conversationId: string,
        conversationId: any,
        hasSeenLatestMessage: boolean | undefined//второй параметр для переключения значения просмотра последнего сообщения
    ) => {
        //STEP-1 - добавляет значение идентификатора диалога в запрос параметра в роутер
        router.push({ query: { conversationId } })

        //STEP-2 - пометить диалог как прочитанный
        if (hasSeenLatestMessage) return;

        //STEP-3 - активировать мутацию на изменение статуса диалога(прочитан/нет) markConversationAsRead mutation

        try {
            await markConversationAsReadFunction({
                variables: {
                    userId,
                    conversationId,
                },
                optimisticResponse: {
                    markConversationAsRead: true,//NOTE - здесь указывается мутация или функция-провайдер этой мутации markConversationAsReadFunction --^ ???
                },        
                //обновить кэш
                update: (cache) => {
                    // В этом варианте используем другой вид обновления кэша: с использованием фрагментов, которые будут частями кэша как частями запроса
                    // Используем фрагменты потому что нам придётся обновить только часть запроса

                    //STEP-3 .2 получить участников диалога из ....
                    const participantsFragment = cache.readFragment<{ participants: Array<ParticipantPopulated> }>({
                        id: `Conversation:${conversationId}`,// получить id диалога из Аполло-кэша. они хранятся в хранилище в виде "Conversation:645ce6e1b40dd100327b6be4"
                        // Conversation: 645ce6e1b40dd100327b6be4
                        // ------------ Получить и обработать только эту часть -------------
                        //     __typename: "Conversation" 
                        //     id: "645ce6e1b40dd100327b6be4"
                        //          participants: [] 2 items
                        //              0: {} 3 keys
                        //                   __typename: "Participant"
                        //                      user: {} 1 key
                        //                          __ref:"User:645cdf61def92ab5aeacbcc4
                        //                   hasSeenLatestMessage: false
                        //              1: {} 3 keys
                        //                   __typename: "Participant"
                        //                      user: {} 1 key
                        //                          __ref:"User:645cdf61def92ab5aeacbcc4
                        //                  hasSeenLatestMessage: true
                        // -----------------------------------------------------------
                        //       __ref: "Message:645e2bee695bcaa1e835ad3f"
                        //          updatedAt: 1683893232082
                        fragment: gql`
                            fragment Participants on Conversation {
                                participants {
                                    user {
                                        id
                                        username
                                    }
                                    hasSeenLatestMessage
                                }
                            }
                        `,
                    });

                    //если не получили такого фрагмента, то вернём всё без обработки
                    if (!participantsFragment) return

                    //Создать массив осснованный на значениях participants из всех participantsFragment
                    const participants = [...participantsFragment.participants]// создав копию массива participants методом спреда ...

                    //найти пользователя/себя по индексу. это должно вернуть или значение -1 если ничего не найдёт. или вернёт индекс если найдёт(????)
                    const userParticipantIdx = participants.findIndex(
                        (p) => p.user.id === userId
                    )

                    //если негативное значение(не найден) то вернёт без изменения
                    if (userParticipantIdx === -1) return;

                    //создать переменную = значению участников с присвоением полученного значения индекса
                    const userParticipant = participants[userParticipantIdx];

                    /** Обновить участника показав последнее сообщение как прочитанное
                     * Update participant to show latest message as read
                    */
                    participants[userParticipantIdx] = {
                        ...userParticipant,//получить копированием найденные
                        hasSeenLatestMessage: true// и заменить значение hasSeenLatestMessage на положительное
                    };

                    /**Обновить кэш
                     * Update cache
                     */
                    cache.writeFragment({//перезапишем фрагмент
                        id: `Conversation:${conversationId}`,
                        fragment: gql`
                            fragment UpdatedParticipant on Conversation {
                                participants
                            }
                        `,
                        data: {//обновить значения обновлённым массивом participants
                            participants,
                        },
                    });
                },
            });
        } catch (error) {
            console.log("onViewConversation error", error);
        }
    }

    // обновим список диалогов
    // Используем второй способ для обновление на стороне клиента(обновлением текущего запроса Query): https://www.apollographql.com/docs/react/data/subscriptions/#subscribing-to-updates-for-a-query
    const subscribeToNewConversations = () => {
        subscribeToMore({
            // в поле document помещается та подписка которая будет отслеживаться
            document: ConversationOperations.Subscriptions.conversationCreated,

            // в поле variables помещаются переменные которые влияют на запрос
            // variables: { ..... } //в нашем случае переменных нет

            // поле updateQuery в котором формируется обновлённый запрос. 
            //Первым параметром -prev представлены предыдущие данные, вторым параметром объект который будет сформирован для обновлённой  отправки
            //после : интерфейс описывающий структуру данного объекта. { subscriptionData: { data: { conversationCreated: ConversationPopulated } } }
            updateQuery: (prev, { subscriptionData }: { subscriptionData: { data: { conversationCreated: ConversationPopulated } } }) => {

                //если нет новых данных - вернуть предыдущие значения
                if (!subscriptionData.data) return prev;
                console.log('Это данные из подписки на новые диалоги', subscriptionData.data);

                //если данные обновились то создать переменную с полученными данными
                const newConversation = subscriptionData.data.conversationCreated
                // console.log("PREV", prev);
                console.log("Новый диалог", newConversation);

                // метод слияния и перезаписи объекта
                //NOTE - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
                return Object.assign({}, prev, {//первый параметр - пустой объект {}, второй - предыдущие данные prev
                    //третий параметр - запрос Query->conversations с обновлёнными данными
                    // из интерфейса ConversationData "../../../util/types"

                    conversations: [newConversation, ...prev.conversations]
                })
            }
        })
    }

    //для контроля новых обновлений используем хук useEffect с пустым массивом [](значит - запустится один раз при монтировании компонента)
    // запуск отслеживания/подписки новых диалогов 
    useEffect(() => {
        //запускаем созданную раннее функцию --^
        subscribeToNewConversations()
        // console.log('Запущено из useEffect');
        //FIXME - этот хук дважды монтирует компонент ConversationItem. пришлось отключать режим - reactStrictMode: false, в next.config.js
        //возможное решение https://www.youtube.com/watch?v=j8s01ThR7bQ 
        //NOTE - это баг пакета next-auth на стороне сервера. Использовать только версию не выше 4.14.0(на серверной части)        
    }, [])

    // if (conversationsError) {
    //     toast.error("There was an error fetching conversations");
    //     return null;
    //   }

    return (
        <Box
            width={{ base: "100%", md: "430px" }}
            display={{ base: conversationId ? 'none' : 'flex', md: 'flex' }}
            flexDirection={"column"}
            gap={4}
            bg='whiteAlpha.50'
            py={6}
            px={3}
        >
            {/* Вывести список диалогов */}
            {conversationsLoading ? (
                <SkeletonLoader count={7} height="80px" width="270px" />
                // <div>Идёт загрузка диалогов</div>
            ) : (
                // в компонент ConversationsList передаём session и данные полученные из запроса на диалоги. Если данных нет - то пустой массив [] */
                <ConversationsList
                    session={session}
                    conversations={conversationsData?.conversations || []}
                    onViewConversation={onViewConversation} // функция onViewConversation передаётся в компонент списка диалогов 
                />
            )}

        </Box>
    )
}

export default ConversationsWrapper
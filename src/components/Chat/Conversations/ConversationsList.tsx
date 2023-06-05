//список бесед. Этот компонент располагается(является дочерним) в компоненте ConversationsWrapper


import { Box, Button, Text } from "@chakra-ui/react"
import { Session } from "next-auth"
import ConvesationsModal from "./Modal/Modal"
import { useState } from "react"
// import { ConversationPopulated } from "../../../util/types"
import { ConversationPopulated } from "../../../util/types"
import ConversationItem from "./ConversationItem"
import { useRouter } from "next/router"
import { useMutation } from "@apollo/client"
import СonversationOperations from "../../../graphql/operations/conversationOperations"
import { toast } from "react-hot-toast"
import { signOut } from "next-auth/react"


interface ConversationsListProps {
    session: Session// свойство session будет получать из переопределённого интерфейса Session пакета "next-auth"
    conversations: Array<ConversationPopulated>//свойство conversations - тип массив из заполненных диалогов
    onViewConversation: (conversationId: string, hasSeenLatestMessage: boolean | undefined) => void// свойство onViewConversation тип функция принимающая два параметра.
    // conversation: ConversationPopulated
}

const ConversationsList: React.FC<ConversationsListProps> = ({ session, conversations, onViewConversation }) => {

    //STEP-1 Объявим состояние для отображения окна с беседами <ConvesationsModal />
    const [isOpen, setIsOpen] = useState(false)//по умолчанию вариант - Закрыто

    // Получить мутацию на удаление диалога
    const [deleteConversationFunction] = useMutation<{ deleteConversation: boolean, conversationId: string }>(СonversationOperations.Mutations.deleteConversation)

    //STEP-2 - Создать 2 функции: 1 будет обрабатывать активировать компонент модального окна <ConvesationsModal />, 2 будет отвечать за закрытие
    const onOpen = () => setIsOpen(true)
    const onClose = () => setIsOpen(false)

    //STEP-3 - создать роутер
    const router = useRouter()

    //получить id текущего пользователя
    const { user: { id: userId } } = session

    // FUNCTION  - Функция срабатывающая при нажатии на кнопку "Удалить" в компоненте ConversationItem
    const onDeleteConversation = async (conversationId: string) => {
        try {
            // Запускаем мутацию удаления диалога (deleteConversationFunction) в обёртке всплывающего окна react-hot-toast 
            toast.promise(
                //STEP-1 - вызвать исполнение резольвера удаления диалога на стороне сервера и удалить id диалога из строки браузера, перенаправив на домашнюю страницу
                deleteConversationFunction({
                    variables: { conversationId },
                    //STEP-1 .2 удаление параметра запроса из строки браузера
                    update: () => {
                        //прибегнем к NEXT-переменная среды
                        //Если строка браузера существует и это строка то 
                        router.replace(typeof process.env.NEXT_PUBLIC_BASE_URL === "string"
                            ? process.env.NEXT_PUBLIC_BASE_URL//....
                            : "" // иначе вернуть пустую строку (???)
                        )
                    }
                }),

                //STEP-3 - передать параметры для react-hot-toast
                {//параметры для react-hot-toast.promise
                    loading: 'Удаление диалога',
                    success: <b>Диалог удалён</b>,
                    error: <b>Невозможно удалить диалог</b>,
                }
            )
            // deleteConversationFunction
        } catch (error) {
            console.log('Не получается удалить диалог', error);

        }
    }

    //создать отсортированный список диалогов по времени обновления(updatedAt) . Новые будут наверху списка
    const sortedConversations = [...conversations].sort(// применить метод sort для копии массива conversations
        (a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()
    );

    return (
        <Box width={{ base: "100%", md: "400px" }} position="relative" height="100%" overflow="hidden">
            <Box
                py={2}
                px={4}
                mb={4}
                borderRadius={4}
                bg={"blackAlpha.300"}
                cursor={"pointer"}
                onClick={onOpen}//при нажатии в области этого элемента Box сработает ф-ция onOpen переключающая значение стейта isOpen в значение true
            >
                <Text textAlign={"center"} color={"whiteAlpha.800"} fontWeight={500}>Найти или начать беседу</Text>

            </Box>
            {/* передать в комп-т модального окна текущее состояние варианта отображения окна isOpen и функцию на его закрытие onClose */}
            <ConvesationsModal session={session} isOpen={isOpen} onClose={onClose} />
            {/* Перебрать массив списка диалогов поместив компонент элемента диалога <ConversationItem /> в каждую итерацию*/}
            {sortedConversations.map((conversation) => {
                const participant = conversation.participants.find((p: any) => p.user.id === userId);
                return (
                    <ConversationItem
                        key={conversation.id}
                        userId={userId}
                        conversation={conversation}
                        onClick={() =>
                            onViewConversation(
                                conversation.id,
                                participant?.hasSeenLatestMessage//второй аргумент для ф-ции onViewConversation
                            )
                        }
                        onDeleteConversation={onDeleteConversation}
                        hasSeenLatestMessage={participant?.hasSeenLatestMessage}
                        isSelected={conversation.id === router.query.conversationId}//параметр для проверки - совпадает-ли переданное значение id со значением в строке url браузера
                    />
                )
            })}
            <Box position="absolute" bottom={0} left={0} width="100%" px={8}>
                <Button width="100%" onClick={() => signOut()}>
                    Logout
                </Button>
            </Box>
        </Box>
    )
}

export default ConversationsList
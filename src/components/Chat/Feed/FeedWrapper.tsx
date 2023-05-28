//Оболочка для ленты/потока (Feed)

import { Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import MessagesHeader from "./Messages/Header";
import MessageInput from "./Messages/Input";
import Messages from "./Messages/Messages";
import NoConversation from "./NoConversationSelected";

//Декларация типов для пропсов(аргументов)
interface FeedWrapperProps {
    session: Session; //тип session будет получать из переопределённого интерфейса Session пакета "next-auth" 
}

const FeedWrapper: React.FC<FeedWrapperProps> = ({ session }) => { 
    //создать роутер
    const router = useRouter();

        //и получим идентификатор диалога переданный туда после начала диалога из модального окна(компонента <ConvesationsModal>)из строки браузера
        const { conversationId } = router.query;
    //получить id текущего пользователя
    const { user: { id: userId } } = session

    return (
        <Flex
            display={{ base: conversationId ? "flex" : "none", md: 'flex' }}
            width={"100%"}
            direction={"column"}
            // bg={'teal.900'}
        >
            {conversationId && typeof conversationId === "string" ? ( //для корректного получения отображения указать что тип conversationId является строкой
                <>
                    <Flex
                        direction={'column'}
                        justify={"space-between"}
                        overflow={"hidden"}
                        flexGrow={1}
                    >
                        {/* { conversationId } */}
                        <MessagesHeader userId={userId} conversationId={conversationId} />
                        <Messages userId={userId} conversationId={conversationId} />
                    </Flex>
                    <MessageInput session={session} conversationId={conversationId} />
                </>
            ) : (
                // <div>Нет выбранных диалогов</div>
                <NoConversation />
            )}
        </Flex>
    );
};

export default FeedWrapper;

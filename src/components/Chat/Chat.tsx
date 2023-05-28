//этот файл-компонент будет входной точкой для папок Conversation и Feed

import { Button, Flex } from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import ConversationsWrapper from "./Conversations/ConversationsWrapper";
import FeedWrapper from "./Feed/FeedWrapper";
import { Session } from "next-auth";


interface ChatProps {
    session: Session
}

const Chat: React.FC<ChatProps> = ({ session }) => {//объект session в пропсах передан в данный компонент из index.tsx
    return (
        <Flex height='100vh'>
            {/* передадим данные(session) из пропсов в другие компоненты далее по цепочке */}
            <ConversationsWrapper session={session} />
            <FeedWrapper session={session} />
            {/* <Button onClick={() => signOut()}>Sign Out</Button> */}
        </Flex >
    )
};

export default Chat;

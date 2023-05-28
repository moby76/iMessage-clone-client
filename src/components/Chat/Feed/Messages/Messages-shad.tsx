
import { Box, Flex, Stack } from "@chakra-ui/react";
import { MessagesData, MessageSubscriptionData, MessagesVariables, } from "../../../../util/types-shad";
import MessageOperations, { MessageFields } from "../../../../graphql/operations/messageOperations";
import toast from "react-hot-toast";
import SkeletonLoader from "../../../common/SkeletonLoader";
import React, { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import { useQuery } from "@apollo/client";

interface MessagesProps {
    userId: string;
    conversationId: string;
}

const Messages: React.FC<MessagesProps> = ({ userId, conversationId }) => {
    const { data, loading, error, subscribeToMore } = useQuery<MessagesData, MessagesVariables>(MessageOperations.Query.messages, {
        variables: { conversationId },
        onError: ({ message }) => {
            toast.error(message);
        },
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const subscribeToMoreMessages = (conversationId: string) => {
        return subscribeToMore({
            document: MessageOperations.Subscription.messageSent,
            variables: {
                conversationId,
            },
            updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
                if (!subscriptionData) return prev;

                console.log("HERE IS SUBSCRIPTION DATA", subscriptionData);

                const newMessage = subscriptionData.data.messageSent;

                return Object.assign({}, prev, {
                    messages:
                        newMessage.sender.id === userId
                            ? prev.messages
                            : [newMessage, ...prev.messages],
                });
            },
        });
    };

    useEffect(() => {
        const unsubscribe = subscribeToMoreMessages(conversationId);
        return () => unsubscribe()
    }, [conversationId]);

    useEffect(() => {
        if (!messagesEndRef.current || !data) return;
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [data, messagesEndRef.current]);

    if (error) {
        return null;
    }

    return (
        <Flex direction="column" justify="flex-end" overflow="hidden">
            {loading && (
                <Stack spacing={4} px={4}>
                    <SkeletonLoader count={4} height="60px" />
                </Stack>
            )}
            {data?.messages && (
                <Flex direction="column-reverse" overflowY="scroll" height="100%">
                    {data.messages.map((message) => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            sentByMe={message.sender.id === userId}
                        />
                        // <div key={message.id}>{message.body}</div>
                    ))}
                </Flex>
            )}
        </Flex>
    );
};

export default Messages;

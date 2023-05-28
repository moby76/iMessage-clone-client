import { Avatar, Box, Flex, Stack, Text } from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { MessagePopulated } from "../../../../../../server/src/util/types";
import ru from "date-fns/locale/ru";

interface MessageItemProps {
    //пеервым значением будет само сообщение представленное интерфейсом MessagePopulated
    message: MessagePopulated
    //вторым логическое значение для распознавания, что это сообщение отправлено мной.
    sentByMe: boolean
}

const formatRelativeLocale = {
    lastWeek: "eeee 'в' p",
    yesterday: "'Вчера в' p",
    today: "p",
    other: "MM/dd/yy",
};

const MessageItem: React.FC<MessageItemProps> = ({ message, sentByMe }) => {
    return (
        // блок сообщения. есть условие: если логическое sentByMe = true(отправленно мной), содержимое прижимается к правому краю, иначе к левому краю.
        <Stack direction="row" p={4} spacing={4} _hover={{ bg: "whiteAlpha.200" }} justify={sentByMe ? "flex-end" : "flex-start"} wordBreak="break-word">
            {!sentByMe && (//если НЕ значение sentByMe(сообщение отправлено не мной) отобразим аватар другого пользователя
                <Flex align="flex-end">
                    {/* //TODO - создать функционал для загрузки аватара на бэкенде и отображения здесь (message.sender.avatar)*/}
                    <Avatar size="sm" />
                </Flex>
            )}
            {/* блок содержимого сообщения */}
            <Stack spacing={1} width="100%">
                {/* блок отображающий имя пользователя и дату создания сообщения. Если отправлено мной то содержимое блока прижимается к правому краю и наоборот */}
                <Stack direction="row" align="center" justify={sentByMe ? "flex-end" : "flex-start"}>
                    {/* имя отправителя отображается только при условии что отправитель НЕ я */}
                    {!sentByMe && (
                        <Text fontWeight={500} textAlign="left">
                            {message.sender.username}
                        </Text>
                    )}
                    <Text fontSize={14} color="whiteAlpha.700">
                        {formatRelative(new Date(message.createdAt), new Date(), {
                            locale: {
                                ...ru,
                                formatRelative: (token) =>
                                    formatRelativeLocale[
                                    token as keyof typeof formatRelativeLocale
                                    ],
                            },
                        })}
                    </Text>
                </Stack>
                {/* в зависимости от отправителя будет меняться расположение относительно вертикали */}
                <Flex justify={sentByMe ? "flex-end" : "flex-start"}>
                        {/* и цвет фона сообщения */}
                    <Box bg={sentByMe ? "brand.100" : "whiteAlpha.300"} px={2} py={1} borderRadius={12} maxWidth="65%">
                        <Text>{message.body}</Text>
                    </Box>
                </Flex>
            </Stack>
        </Stack>
    );
};

export default MessageItem;

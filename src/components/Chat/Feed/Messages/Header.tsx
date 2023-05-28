import { useQuery } from "@apollo/client";
import { Button, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import ConversationOperations from "../../../../graphql/operations/conversationOperations"
import { formatUsernames } from "../../../../util/functions";
import { ConversationData } from "../../../../util/types";
// import SkeletonLoader from "../../../common/SkeletonLoader";

interface MessagesHeaderProps {
  userId: string;
  conversationId: string;
}

const MessagesHeader: React.FC<MessagesHeaderProps> = ({ userId, conversationId, }) => {
  const router = useRouter();

  //получим данные из запроса conversations, активировав Query -> conversations
  const { data, loading } = useQuery<ConversationData, null>( ConversationOperations.Queries.conversations );

  //Метод Array.find(Метод JS). найдём из массива conversations тот диалог идентификатор которого совпадает с переданным нам из родительского компонента <FeedWrapper>
  const conversation = data?.conversations.find((conversation) => conversation.id === conversationId);

  return (
    <Stack
      direction="row"
      align="center"
      spacing={6}
      py={5}
      px={{ base: 4, md: 0 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
    >
        {/* Кнопка - удаляет значение запроса conversationId из строки браузера тем самым омтавляет только список диалогов. отображается только на экранах > md   */}
      <Button
        display={{ md: "none" }}
        onClick={() =>
          router.replace("?conversationId", "/", {
            shallow: true,
          })
        }
      >
        Назад
      </Button>
      {/* {loading && <SkeletonLoader count={1} height="30px" width="320px" />} */}
      {!conversation && !loading && <Text>Conversation Not Found</Text>}
      {conversation && (
        <Stack direction="row">
          <Text color="whiteAlpha.600">To: </Text>
          <Text fontWeight={600}>            
            {formatUsernames(conversation.participants, userId)}
          </Text>
        </Stack>
      )}
    </Stack>
  );
};
export default MessagesHeader;
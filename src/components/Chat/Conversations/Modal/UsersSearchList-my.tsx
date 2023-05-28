//компонент выбора пользователей для диалога. Активируется после отправки запроса на поиск пользователей по их именая в модальном окне компонента ConvesationsModal
//

import { Avatar, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { SearchedUser } from "../../../../util/types-shad";

//назначим типы для пропсов компонента UsersSearchList
interface UsersSearchListProps {
    //массив из интерфейсов User из types.ts которые аналогичны
    users: Array<SearchedUser>
    //пропишем пустую функцию с типом аргументов user соотносится с интерфейсом/типом User(из ../../../../util/types), которая на самом деле просто вернёт пустоту в данном компоненте. 
    //Но отработает в родительском компоненте ConvesationsModal (Modal.tsx)
    addParticipant: (user: SearchedUser) => void
}

const UsersSearchList: React.FC<UsersSearchListProps> = ({ users, addParticipant }) => {//
    return (
        <>
            {/* <div>компонент выбора пользователей для диалога</div> */}
            {users.length === 0 ? (//если длина массива users = 0 то выводим сообщение Пользователи не найдены
                <Flex mt={6} justify={"center"}>
                    <Text>Пользователи не найдены</Text>
                </Flex>
            ) : ( //иначе перебор полученного массива users
                <Stack mt={6}>
                    {users.map(user => (//прописываем именно аргумент user(который соотносится с user из интерфейса для пропсов - UsersSearchListProps)
                        <Stack direction={"row"} align={"center"} spacing={4} py={2} px={4} borderRadius={4} _hover={{ bg: "whiteAlpha.200" }} key={user.id}>
                            <Avatar />
                            <Flex justify={"space-between"} align={"center"} width={"100%"}>
                                <Text color={"whiteAlpha.700"}>{user.username}</Text>
                                {/* кнопку с передачей в неё функции  на добавление участника в чат: addParticipant с пользователем (user) из массива пользователей (users)*/}
                                <Button bg={"brand.100"} _hover={{ bg: "brand.100" }} _active={{ bg: "whiteAlpha.200" }} onClick={() => addParticipant(user)}>Выбрать</Button>
                            </Flex>

                        </Stack>
                    ))}
                </Stack>
            )}
        </>
    )
}

export default UsersSearchList;

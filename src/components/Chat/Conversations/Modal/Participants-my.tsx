//Компонент отображения списка выбранных участников для диалога
// tsrsfc

import * as React from 'react';
import { SearchedUser } from '../../../../util/types-shad';
import { Flex, Stack, Text } from '@chakra-ui/react';
import { IoIosCloseCircleOutline } from 'react-icons/io'

//назначим типы для пропсов компонента Participants
interface ParticipantsProps {
    //сначала определить тип для элементов массива participants. Он будет получать элементы соотв. интерфейсу User из ../../../../util/types
    participants: Array<SearchedUser>
    //пропишем пустую функцию с типом аргументов userId(строковый тип(string)) который будет заменяться значениеми participant.id при переборе массива participants. 
    //Эта функция будет принимать данные значения и отрабатывать в родительском компоненте ConvesationsModal(Modal.tsx)
    removePartipiant: ( userId: string ) => void// другой вариант записи removePartipiant: ( userId: string ) => void
}

const Participants: React.FC<ParticipantsProps> = ({ participants, removePartipiant }) => {
    // console.log('Участники', participants);
    
  return (
    <Flex mt={8} gap={"10px"} flexWrap={'wrap'}>
        { participants.map (participant => (//получим элементы массива participants = интерфейсу User.(id, username)
            <Stack key={participant.id} direction={'row'} align={'center'} bg={'whiteAlpha.200'} borderRadius={4} p={2}> 
                <Text >{ participant.username }</Text>
                <IoIosCloseCircleOutline  size={20} cursor={'pointer'} onClick={() => removePartipiant(participant.id)}/>
            </Stack>
        ))}
    </Flex>
  )
};

export default Participants;

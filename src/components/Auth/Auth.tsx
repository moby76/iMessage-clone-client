//данный файл создан командой tsrsfc

import { useMutation } from "@apollo/client";
import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
//получим запросы и мутации для фронтенда для пользователя из папки graphql/operations присвоив имя UserOperations
import UserOperations from "../../graphql/operations/userOperations"
//получим задекларированные типы для использования в этом файле
import { CreateUserNameData, CreateUserNameVariables } from "../../util/types";
import { toast } from "react-hot-toast";

// Интерфейсы в TypeScript служат для именования типов данных, и являются способом определения соглашений внутри кода. 
//Другими словами, создавая интерфейс мы создаем некоторый тип данных, который в основном служит для объектов или классов, 
//где мы указываем какие поля, какие функции и какие вообще элементы должны присутствовать у этих объектов.

//создание типа IAuthProps 
interface IAuthProps {
    session: Session //поле session которое будет являтся расширенным объектом Session библиотеки "next-auth", который может иметь значение null при отсутствии польз. в системе
    reloadSession: () => void //вторым полем будет функция для преиспользования пользователя который находится в сессии из БД 
}

const Auth: React.FC<IAuthProps> = ({ session, reloadSession }) => {

    const [thisUsername, setUsername] = useState("")

    //вытянем запрос к мутации создания имени пользователя из полученного файла UserOperations
    //и присвоим ему имя функции [createUserName] которое будем использовать в коде
    const [createUserNameFunction, { loading, error }] = useMutation<CreateUserNameData, CreateUserNameVariables>(UserOperations.Mutations.createUserName)
    
    // console.log('HEARE IS DATA', data, loading, error)

    //Функция для создания пользовательского имени(отличного отаккаунта в google). Она будет создавать/регистрировать польз. имени создавая запись в документе коллекции users в коллекции БД на стороне сервера через мутацию GraphQL
    const onSubmit = async () => {
        //сначала выполнить проверку - заполнено-ли поле для ввода имени пользователя. Если нет, то будет вызывать запрос на выполнение мутации
        if (!thisUsername) return
            try {
                //ANCHOR мутация для отправки имени пользователя в GraphQL API
                //NOTE - деструктуировать данные из мутации нужно ЗДЕСЬ, а не при создании/инициировании функции createUserNameFunction --^^
                const { data } = await createUserNameFunction({ variables: { username: thisUsername } })//имени переменной username в мутации присваиваем имя переменной username созданной при создании в стейта useState 
            
                    //проверить данные(data) на валидность
                        //STEP-1 - если нет данных
                    if(!data?.createUserName){//createUserName - это поле из интерфейа(типа) TS CreateUserNameData. Содержит в себе определения типов для полей success и error
                        throw new Error()
                    }

                        //STEP-2 - если данные содержат ошибку (поле error представлено/заполнено)
                    if(data.createUserName.error){
                        //сначала вытянем эту ошибку из объекта определения createUserName data
                        const { createUserName: {error} } = data
                        //пробросим эту ошибку
                        throw new Error(error)
                    }
                
                    //------------SECTION----------- - 
                    //Вывести сообщения в зависимости от успешного создания имени, или, если такое имя уже занято то ошибку. Биилиотекой react-hot-toast
                    toast.success('Пользовательское имя успешно создано! 🚀')
                    //------------------------------
               
                //STEP-3 -  перезагрузить сеанс для получения имени пользователя
                             
                reloadSession()

            } catch (error: any) {
                toast.error(error?.message)
                console.log("Onsubmit Error", error)
            }
    }

    return (
        <Center height="100vh">
            <Stack spacing={8} align='center'>
                {session ? ( //если пользователь вошёл в систему (сессия создана то предложить создать кастомное имя (отличное от имени в Гугл-аккаунте)
                    <>
                        <Text fontSize='3xl'>Create a username</Text>
                        <Input placeholder="Enter a username" value={thisUsername} onChange={(event) => setUsername(event.target.value)} />
                        {/* в элементе Button из chakraUI будет активироваться ф-ция onSubmit из next-auth и реализуется сниппет isLoading(chakraUI)(при положительном значении loading хука резольвера useMutation на мутацию createUserName)*/}
                        <Button width='100%' onClick={onSubmit} isLoading={loading}>Save</Button>
                    </>

                ) : (//но если пользователь не в сеансе (не в системе) то вывести предложение войти. Вход через Гугл-аккаунт
                    <>
                        <Text fontSize='3xl'>MessengerQL</Text>
                        <Button onClick={() => signIn('google')} leftIcon={<Image height='20px' src='/images/googlelogo.png' />}>
                            Continue With Google
                        </Button>
                    </>
                )}
            </Stack>
        </Center>
    )
};

export default Auth;



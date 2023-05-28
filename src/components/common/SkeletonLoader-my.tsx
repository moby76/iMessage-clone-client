//компонент обеспечивающий предзагрузку: сообщений, диалогов, участников в зависимости от отправленных условий
// сниппет - tsrsfc
import { Skeleton } from '@chakra-ui/react';
import * as React from 'react';

interface SkeletonLoaderProps {
    count: number //счётчик элементов 
    height: string //высота элемента
    width: string //ширина элемента
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count, height, width }) => {
    return (
        <>
            {/* создать массив на основании числа = значению count. Массив как экземпляр объекта JS - Array . И выполнить перебор данного массива получив индексы  */}
            {[...Array(count)].map((_, i) => ( //ATTENTION - в случае простого рендеринга после указания => заключаем не в фигурные скобки {}, а в простые ()
                // и при каждой итерации массива поместим компонент Skeleton
                <Skeleton key={i}
                    startColor='blackAlpha.400'
                    endColor='whiteAlpha.300'
                    height={height}
                    width={{ //ширина определяется через медиа-запрос: Для мобильного - будет 100%, для среднего и шире = значению width
                        base: "full",
                        // md: width //FIXME - ?
                    }}
                    borderRadius={4}
                />
            ))}
        </>
    )
};

export default SkeletonLoader;

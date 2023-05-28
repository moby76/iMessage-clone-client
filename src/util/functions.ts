// эта функция получает массив участников из сгенерированного типа ParticipantPopulated с бэкенда и преобразует в список разделённый запятой

import { ParticipantPopulated } from "../../../server/src/util/types";

export const formatUsernames = ( participants: Array<ParticipantPopulated>, myUserId: string): string => {//1-й парам. - список участников, 2-й парам. - имя текущего авториз. польз.(меня)
  const usernames = participants
    .filter((participant) => participant.user.id != myUserId)//исключить своё имя из списка
    .map((participant) => participant.user.username);

  return usernames.join(", ");
};
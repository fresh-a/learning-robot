import { getLocal, setLocal } from "./storage";
import { ASSISTANT_INIT, ASSISTANT_STORE } from "./constant";
import type { AssistantList, Assistant } from "../types";

export const getList = (): AssistantList => {
  let list = getLocal(ASSISTANT_STORE) as AssistantList;
  if (!list) {
    list = ASSISTANT_INIT.map((item, index) => {
      return {
        ...item,
        id: index + Date.now.toString(),
      };
    });
    updateList(list);
  }
  return list;
};

export const updateList = (list: AssistantList) => {
  setLocal(ASSISTANT_STORE, list);
};

export const addAssistant = (assistant: Assistant) => {
  const list = getList();
  list.push(assistant);
  updateList(list);
  return list;
};

export const updateAssistant = (id: string, data: Partial<Omit<Assistant, "id">>) => {
  const list = getList();
  const index = list.findIndex((item) => item.id === id);
  if (index > -1) {
    list[index] = {
      ...list[index],
      ...data,
    };
    updateList(list);
  }
  return list;
};

export const removeAssistant = (id: string) => {
  const list = getList();
  const newList = list.filter((item) => item.id !== id);
  updateList(list);
  return newList;
};

export const getAssistant = (id: string): Assistant | null => {
  const list = getList();
  return list.find((item) => item.id === id) || null;
};

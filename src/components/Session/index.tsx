import { SessionList } from "@/pages/types";
import * as chatStorage from "@/pages/utils/chatStorage";
import React, { useEffect, useState } from "react";
import { IconTrash, IconMessagePlus } from "@tabler/icons-react";
import { ColorSchemeProvider } from "@mantine/core";
import { clsx } from "clsx";
import { useMantineColorScheme, ActionIcon } from "@mantine/core";
import { EdittableText } from "../EdittableText";

type Props = {
  sessionId: string;
  onChange: (arg: string) => void;
};
const itemBaseClasses =
  "flex cursor-pointer h-[2.4rem] items-center justify-around group px-4 rounded-md";

const generateItemClasses = (
  id: string,
  sessionId: string,
  colorScheme: string
) => {
  return clsx([
    itemBaseClasses,
    {
      "hover:bg-gray-300/60": colorScheme === "light",
      "bg-gray-200/60": id !== sessionId && colorScheme == "light",
      "bg-gray-300": id === sessionId && colorScheme === "light",
      "hover:bg-zinc-800/50": colorScheme === "dark",
      "bg-zinc-800/20": id !== sessionId && colorScheme === "dark",
      "bg-zinc-800/90": id !== sessionId && colorScheme === "dark",
    },
  ]);
};

export const Session = ({ sessionId, onChange,className }: Props) => {
  const [sessionList, setSessionList] = useState<SessionList>([]);
  const { colorScheme } = useMantineColorScheme();
  useEffect(() => {
    const list = chatStorage.getSessionStore();
    setSessionList(list);
  }, []);

  const createSession = () => {
    const newSession = {
      name: `session-${sessionList.length + 1}`,
      id: Date.now().toString(),
    };
    onChange(newSession.id);
    let list = chatStorage.addSession(newSession);
    setSessionList(list);
  };

  const removeSession = (id: string) => {
    let list = chatStorage.removeSession(id);
    if (sessionId === id) {
      onChange(list[0].id);
    }
    setSessionList(list);
  };

  const updateSession = (name: string) => {
    let newSessionList = chatStorage.updateSession(sessionId, {
      name,
    });
    setSessionList(newSessionList);
  };

  return (
    <div
      className={clsx(
        {
          "bg-black/10": colorScheme === "dark",
          "bg-gray-100": colorScheme === "light",
        },
        "h-screen",
        "w-64",
        "flex",
        "flex-col",
        "px-2",
        className,
      )}
    >
      <div className="flex justify-between item-center py-2 w-full">
        <ActionIcon onClick={() => createSession()} color="green" size="sm">
          <IconMessagePlus size="1rem" />
        </ActionIcon>
      </div>

      <div
        className={clsx([
          "pb-4",
          "overflow-y-auto",
          "scrollbar-none",
          "flex",
          "flex-col",
          "gap-y-2",
        ])}
      >
        {sessionList.map(({ id, name }) => (
          <div
            key={id}
            className={generateItemClasses(id, sessionId, colorScheme)}
            onClick={() => onChange(id)}
          >
            <EdittableText
              text={name}
              onSave={(name) => updateSession(name)}
            ></EdittableText>
            {sessionList.length > 1 ? (
              <IconTrash
                size=".8rem"
                color="gray"
                onClick={(evt) => {
                  evt.stopPropagation();
                  removeSession(id);
                }}
                className="mx-1 invisible group-hover:visible"
              ></IconTrash>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import chatService from "@/pages/utils/chatService";
import { Markdown } from "../Markdown";
import { Voice } from "../Voice";
import {
  ActionIcon,
  Loader,
  Textarea,
  useMantineColorScheme,
  Button,
  Popover,
} from "@mantine/core";
import Link from "next/link";
import * as chatStorage from "@/pages/utils/chatStorage";
import { ThemeSwitch } from "../ThemeSwitch";
import { USERMAP } from "@/pages/utils/constant";
import {
  IconSend,
  IconSendOff,
  IconEraser,
  IconDotsVertical,
  IconHeadphones,
  IconHeadphonesOff,
  IconUpload,
  IconTransfer,
  IconHttpDelete,
  IconTrash,
} from "@tabler/icons-react";
import { Assistant, MessageList } from "@/pages/types";
import clsx from "clsx";
import { AssistantSelect } from "../AssistantSelect";
import { createWorker } from "tesseract.js";
import Tesseract from "tesseract.js";
import Image from "next/image";
type Props = {
  sessionId: string;
};

export const Message = ({ sessionId }: Props) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageList>([]);
  const [assistant, setAssistant] = useState<Assistant>();
  const [mode, setMode] = useState<"text" | "voice">("text");
  const { colorScheme } = useMantineColorScheme();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ImageURL, setImageURL] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const updateMessage = (msg: MessageList) => {
    setMessage(msg);
    chatStorage.updateMessage(sessionId, msg);
  };

  chatService.actions = {
    onCompleting: (sug) => setSuggestion(sug),
    onCompleted: () => {
      setLoading(false);
    },
  };

  useEffect(() => {
    const session = chatStorage.getSession(sessionId);
    setAssistant(session?.assistant);
    const msg = chatStorage.getMessage(sessionId);
    setMessage(msg);
    if (loading) {
      chatService.cancel();
    }
  }, [sessionId, mode]);

  const onAssistantChange = (assistant: Assistant) => {
    setAssistant(assistant);
    chatStorage.updateSession(sessionId, {
      assistant: assistant.id,
    });
  };

  const onClear = () => {
    updateMessage([]);
  };

  //OCR component
  const uploadImg = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const imgToText = () => {
    if (ImageURL) {
      setLoading(true);
      Tesseract.recognize(ImageURL, "eng", {
        logger: (m) => console.log(m), // 可以用来监控进度
      })
        .then(({ data: { text } }) => {
          console.log(text);
          setPrompt(prompt + text);
          // 设置识别的文本
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageURL(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
      console.log("selected file", file.name);
    }
  };

  const removeImg = ()=>{
    setSelectedFile(null);
    setImageURL(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // 清空文件输入
    }
  }

  const onKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.keyCode === 13 && !evt.shiftKey) {
      evt.preventDefault();
      onSubmit();
    }
  };

  const setSuggestion = (suggestion: string) => {
    if (suggestion === "") return;
    const len = message.length;
    const lastMessage = len ? message[len - 1] : null;
    let newList: MessageList = [];
    if (lastMessage?.role === "assistant") {
      newList = [
        ...message.slice(0, len - 1),
        {
          ...lastMessage,
          content: suggestion,
        },
      ];
    } else {
      newList = [
        ...message,
        {
          role: "assistant",
          content: suggestion,
        },
      ];
    }
    setMessages(newList);
  };

  const setMessages = (msg: MessageList) => {
    setMessage(msg);
    chatStorage.updateMessage(sessionId, msg);
  };

  const onSubmit = () => {
    console.log(loading);
    if (loading) {
      return chatService.cancel();
    }
    if (!prompt.trim()) return;
    let list: MessageList = [
      ...message,
      {
        role: "user",
        content: prompt,
      },
    ];
    setMessages(list);
    setLoading(true);
    chatService.getStream({
      prompt,
      options: assistant,
      history: list.slice(-assistant?.max_log!),
    });
    setPrompt("");
  };

  return (
    <div className="h-screen flex flex-col  w-full">
      <div
        className={clsx([
          "flex",
          "justify-between",
          "items-center",
          "p-4",
          "shadow-sm",
          "h-[6rem]",
        ])}
      >
        <Popover width={100} position="bottom" withArrow shadow="sm">
          <Popover.Target>
            <Button
              size="sm"
              variant="subtle"
              className="px-1"
              rightIcon={<IconDotsVertical size="1rem"></IconDotsVertical>}
            >
              AI 助理
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Link href="/assistant" className="no-underline text-green-600">
              助理管理
            </Link>
          </Popover.Dropdown>
        </Popover>
        <div className="flex item-center">
          <AssistantSelect
            value={assistant?.id!}
            onChange={onAssistantChange}
          ></AssistantSelect>
          <ActionIcon
            size="sm"
            onClick={() => setMode(mode === "text" ? "voice" : "text")}
          >
            {mode === "text" ? (
              <IconHeadphones color="green" size="1rem"></IconHeadphones>
            ) : (
              <IconHeadphonesOff color="gray" size="1rem"></IconHeadphonesOff>
            )}
          </ActionIcon>
        </div>
        <ThemeSwitch></ThemeSwitch>
      </div>

      {mode === "text" ? (
        <>
          <div
            className={clsx([
              "flex-col",
              "h-[calc()100vh-10rem]",
              "w-full",
              "overflow-y-auto",
              "rounded-sm",
              "px-8",
            ])}
          >
            {message.map((item, idx) => {
              const isUser = item.role === "user";
              return (
                <div
                  key={`${item.role}-${idx}`}
                  className={clsx(
                    {
                      flex: item.role === "user",
                      "flex-col": item.role === "user",
                      "items-end": item.role === "user",
                    },
                    "mt-4"
                  )}
                >
                  <div>
                    {USERMAP[item.role]}
                    {!isUser && idx === message.length - 1 && loading && (
                      <Loader size="sm" variant="dots" className="ml-2" />
                    )}
                  </div>
                  <div
                    className={clsx(
                      {
                        "bg-gray-100": colorScheme === "light",
                        "bg-zinc-700/40": colorScheme === "dark",
                        "whitespace-break-spaces": isUser,
                      },
                      "rounded-md",
                      "shadow-md",
                      "px-4",
                      "py-2",
                      "mt-1",
                      "w-full",
                      "max-w-4xl",
                      "min-h-[3rem]"
                    )}
                  >
                    {isUser ? (
                      <div>{item.content}</div>
                    ) : (
                      <Markdown markdownText={item.content}></Markdown>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={clsx(
              "flex",
              "items-center",
              "justify-center",
              "self-end",
              "mv-4",
              "w-full"
            )}
          >
            <ActionIcon
              className="mr-2"
              title="Clear data"
              disabled={loading}
              onClick={() => onClear()}
            >
              <IconEraser></IconEraser>
            </ActionIcon>
            <ActionIcon
              className="mr-2"
              title="Upload img"
              disabled={loading}
              onClick={() => uploadImg()}
            >
              <IconUpload></IconUpload>
            </ActionIcon>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {selectedFile && ImageURL && (
              <div className="flex flex-row flex-wrap gap-[20px] m-4">
                <div className="flex items-center justify-center">
                  <ActionIcon
                    title="Img to text"
                    className="mr-2 rounded"
                    disabled={loading}
                    onClick={() => imgToText()}
                  >
                    <IconTransfer></IconTransfer>
                  </ActionIcon>
                </div>
                <div className="flex justify-center flex-col rounded-[20px] border w-[180px] h-[100px] relative border-gray-200 bg-primary-100 ">
                  <div title="Delete file" className="flex w-[20px] h-[20px] items-center justify-center rounded-full bg-gray-100 absolute top-[8px] left-[150px] z-10 text-red-600 cursor-pointer w-[16px] h-[16px]">
                 <IconTrash onClick={()=> removeImg()}></IconTrash>
                  </div>
                  <div className="flex flex-col items-center w-full relative">
                    <img
                      className="w-full h-[100px] relative rounded cursor-zoom-in object-cover"
                      src={ImageURL}
                    />
                  </div>
                </div>
              </div>
            )}
            <Textarea
              placeholder="Enter your prompt"
              className="w-3/5"
              value={prompt}
              disabled={loading}
              ref={textareaRef}
              onKeyDown={(evt) => onKeyDown(evt)}
              onChange={(evt) => setPrompt(evt.target.value)}
            ></Textarea>
            <ActionIcon
              color="green"
              className="ml-2"
              onClick={() => onSubmit()}
            >
              {loading ? <IconSendOff /> : <IconSend />}
            </ActionIcon>
          </div>

          {/* <div className="flex items-center w-3/5">
        <ActionIcon
          className="mr-2"
          disabled={loading}
          onClick={() => onClear()}
        >
          <IconEraser></IconEraser>
        </ActionIcon>
        <Textarea
          placeholder="Enter your prompt"
          className="w-full"
          value={prompt}
          disabled={loading}
          onKeyDown={(evt) => onKeyDown(evt)}
          onChange={(evt) => setPrompt(evt.target.value)}
        ></Textarea>
        <ActionIcon className="ml-2" onClick={() => onSubmit()}>
          {loading ? <IconSendOff /> : <IconSend />}
        </ActionIcon>
      </div> */}
        </>
      ) : (
        <div className="h-[calc(100vh-56rem)]  w-full">
          <Voice sessionId={sessionId} assistant={assistant!}>
            {" "}
          </Voice>
        </div>
      )}
    </div>
  );
};

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextRequest } from "next/server";
import { type MessageList } from "../types";
import {
  createParser,
  type ParsedEvent,
  type ReconnectInterval,
} from "eventsource-parser";
type StreamPayload = {
  model: string;
  messages: MessageList;
  temperature?: number;
  stream: boolean;
  max_tokens?: number;
};

export default async function handler(req: NextRequest) {
  const { prompt, history = [], options = {} } = await req.json();
  const data = {
    model: "moonshot-v1-8k",
    messages: [
      {
        role: "system",
        content:
          "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
      },
      ...history,
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
    ...options,
  };
  const stream = await requestStream(data);
  return new Response(stream);

}

//create a stream
const requestStream = async (payload: StreamPayload) => {
  let counter = 0;
  const resp = await fetch(`${process.env.END_POINT}v1/chat/completions`, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (resp.status !== 200) {
    return resp.body;
  }
  return createStream(resp, counter);
};

const createStream = (response: Response, counter: number) => {
  const decoder = new TextDecoder("utf-8");
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          if (event.data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(event.data);
            const text = json.choices[0]?.delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const q = encoder.encode(text);
            controller.enqueue(q);
            counter++;
          } catch (error) {}
        }
      };
      const parser = createParser(onParse);
      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
};

export const config = {
  runtime: "edge",
};

import { Configuration, OpenAIApi } from "openai";
import { Message } from "../messages/messages";

export async function getChatResponse(messages: Message[], apiKey: string) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const configuration = new Configuration({
    baseURL: 'http://127.0.0.1:11434/v1',
    apiKey: apiKey,
  });
  // ブラウザからAPIを叩くときに発生するエラーを無くすworkaround
  // https://github.com/openai/openai-node/issues/6#issuecomment-1492814621
  delete configuration.baseOptions.headers["User-Agent"];

  const openai = new OpenAIApi(configuration);

  const { data } = await openai.createChatCompletion({
    model: "gemma2:9b",
    messages: messages,
  });

  const [aiRes] = data.choices;
  const message = aiRes.message?.content || "エラーが発生しました";

  return { message: message };
}

export async function getChatResponseStream(messages: Message[], apiKey: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    const URL = "http://127.0.0.1:50000/stream_chat";

    const res = await fetch(URL, {
        headers: headers,
        method: "POST",
        body: JSON.stringify({
            model: "gemma2:9b",
            messages: messages,
            stream: true,
            max_tokens: 200,
        }),
    });

    const reader = res.body?.getReader();
    if (res.status !== 200 || !reader) {
        throw new Error("Something went wrong");
    }

    const stream = new ReadableStream({
        async start(controller: ReadableStreamDefaultController) {
        const decoder = new TextDecoder("utf-8");
        try {
            while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const data = decoder.decode(value);
            const chunks = data
                .split("\n")
                .filter((chunk) => !!chunk.trim());

            for (const chunk of chunks) {
                let json;
                try {
                    json = JSON.parse(chunk);
                } catch (e) {
                    console.error("JSON parsing error:", e);
                    continue;
                }

                if (json.message === "[done]") {
                    controller.close();
                    return;
                }

                const messagePiece = json.message;
                if (messagePiece) {
                    controller.enqueue(messagePiece);
                }
            }
            }
        } catch (error) {
            controller.error(error);
        } finally {
            reader.releaseLock();
            controller.close();
        }
        },
    });
    console.log("Stream:", stream);
    return stream;
}

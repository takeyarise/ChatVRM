import { Message } from "../messages/messages";

export async function getChatResponseStream(messages: Message[], apiKey: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    const URL = "http://127.0.0.1:50000/stream_chat";

    const res = await fetch(URL, {
        headers: headers,
        method: "POST",
        body: JSON.stringify({
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

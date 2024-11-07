import { Buffer  } from "buffer";
import { TalkStyle } from "../messages/messages";


export async function voicevox(message: string, talkStyle?: TalkStyle) {
    if (talkStyle === undefined || talkStyle == null){
    } else {
        // message = '[' + talkStyle.toString() + ']' + message;
    }

    const query = await fetch(
        'http://127.0.0.1:50021/audio_query'
        + '?speaker=8&text=' + encodeURIComponent(message),
        {
            method: 'POST',
        }
    )

    if (query.status !==  200){
        return;
    }

    const tts_json = await query.json();
    const response = await fetch(
        'http://127.0.0.1:50021/synthesis'
        + '?speaker=8',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Transfer-Encoding': 'chunked',
            },
            body: JSON.stringify(tts_json),
        }
    )

    if (!response.body){
        return;
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    return buffer;
}

export async function koeiromapV0(
  message: string,
  speakerX: number,
  speakerY: number,
  style: TalkStyle
) {
  const ret = voicevox(message, style);
  return ret;
}

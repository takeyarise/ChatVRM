import { Buffer  } from "buffer";
import { TalkStyle } from "../messages/messages";


export async function voicevox(message: string, talkStyle?: TalkStyle) {
    if (talkStyle === undefined || talkStyle == null){
    } else {
        message = '[' + talkStyle.toString() + '] ' + message;
    }

    const query = await fetch(
        'http://127.0.0.1:50021/audio_query'
        + '?speaker=3&text=' + encodeURIComponent(message),
        {
            method: 'POST',
        }
    )

    if (query.status !==  200){
        return;
    }

    const tts_json = await query.json();
    tts_json['speedScale'] = 1;
    tts_json['pitchScale'] = 1;
    tts_json['intonationScale'] = 1;
    const response = await fetch(
        'http://127.0.0.1:50021/synthesis'
        + '?speaker=3',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Transfer-Encoding': 'chunked',
            },
            body: JSON.stringify(tts_json),
        }
    )
    console.debug('voicevox', response);

    if (!response.body){
        return;
    }

    const res_body = response.body
    const base = Buffer.from(String.fromCharCode(...res_body)).toString('base64')
    return { audio: 'data:audio/wav;base64,' + base };
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

export async function koeiromapFreeV1(
  message: string,
  speakerX: number,
  speakerY: number,
  style: "talk" | "happy" | "sad",
  apiKey: string
) {
  const ret = voicevox(message, style);
  return ret;
}


// export async function koeiromapV0(
//   message: string,
//   speakerX: number,
//   speakerY: number,
//   style: TalkStyle
// ) {
//   const param = {
//     method: "POST",
//     body: JSON.stringify({
//       text: message,
//       speaker_x: speakerX,
//       speaker_y: speakerY,
//       style: style,
//     }),
//     headers: {
//       "Content-type": "application/json; charset=UTF-8",
//     },
//   };

//   const koeiroRes = await fetch(
//     "https://api.rinna.co.jp/models/cttse/koeiro",
//     param
//   );

//   const data = (await koeiroRes.json()) as any;

//   return { audio: data.audio };
// }

// export async function koeiromapFreeV1(
//   message: string,
//   speakerX: number,
//   speakerY: number,
//   style: "talk" | "happy" | "sad",
//   apiKey: string
// ) {
//   // Request body
//   const body = {
//     text: message,
//     speaker_x: speakerX,
//     speaker_y: speakerY,
//     style: style,
//     output_format: "mp3",
//   };

//   const koeiroRes = await fetch(
//     "https://api.rinna.co.jp/koeiromap/v1.0/infer",
//     {
//       method: "POST",
//       body: JSON.stringify(body),
//       headers: {
//         "Content-Type": "application/json",
//         "Cache-Control": "no-cache",
//         "Ocp-Apim-Subscription-Key": apiKey,
//       },
//     }
//   );

//   const data = (await koeiroRes.json()) as any;

//   return { audio: data.audio };
// }

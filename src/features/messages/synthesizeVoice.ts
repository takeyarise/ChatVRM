import { koeiromapV0 } from "../koeiromap/koeiromap";
import { TalkStyle } from "../messages/messages";

export async function synthesizeVoiceApi(
  message: string,
  speakerX: number,
  speakerY: number,
  style: TalkStyle,
  apiKey: string
): Promise<ArrayBuffer> {
    return await koeiromapV0(message, speakerX, speakerY, style);
}

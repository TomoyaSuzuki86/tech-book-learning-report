import {
  createClient,
  DEFAULT_STS_MODEL,
  DEFAULT_VOICE_ID,
  elevenLabsError,
} from "../../../lib/elevenlabs";

const MAX_BYTES = 50 * 1024 * 1024;

async function streamToBuffer(
  stream: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Buffer[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value?.length) chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  const { client, response } = createClient(request);
  if (!client) return response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "音声ファイルの送信形式が不正です。" },
      { status: 400 },
    );
  }

  const audio = formData.get("audio");
  const voiceIdRaw = formData.get("voiceId");

  if (!(audio instanceof File) || audio.size === 0) {
    return Response.json(
      { error: "音声を録音または選択してください。" },
      { status: 400 },
    );
  }

  if (audio.size > MAX_BYTES) {
    return Response.json(
      { error: "音声ファイルは50MB以下にしてください。" },
      { status: 413 },
    );
  }

  const voiceId =
    typeof voiceIdRaw === "string" && voiceIdRaw.trim()
      ? voiceIdRaw.trim()
      : DEFAULT_VOICE_ID;

  try {
    const stream = await client.speechToSpeech.convert(voiceId, {
      audio,
      modelId: DEFAULT_STS_MODEL,
      outputFormat: "mp3_44100_128",
    });
    const buffer = await streamToBuffer(stream);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return elevenLabsError(error, "ボイス変換に失敗しました。");
  }
}

import {
  createClient,
  DEFAULT_TTS_MODEL,
  DEFAULT_VOICE_ID,
  elevenLabsError,
} from "../../../lib/elevenlabs";

type Body = {
  text?: unknown;
  voiceId?: unknown;
};

export async function POST(request: Request) {
  const { client, response } = createClient(request);
  if (!client) return response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "JSON形式が不正です。" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const voiceId =
    typeof body.voiceId === "string" && body.voiceId.trim()
      ? body.voiceId.trim()
      : DEFAULT_VOICE_ID;

  if (!text) {
    return Response.json(
      { error: "読み上げる文章を入力してください。" },
      { status: 400 },
    );
  }

  try {
    const stream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId: DEFAULT_TTS_MODEL,
      outputFormat: "mp3_44100_128",
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return elevenLabsError(error, "読み上げ音声の生成に失敗しました。");
  }
}

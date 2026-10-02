import {
  DEFAULT_STS_MODEL,
  DEFAULT_VOICE_ID,
  elevenLabsFetchError,
  getApiKey,
  normalizeVoiceSettings,
  toApiVoiceSettings,
} from "../../../lib/elevenlabs";

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const apiKey = getApiKey(request);
  if (!apiKey) {
    return Response.json(
      { error: "ElevenLabs APIキーを入力してください。" },
      { status: 401 },
    );
  }

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
  const voiceSettingsRaw = formData.get("voiceSettings");

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

  let parsedSettings: unknown = null;
  if (typeof voiceSettingsRaw === "string" && voiceSettingsRaw.trim()) {
    try {
      parsedSettings = JSON.parse(voiceSettingsRaw);
    } catch {
      return Response.json(
        { error: "音声設定の形式が不正です。" },
        { status: 400 },
      );
    }
  }

  const upstreamForm = new FormData();
  upstreamForm.append("audio", audio, audio.name);
  upstreamForm.append("model_id", DEFAULT_STS_MODEL);
  upstreamForm.append(
    "voice_settings",
    JSON.stringify(
      toApiVoiceSettings(normalizeVoiceSettings(parsedSettings)),
    ),
  );

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/speech-to-speech/${encodeURIComponent(
        voiceId,
      )}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
        },
        body: upstreamForm,
      },
    );

    if (!response.ok) {
      return elevenLabsFetchError(response, "ボイス変換に失敗しました。");
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "ボイス変換に失敗しました。",
      },
      { status: 502 },
    );
  }
}

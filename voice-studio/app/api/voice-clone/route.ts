import {
  elevenLabsFetchError,
  getApiKey,
} from "../../../lib/elevenlabs";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 8;

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
      { error: "音声サンプルの送信形式が不正です。" },
      { status: 400 },
    );
  }

  const nameRaw = formData.get("name");
  const removeNoiseRaw = formData.get("removeBackgroundNoise");
  const files = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);

  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  const removeBackgroundNoise = removeNoiseRaw === "true";

  if (!name) {
    return Response.json(
      { error: "声の名前を入力してください。" },
      { status: 400 },
    );
  }

  if (files.length === 0) {
    return Response.json(
      { error: "音声サンプルを1件以上選択してください。" },
      { status: 400 },
    );
  }

  if (files.length > MAX_FILES) {
    return Response.json(
      { error: `音声サンプルは最大${MAX_FILES}件までです。` },
      { status: 400 },
    );
  }

  if (files.some((file) => file.size > MAX_FILE_BYTES)) {
    return Response.json(
      { error: "1ファイルあたり25MB以下にしてください。" },
      { status: 413 },
    );
  }

  const upstreamForm = new FormData();
  upstreamForm.append("name", name);
  upstreamForm.append(
    "remove_background_noise",
    String(removeBackgroundNoise),
  );
  files.forEach((file) => upstreamForm.append("files", file, file.name));

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: upstreamForm,
    });

    if (!response.ok) {
      return elevenLabsFetchError(
        response,
        "ボイスクローンの作成に失敗しました。",
      );
    }

    const data = (await response.json()) as {
      voice_id?: string;
      requires_verification?: boolean;
    };

    if (!data.voice_id) {
      return Response.json(
        { error: "ElevenLabsからVoice IDが返されませんでした。" },
        { status: 502 },
      );
    }

    return Response.json({
      voiceId: data.voice_id,
      requiresVerification: data.requires_verification ?? false,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ボイスクローンの作成に失敗しました。",
      },
      { status: 502 },
    );
  }
}

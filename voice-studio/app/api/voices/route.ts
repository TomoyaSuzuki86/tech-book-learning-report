import { createClient, elevenLabsError } from "../../../lib/elevenlabs";

export async function GET(request: Request) {
  const { client, response } = createClient(request);
  if (!client) return response;

  try {
    const result = await client.voices.getAll();
    const voices = (result.voices ?? [])
      .map((voice) => ({
        voiceId: voice.voiceId,
        name: voice.name ?? voice.voiceId,
        previewUrl: voice.previewUrl ?? null,
        category: voice.category ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ja"));

    return Response.json({ voices });
  } catch (error) {
    return elevenLabsError(error, "音声一覧の取得に失敗しました。");
  }
}

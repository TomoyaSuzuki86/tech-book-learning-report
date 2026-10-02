"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Voice = {
  voiceId: string;
  name: string;
  previewUrl: string | null;
  category: string | null;
};

type Mode = "tts" | "changer";

type VoiceSettings = {
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
  useSpeakerBoost: boolean;
};

const PRESETS = [
  {
    id: "natural",
    label: "ナチュラル",
    description: "自然なバランス",
    settings: { stability: 0.5, similarityBoost: 0.75, style: 0, speed: 1, useSpeakerBoost: true },
  },
  {
    id: "expressive",
    label: "感情豊か",
    description: "抑揚を強める",
    settings: { stability: 0.3, similarityBoost: 0.75, style: 0.6, speed: 0.98, useSpeakerBoost: true },
  },
  {
    id: "calm",
    label: "落ち着き",
    description: "安定してゆっくり",
    settings: { stability: 0.8, similarityBoost: 0.75, style: 0.12, speed: 0.9, useSpeakerBoost: true },
  },
  {
    id: "faithful",
    label: "声に忠実",
    description: "元の声へ寄せる",
    settings: { stability: 0.65, similarityBoost: 0.9, style: 0.05, speed: 1, useSpeakerBoost: true },
  },
  {
    id: "quick",
    label: "テンポ良く",
    description: "少し速め",
    settings: { stability: 0.55, similarityBoost: 0.75, style: 0.1, speed: 1.15, useSpeakerBoost: true },
  },
] as const;

const DEFAULT_SETTINGS: VoiceSettings = { ...PRESETS[0].settings };

function errorMessage(status: number, data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return `処理に失敗しました (HTTP ${status})`;
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [mode, setMode] = useState<Mode>("tts");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [connected, setConnected] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [text, setText] = useState(
    "こんにちは。これはVoice Studioの読み上げテストです。",
  );
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [presetId, setPresetId] = useState("natural");
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [cloneFiles, setCloneFiles] = useState<File[]>([]);
  const [removeCloneNoise, setRemoveCloneNoise] = useState(false);
  const [cloneConsent, setCloneConsent] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [notice, setNotice] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.voiceId === voiceId) ?? null,
    [voices, voiceId],
  );

  const keyHeaders = (): Record<string, string> =>
    apiKey.trim() ? { "x-elevenlabs-key": apiKey.trim() } : {};

  const clearResult = () => {
    setResultUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  };

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  useEffect(() => {
    if (resultUrl) {
      resultRef.current?.focus();
    }
  }, [resultUrl]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function connect() {
    setLoadingVoices(true);
    setError("");
    setNotice("");
    clearResult();

    try {
      const response = await fetch("/api/voices", { headers: keyHeaders() });
      const data = (await response.json()) as {
        voices?: Voice[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "音声一覧を取得できませんでした。");
      }

      const nextVoices = data.voices ?? [];
      if (nextVoices.length === 0) {
        throw new Error("利用可能な音声が見つかりませんでした。");
      }

      setVoices(nextVoices);
      setVoiceId((current) =>
        nextVoices.some((voice) => voice.voiceId === current)
          ? current
          : nextVoices[0].voiceId,
      );
      setConnected(true);
    } catch (cause) {
      setConnected(false);
      setVoices([]);
      setVoiceId("");
      setError(cause instanceof Error ? cause.message : "接続に失敗しました。");
    } finally {
      setLoadingVoices(false);
    }
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setPresetId(preset.id);
    setVoiceSettings({ ...preset.settings });
    clearResult();
  }

  function updateVoiceSetting<K extends keyof VoiceSettings>(
    key: K,
    value: VoiceSettings[K],
  ) {
    setPresetId("custom");
    setVoiceSettings((current) => ({ ...current, [key]: value }));
    clearResult();
  }

  async function cloneVoice() {
    if (!cloneName.trim() || cloneFiles.length === 0 || !cloneConsent) return;

    setCloning(true);
    setError("");
    setNotice("");

    try {
      const form = new FormData();
      form.append("name", cloneName.trim());
      form.append("removeBackgroundNoise", String(removeCloneNoise));
      cloneFiles.forEach((file) => form.append("files", file));

      const response = await fetch("/api/voice-clone", {
        method: "POST",
        headers: keyHeaders(),
        body: form,
      });
      const data = (await response.json().catch(() => ({}))) as {
        voiceId?: string;
        requiresVerification?: boolean;
        error?: string;
      };

      if (!response.ok || !data.voiceId) {
        throw new Error(data.error || "ボイスクローンを作成できませんでした。");
      }

      await connect();
      setVoiceId(data.voiceId);
      setCloneName("");
      setCloneFiles([]);
      setCloneConsent(false);
      setRemoveCloneNoise(false);
      setCloneOpen(false);
      setNotice(
        data.requiresVerification
          ? "クローンを作成しました。ElevenLabs側で追加の本人確認が必要です。"
          : "ボイスクローンを作成し、選択しました。",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "ボイスクローンの作成に失敗しました。",
      );
    } finally {
      setCloning(false);
    }
  }

  async function generateTts() {
    if (!connected || !voiceId || !text.trim()) return;

    setWorking(true);
    setError("");
    clearResult();

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...keyHeaders(),
        },
        body: JSON.stringify({ text, voiceId, voiceSettings }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(errorMessage(response.status, data));
      }

      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "読み上げに失敗しました。",
      );
    } finally {
      setWorking(false);
    }
  }

  function replaceSource(file: File | null) {
    setSourceFile(file);
    setSourceUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
    clearResult();
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file) replaceSource(file);
    event.target.value = "";
  }

  async function startRecording() {
    setError("");
    clearResult();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);

        const blob = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm",
        });
        replaceSource(
          new File([blob], "recording.webm", { type: blob.type }),
        );
      };

      recorderRef.current = recorder;
      streamRef.current = stream;
      recorder.start();
      setIsRecording(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "マイクを開始できませんでした。",
      );
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }

  async function convertVoice() {
    if (!connected || !voiceId || !sourceFile) return;

    setWorking(true);
    setError("");
    clearResult();

    try {
      const form = new FormData();
      form.append("audio", sourceFile);
      form.append("voiceId", voiceId);
      form.append("voiceSettings", JSON.stringify(voiceSettings));

      const response = await fetch("/api/voice-changer", {
        method: "POST",
        headers: keyHeaders(),
        body: form,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(errorMessage(response.status, data));
      }

      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "ボイス変換に失敗しました。",
      );
    } finally {
      setWorking(false);
    }
  }

  const modeTitle =
    mode === "tts" ? "テキストから音声を作る" : "声を別の声に変える";
  const modeDescription =
    mode === "tts"
      ? "文章を入力して、選んだ声で読み上げ音声を生成します。"
      : "内容・テンポ・抑揚をできるだけ残しながら、選んだ声へ変換します。";

  return (
    <main className="appShell">
      <header className="appHeader">
        <div className="brandRow">
          <div className="brandMark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div>
            <div className="eyebrow">ELEVENLABS POWERED</div>
            <h1>Voice Studio</h1>
          </div>
        </div>
        <p className="lead">
          APIキーを入れるだけ。読み上げとボイスチェンジを、ひとつの画面で。
        </p>
      </header>

      {error && (
        <div className="globalAlert" role="alert">
          <strong>処理できませんでした</strong>
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="globalNotice" role="status" aria-live="polite">
          {notice}
        </div>
      )}

      <div className="workspaceGrid">
        <aside className="setupPanel" aria-label="接続と音声設定">
          <section className="setupSection">
            <div className="stepHeading">
              <span className="stepNumber" aria-hidden="true">1</span>
              <div>
                <p className="stepLabel">接続</p>
                <h2>APIキー</h2>
              </div>
            </div>

            <label className="fieldLabel" htmlFor="apiKey">
              ElevenLabs APIキー
            </label>
            <div className="connectRow">
              <input
                className="textInput"
                id="apiKey"
                type="password"
                autoComplete="off"
                placeholder="sk_..."
                value={apiKey}
                aria-describedby="apiKeyHelp"
                onChange={(event) => {
                  setApiKey(event.target.value);
                  setConnected(false);
                  setVoices([]);
                  setVoiceId("");
                }}
              />
              <button
                className="primaryButton connectButton"
                type="button"
                disabled={loadingVoices}
                onClick={connect}
              >
                {loadingVoices ? "接続中…" : "接続"}
              </button>
            </div>
            <p className="helperText" id="apiKeyHelp">
              入力したキーは保存しません。空欄ならサーバー側の環境変数を使います。
            </p>

            <div
              className={`connectionState ${connected ? "isConnected" : ""}`}
              role="status"
              aria-live="polite"
            >
              <span className="statusDot" aria-hidden="true" />
              {connected
                ? `接続済み · ${voices.length} voices`
                : "未接続"}
            </div>
          </section>

          <div className="panelDivider" />

          <section className="setupSection">
            <div className="stepHeading">
              <span className="stepNumber" aria-hidden="true">2</span>
              <div>
                <p className="stepLabel">音声設定</p>
                <h2>声を選ぶ</h2>
              </div>
            </div>

            <div className="voiceFieldHeader">
              <label className="fieldLabel" htmlFor="voice">
                変換先の声
              </label>
              <button
                className="compactButton"
                type="button"
                aria-expanded={cloneOpen}
                aria-controls="voiceClonePanel"
                onClick={() => setCloneOpen((current) => !current)}
              >
                ＋ 声を作る
              </button>
            </div>
            <select
              className="selectInput"
              id="voice"
              disabled={!connected || voices.length === 0}
              value={voiceId}
              onChange={(event) => {
                setVoiceId(event.target.value);
                clearResult();
              }}
            >
              {!connected && (
                <option value="">先にAPIへ接続してください</option>
              )}
              {voices.map((voice) => (
                <option key={voice.voiceId} value={voice.voiceId}>
                  {voice.name}
                  {voice.category ? ` — ${voice.category}` : ""}
                </option>
              ))}
            </select>

            {cloneOpen && (
              <div className="clonePanel" id="voiceClonePanel">
                <div className="clonePanelHeading">
                  <strong>ボイスクローン</strong>
                  <span>許可を得た声だけを使用してください。</span>
                </div>

                <label className="fieldLabel" htmlFor="cloneName">
                  声の名前
                </label>
                <input
                  className="textInput"
                  id="cloneName"
                  value={cloneName}
                  onChange={(event) => setCloneName(event.target.value)}
                  placeholder="例：自分の声"
                  maxLength={100}
                />

                <label className="cloneUpload">
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={(event) =>
                      setCloneFiles(Array.from(event.target.files ?? []))
                    }
                  />
                  <span className="cloneUploadTitle">音声サンプルを選択</span>
                  <span className="cloneUploadDescription">
                    複数ファイルをまとめて選択できます。
                  </span>
                </label>

                {cloneFiles.length > 0 && (
                  <p className="fileSummary">
                    {cloneFiles.length}件選択 ·{" "}
                    {cloneFiles
                      .reduce((sum, file) => sum + file.size, 0)
                      .toLocaleString()} bytes
                  </p>
                )}

                <label className="checkboxRow">
                  <input
                    type="checkbox"
                    checked={removeCloneNoise}
                    onChange={(event) => setRemoveCloneNoise(event.target.checked)}
                  />
                  <span>
                    背景ノイズを除去する
                    <small>ノイズがない音声では品質が落ちる場合があります。</small>
                  </span>
                </label>

                <label className="checkboxRow consentRow">
                  <input
                    type="checkbox"
                    checked={cloneConsent}
                    onChange={(event) => setCloneConsent(event.target.checked)}
                  />
                  <span>
                    この声をクローンする権利・本人の許可があります
                  </span>
                </label>

                <button
                  className="primaryButton fullWidthButton"
                  type="button"
                  disabled={
                    cloning ||
                    !cloneName.trim() ||
                    cloneFiles.length === 0 ||
                    !cloneConsent
                  }
                  onClick={cloneVoice}
                >
                  {cloning ? "クローン作成中…" : "この声を作成"}
                </button>
              </div>
            )}

            {selectedVoice?.previewUrl ? (
              <div className="voicePreview">
                <div className="previewHeading">
                  <span>プレビュー</span>
                  <strong>{selectedVoice.name}</strong>
                </div>
                <audio controls src={selectedVoice.previewUrl} />
              </div>
            ) : (
              <p className="emptyHint">
                接続すると、利用できる声をここから選べます。
              </p>
            )}
            <div className="presetSection">
              <div className="presetHeading">
                <div>
                  <p className="stepLabel">声の雰囲気</p>
                  <h3>プリセット</h3>
                </div>
                {presetId === "custom" && (
                  <span className="customBadge">カスタム</span>
                )}
              </div>

              <div className="presetChips" aria-label="声のプリセット">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`presetChip ${presetId === preset.id ? "active" : ""}`}
                    type="button"
                    aria-pressed={presetId === preset.id}
                    onClick={() => applyPreset(preset)}
                  >
                    <strong>{preset.label}</strong>
                    <span>{preset.description}</span>
                  </button>
                ))}
              </div>

              <details className="advancedSettings">
                <summary>詳細設定</summary>
                <div className="settingsGrid">
                  <label className="rangeRow">
                    <span>
                      安定性
                      <output>{voiceSettings.stability.toFixed(2)}</output>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={voiceSettings.stability}
                      onChange={(event) =>
                        updateVoiceSetting("stability", Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="rangeRow">
                    <span>
                      声の類似度
                      <output>{voiceSettings.similarityBoost.toFixed(2)}</output>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={voiceSettings.similarityBoost}
                      onChange={(event) =>
                        updateVoiceSetting(
                          "similarityBoost",
                          Number(event.target.value),
                        )
                      }
                    />
                  </label>
                  <label className="rangeRow">
                    <span>
                      表現の強さ
                      <output>{voiceSettings.style.toFixed(2)}</output>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={voiceSettings.style}
                      onChange={(event) =>
                        updateVoiceSetting("style", Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="rangeRow">
                    <span>
                      速度
                      <output>{voiceSettings.speed.toFixed(2)}×</output>
                    </span>
                    <input
                      type="range"
                      min="0.7"
                      max="1.2"
                      step="0.05"
                      value={voiceSettings.speed}
                      onChange={(event) =>
                        updateVoiceSetting("speed", Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="checkboxRow speakerBoostRow">
                    <input
                      type="checkbox"
                      checked={voiceSettings.useSpeakerBoost}
                      onChange={(event) =>
                        updateVoiceSetting("useSpeakerBoost", event.target.checked)
                      }
                    />
                    <span>
                      Speaker Boost
                      <small>元の声への近さを強めます。</small>
                    </span>
                  </label>
                </div>
              </details>
            </div>
          </section>
        </aside>

        <section
          className="workPanel"
          aria-labelledby="workTitle"
          aria-busy={working}
        >
          <div className="workHeader">
            <div className="stepHeading">
              <span className="stepNumber stepNumberAccent" aria-hidden="true">
                3
              </span>
              <div>
                <p className="stepLabel">作成</p>
                <h2 id="workTitle">{modeTitle}</h2>
              </div>
            </div>
            <p className="workDescription">{modeDescription}</p>
          </div>

          <div className="modeTabs" role="tablist" aria-label="音声作成モード">
            <button
              id="ttsTab"
              className={`modeTab ${mode === "tts" ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={mode === "tts"}
              aria-controls="ttsPanel"
              onClick={() => {
                setMode("tts");
                setError("");
                clearResult();
              }}
            >
              テキスト読み上げ
            </button>
            <button
              id="changerTab"
              className={`modeTab ${mode === "changer" ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={mode === "changer"}
              aria-controls="changerPanel"
              onClick={() => {
                setMode("changer");
                setError("");
                clearResult();
              }}
            >
              ボイスチェンジャー
            </button>
          </div>

          {mode === "tts" ? (
            <div
              className="modePanel"
              id="ttsPanel"
              role="tabpanel"
              aria-labelledby="ttsTab"
            >
              <div className="fieldHeader">
                <label className="fieldLabel" htmlFor="ttsText">
                  読み上げる文章
                </label>
                <span className="charCount">{text.length}文字</span>
              </div>
              <textarea
                className="textArea"
                id="ttsText"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="読み上げる文章を入力"
              />

              <button
                className="primaryButton fullWidthButton"
                type="button"
                disabled={
                  !connected || !voiceId || !text.trim() || working
                }
                onClick={generateTts}
              >
                {working ? "音声を生成中…" : "読み上げ音声を生成"}
              </button>

              {!connected && (
                <p className="actionHint">
                  まず左側の「1 APIキー」で接続してください。
                </p>
              )}
            </div>
          ) : (
            <div
              className="modePanel"
              id="changerPanel"
              role="tabpanel"
              aria-labelledby="changerTab"
            >
              <label className="uploadArea">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={chooseFile}
                />
                <span className="uploadTitle">音声ファイルを選ぶ</span>
                <span className="uploadDescription">
                  MP3 / WAV / M4A / WebM など。最大50MB。
                </span>
              </label>

              <div className="orDivider" aria-hidden="true">
                <span>または</span>
              </div>

              <div className="recordActions">
                {!isRecording ? (
                  <button
                    className="secondaryButton recordButton"
                    type="button"
                    onClick={startRecording}
                    aria-pressed="false"
                  >
                    <span className="recordDot" aria-hidden="true" />
                    マイクで録音
                  </button>
                ) : (
                  <button
                    className="recordingButton"
                    type="button"
                    onClick={stopRecording}
                    aria-pressed="true"
                  >
                    <span className="recordingPulse" aria-hidden="true" />
                    録音を停止
                  </button>
                )}

                {sourceFile && (
                  <button
                    className="textButton"
                    type="button"
                    onClick={() => replaceSource(null)}
                  >
                    音声をクリア
                  </button>
                )}
              </div>

              {sourceUrl && (
                <div className="sourceAudio">
                  <div className="previewHeading">
                    <span>変換元</span>
                    <strong>{sourceFile?.name}</strong>
                  </div>
                  <audio controls src={sourceUrl} />
                </div>
              )}

              <button
                className="primaryButton fullWidthButton"
                type="button"
                disabled={
                  !connected ||
                  !voiceId ||
                  !sourceFile ||
                  working ||
                  isRecording
                }
                onClick={convertVoice}
              >
                {working ? "声を変換中…" : "この声に変換"}
              </button>

              {!connected && (
                <p className="actionHint">
                  まず左側の「1 APIキー」で接続してください。
                </p>
              )}
            </div>
          )}

          {resultUrl && (
            <div
              className="resultCard"
              ref={resultRef}
              tabIndex={-1}
              aria-live="polite"
            >
              <div>
                <p className="resultEyebrow">生成完了</p>
                <h3>音声ができました</h3>
              </div>
              <audio controls src={resultUrl} />
              <a
                className="downloadButton"
                href={resultUrl}
                download={
                  mode === "tts" ? "speech.mp3" : "voice-changed.mp3"
                }
              >
                MP3を保存
              </a>
            </div>
          )}
        </section>
      </div>

      <footer className="appFooter">
        APIキー・入力テキスト・音声ファイルはブラウザ内へ永続保存しません。
      </footer>
    </main>
  );
}

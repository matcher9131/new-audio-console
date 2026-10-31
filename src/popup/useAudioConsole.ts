import { use, useCallback, useState } from "react";
import {
  type AudioParams,
  type BackgroundMessage,
  type OffscreenMessage,
} from "../shared/types";
import { DEFAULT_PARAMS } from "../shared/const";

/**
 * アクティブなタブの音声キャプチャを開始 (または既存の状態を復元) する。
 * popup は開くたびにモジュールが読み込まれるので、ここで1回だけ実行すれば「開く = 開始」になる。
 * Promise をレンダー内で作ると毎回新しくなってしまうため、モジュールスコープで保持する。
 */
const initPromise = (async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) throw new Error("No active tab");
  const tabId = tab.id;

  // すでにキャプチャ中なら現在値を復元する (offscreen が無い場合は応答なし → null 扱い)
  const current: AudioParams | null = await chrome.runtime
    .sendMessage<OffscreenMessage>({ target: "offscreen", type: "get-params", tabId })
    .catch(() => null);
  if (current) return { tabId, params: current };

  // 未キャプチャなら開始する。popup を開いた直後なので activeTab が付与済み
  const res = await chrome.runtime.sendMessage<BackgroundMessage, { ok: boolean; error?: string }>({
    type: "capture-start",
    tabId,
  });
  if (!res?.ok) throw new Error(res?.error ?? "Failed to start capture");
  return { tabId, params: DEFAULT_PARAMS };
})();

/** <Suspense> と <ErrorBoundary> の内側で使うこと (初期化が終わるまで待機し、失敗時は throw する) */
export function useAudioConsole() {
  const { tabId, params: initial } = use(initPromise);
  const [params, setParams] = useState<AudioParams>(initial);

  /** 変更したい項目だけ渡す。例: update({ volume: 0.8 }) / update({ bands: [...] }) */
  const update = useCallback(
    (patch: Partial<AudioParams>) => {
      setParams((p) => ({ ...p, ...patch }));
      chrome.runtime.sendMessage<OffscreenMessage>({
        target: "offscreen",
        type: "set-params",
        tabId,
        params: patch,
      });
    },
    [tabId],
  );

  /** キャプチャを止めて元の状態に戻す */
  const stop = useCallback(() => {
    chrome.runtime.sendMessage<BackgroundMessage>({ type: "capture-stop", tabId });
  }, [tabId]);

  return { params, update, stop };
}

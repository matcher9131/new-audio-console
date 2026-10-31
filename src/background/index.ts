import type { BackgroundMessage, OffscreenMessage } from "../shared/types";

const OFFSCREEN_URL = "offscreen.html";

async function ensureOffscreenDocument() {
  const existing = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  });
  if (existing.length > 0) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: [chrome.offscreen.Reason.USER_MEDIA],
    justification: "Process tab audio with Web Audio API (volume, pan, EQ)",
  });
}

function sendToOffscreen(message: OffscreenMessage) {
  return chrome.runtime.sendMessage(message);
}

async function startCapture(tabId: number) {
  await ensureOffscreenDocument();
  // 拡張機能のアイコンをクリック (= popup を開く) して activeTab が付与されたタブでのみ成功する
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });
  return sendToOffscreen({ target: "offscreen", type: "start", tabId, streamId });
}

chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  switch (message?.type) {
    case "capture-start":
      startCapture(message.tabId)
        .then(sendResponse)
        .catch((e) => sendResponse({ ok: false, error: String(e) }));
      return true;
    case "capture-stop":
      sendToOffscreen({ target: "offscreen", type: "stop", tabId: message.tabId });
      break;
  }
});

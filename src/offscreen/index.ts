import { DEFAULT_PARAMS, EQ_FREQUENCIES } from "../shared/const";
import type { AudioParams, OffscreenMessage } from "../shared/types";

type Session = {
  ctx: AudioContext;
  stream: MediaStream;
  filters: BiquadFilterNode[];
  panner: StereoPannerNode;
  gain: GainNode;
  params: AudioParams;
};

const sessions = new Map<number, Session>();

async function start(tabId: number, streamId: string) {
  if (sessions.has(tabId)) return;

  // background で取得した streamId から、タブ音声の MediaStream を作る
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
    video: false,
  } as unknown as MediaStreamConstraints);

  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);

  // EQ: 両端は shelf、それ以外は peaking にして直列に繋ぐ
  const last = EQ_FREQUENCIES.length - 1;
  const filters = EQ_FREQUENCIES.map((freq, i) => {
    const filter = ctx.createBiquadFilter();
    filter.type = i === 0 ? "lowshelf" : i === last ? "highshelf" : "peaking";
    filter.frequency.value = freq;
    filter.Q.value = 1.4;
    return filter;
  });
  const panner = ctx.createStereoPanner();
  const gain = ctx.createGain();

  // source → EQ → pan → volume → destination
  // キャプチャ中は元のタブがミュートされるので、destination へ繋ぎ直して再生する
  [source, ...filters, panner, gain, ctx.destination].reduce((a, b) =>
    (a.connect(b as AudioNode), b),
  );

  const session: Session = {
    ctx,
    stream,
    filters,
    panner,
    gain,
    params: structuredClone(DEFAULT_PARAMS),
  };
  sessions.set(tabId, session);

  // タブ側でキャプチャが終わった (タブを閉じた等) ら後始末する
  stream.getAudioTracks()[0]?.addEventListener("ended", () => stop(tabId));
}

function stop(tabId: number) {
  const session = sessions.get(tabId);
  if (!session) return;
  // トラックを止めるとキャプチャが解除され、元のタブの音が戻る
  session.stream.getTracks().forEach((t) => t.stop());
  void session.ctx.close();
  sessions.delete(tabId);
}

function setParams(tabId: number, patch: Partial<AudioParams>) {
  const session = sessions.get(tabId);
  if (!session) return;
  const t = session.ctx.currentTime;
  // setTargetAtTime でなめらかに変化させ、つまみ操作時のプツプツ音 (zipper noise) を防ぐ
  if (patch.volume !== undefined) {
    session.gain.gain.setTargetAtTime(patch.volume, t, 0.015);
  }
  if (patch.pan !== undefined) {
    session.panner.pan.setTargetAtTime(patch.pan, t, 0.015);
  }
  patch.bands?.forEach((db, i) => session.filters[i]?.gain.setTargetAtTime(db, t, 0.015));
  session.params = { ...session.params, ...patch };
}

chrome.runtime.onMessage.addListener((message: OffscreenMessage, _sender, sendResponse) => {
  if (message?.target !== "offscreen") return;
  switch (message.type) {
    case "start":
      start(message.tabId, message.streamId)
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: String(e) }));
      return true; // 非同期で sendResponse する
    case "stop":
      stop(message.tabId);
      break;
    case "set-params":
      setParams(message.tabId, message.params);
      break;
    case "get-params":
      sendResponse(sessions.get(message.tabId)?.params ?? null);
      break;
  }
});

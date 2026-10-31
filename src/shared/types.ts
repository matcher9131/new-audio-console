export type AudioParams = {
  /** 音量 (0 = 無音, 1 = 等倍, 1 を超えると増幅) */
  readonly volume: number;

  /** パン (-1 = 左, 0 = 中央, 1 = 右) */
  readonly pan: number;

  /** 各バンドのゲイン (dB)。EQ_FREQUENCIES と同じ長さ */
  readonly bands: readonly number[];
};

/** popup → background */
export type BackgroundMessage =
  | { 
    readonly type: "capture-start";
    readonly tabId: number;
  }
  | {
    readonly type: "capture-stop"; 
    readonly tabId: number;
  };

/** popup, background → offscreen。target で background との取り違えを防ぐ */
export type OffscreenMessage = { readonly target: "offscreen" } & (
  | { 
    readonly type: "start"; 
    readonly tabId: number; 
    readonly streamId: string;
  }
  | {
    readonly type: "stop"; 
    readonly tabId: number;
  }
  | { 
    readonly type: "set-params"; 
    readonly tabId: number; 
    readonly params: Partial<AudioParams>; 
  }
  | {
    readonly type: "get-params";
    readonly tabId: number;
  }
);

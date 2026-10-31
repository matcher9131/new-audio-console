import { AudioParams } from "./types";

export const EQ_FREQUENCIES = [
  31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
] as const;

export const DEFAULT_PARAMS: AudioParams = {
  volume: 1,
  pan: 0,
  bands: EQ_FREQUENCIES.map(() => 0),
};

export const EQ_PRESETS: Readonly<Record<string, readonly number[]>> = {
  "Default": [...DEFAULT_PARAMS.bands],
  "Eargasm Explosion": [3, 6, 9, 7, 6, 5, 7, 4, 11, 8],
  "Bass Boost": [4, 6, 4, 0, -1, 0, 0, 0, 0, 0]
};

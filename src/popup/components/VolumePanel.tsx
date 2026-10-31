import { ChangeEvent } from "react";
import { AudioParams } from "../../shared/types";

type VolumePanelProps = {
  readonly volume: number;
  readonly update: (patch: Partial<AudioParams>) => void;
};

export function VolumePanel({ volume, update }: VolumePanelProps) {
  const db = 20 * Math.log10(volume);

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVolume = 10 ** (parseFloat(e.target.value) / 20);
    update({ volume: newVolume });
  };
  const handleClickResetVolume = () => {
    update({ volume: 1 });
  };

  return (
    <fieldset className="fieldset border border-base-100 rounded-box px-2">
      <legend className="fieldset-legend">Volume</legend>
      <div className="flex items-center gap-2">
        <input type="range"
          min={-12}
          max={12}
          step={0.1}
          value={db}
          className="flex-1 range"
          onChange={handleVolumeChange}
        />
        <span className="inline-block w-8 text-right text-sm">{db.toFixed(1)}</span>
        <button
          onClick={handleClickResetVolume}
          className="btn btn-sm btn-secondary"
        >
          Reset
        </button>
      </div>
    </fieldset>
  )
}
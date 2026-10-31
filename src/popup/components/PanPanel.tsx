import { ChangeEvent } from "react";
import { AudioParams } from "../../shared/types";

type PanPanelProps = {
  readonly pan: number;
  readonly update: (patch: Partial<AudioParams>) => void;
};

export function PanPanel({ pan, update }: PanPanelProps) {
  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) => {
    update({ pan: parseFloat(e.target.value) });
  };
  const handleClickResetPan = () => {
    update({ pan: 0 });
  };

  return (
    <fieldset className="fieldset border border-base-100 rounded-box px-2">
      <legend className="fieldset-legend">Pan</legend>
      <div className="flex items-center gap-2">
        <input type="range"
          min={-1}
          max={1}
          step={0.05}
          value={pan}
          className="flex-1 range"
          onChange={handlePanChange}
        />
        <span className="inline-block w-8 text-right text-sm">{pan.toFixed(2)}</span>
        <button
          onClick={handleClickResetPan}
          className="btn btn-sm btn-secondary"
        >
          Reset
        </button>
      </div>
    </fieldset>
  )
}
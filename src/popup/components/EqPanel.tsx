import { ChangeEvent, useId, useState } from "react";
import { AudioParams } from "../../shared/types";
import { EQ_FREQUENCIES, EQ_PRESETS } from "../../shared/const";

type EqPanelProps = {
  readonly bands: readonly number[];
  readonly update: (patch: Partial<AudioParams>) => void;
};

export function EqPanel({ bands, update }: EqPanelProps) {
  const bandsWithFrequency = EQ_FREQUENCIES.map((f, i) => [f, bands[i]] as [number, number]);
  const [selectedPreset, setSelectedPreset] = useState("Default");
  const presetSelectId = useId();

  const handleEqChange = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const newBands = bands.with(i, parseFloat(e.target.value));
    update({ bands: newBands });
  };
  const handlePresetChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPreset(e.target.value);
  };
  const handleApplyPresetClick = () => {
    const newBands = EQ_PRESETS[selectedPreset];
    if (newBands !== undefined) {
      update({ bands: newBands });
    }
  }

  return (
    <fieldset className="fieldset border border-base-100 rounded-box px-2">
      <legend className="fieldset-legend">Graphic Eq</legend>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor={presetSelectId}>Preset:</label>
          <select id={presetSelectId} value={selectedPreset} onChange={handlePresetChange} className="select">
            {Object.entries(EQ_PRESETS).map(([name]) =>
              <option key={name}>{name}</option>
            )}
          </select>
          <button onClick={handleApplyPresetClick} className="btn btn-sm btn-primary">Apply</button>
        </div>
        <div className="w-full h-60 flex justify-between">
          {bandsWithFrequency.map(([f, db], i) =>
            <div className="w-7 flex flex-col items-center" key={f}>
              <span>{f >= 1000 ? `${f / 1000}k` : `${f}`}</span>
              <input type="range"
                max={12}
                min={-12}
                step={0.1}
                value={db}
                onChange={handleEqChange(i)}
                className="range range-vertical"
              />
              <span>{db.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </fieldset>
  );
}

import { useAudioConsole } from "./useAudioConsole";
import { VolumePanel } from "./components/VolumePanel";
import { PanPanel } from "./components/PanPanel";
import { EqPanel } from "./components/EqPanel";

export function App() {
  const { params, update } = useAudioConsole();
  const { volume, pan, bands } = params;

  return (
    <main className="flex flex-col gap-2 p-4 w-96">
      <VolumePanel volume={volume} update={update} />
      <PanPanel pan={pan} update={update} />
      <EqPanel bands={bands} update={update} />
    </main>
  );
}

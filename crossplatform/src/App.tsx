import { useEffect } from "react";
import { AppTheme as T } from "./theme";
import { Toolbar } from "./components/Toolbar";
import { MediaPanel } from "./components/MediaPanel";
import { Preview } from "./components/Preview";
import { Inspector } from "./components/Inspector";
import { Timeline } from "./components/Timeline";
import { useEditor } from "./state/editorStore";

export default function App() {
  const togglePlay = useEditor((s) => s.togglePlay);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", background: T.Background.base, overflow: "hidden" }}>
      <Toolbar />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <MediaPanel />
        <Preview />
        <Inspector />
      </div>
      <Timeline />
    </div>
  );
}

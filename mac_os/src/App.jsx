import React, { useState, useEffect } from "react";
import All_icons from "./components/All_icons";
import Nav from "./components/Nav";
import Github from "./components/windows/Github";
import Note from "./components/windows/Note";
import Resume from "./components/windows/Resume";
import Spotify from "./components/windows/Spotify";
import Cli from "./components/windows/Cli";

const App = () => {

  /* ===== Dock visibility logic ===== */
  const [showDock, setShowDock] = useState(true);

  useEffect(() => {
    const handleMove = (e) => {
      const fromBottom = window.innerHeight - e.clientY;
      const fullscreen = document.documentElement.classList.contains("fullscreen-mode");

      if (fullscreen) {
        setShowDock(fromBottom < 90);   // show only near bottom
      } else {
        setShowDock(true);
      }
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  /* ===== Window state ===== */
  const [windowState, setWindowState] = useState({
    active: null,
    apps: {
      github: "closed",
      note: "closed",
      resume: "closed",
      spotify: "closed",
      cli: "closed",
    },
  });

  return (
    <main className="main_folder">
      <Nav />

      <All_icons
        showDock={showDock}
        windowState={windowState}
        setWindowState={setWindowState}
      />

      {windowState.active === "github" && <Github windowName="github" setWindowState={setWindowState} />}
      {windowState.active === "note" && <Note windowName="note" setWindowState={setWindowState} />}
      {windowState.active === "resume" && <Resume windowName="resume" setWindowState={setWindowState} />}
      {windowState.active === "spotify" && <Spotify windowName="spotify" setWindowState={setWindowState} />}
      {windowState.active === "cli" && <Cli windowName="cli" setWindowState={setWindowState} />}
    </main>
  );
};

export default App;

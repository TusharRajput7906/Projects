import React, { useState, useEffect } from "react";
import All_icons from "./components/All_icons";
import Nav from "./components/Nav";
import Github from "./components/windows/Github";
import Note from "./components/windows/Note";
import Resume from "./components/windows/Resume";
import Spotify from "./components/windows/Spotify";
import Cli from "./components/windows/Cli";
import BootScreen from "./components/BootScreen";
import Certificates from "./components/windows/Certificates";

const App = () => {
  const [booting, setBooting] = useState(true);

  const [wallpaper, setWallpaper] = useState("/wallpapers/w1.jpg");
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenu({ visible: true, x: e.clientX, y: e.clientY });
  };

  const closeMenu = () => {
    setMenu({ ...menu, visible: false });
  };

  /* ===== Dock visibility logic ===== */
  const [showDock, setShowDock] = useState(true);

  useEffect(() => {
    const handleMove = (e) => {
      const fromBottom = window.innerHeight - e.clientY;
      const fullscreen =
        document.documentElement.classList.contains("fullscreen-mode");

      if (fullscreen) {
        setShowDock(fromBottom < 90); // show only near bottom
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
      certificates: "closed",
    },
  });

  return (
    <>
      {booting && <BootScreen onFinish={() => setBooting(false)} />}

      <main
        className="main_folder"
        onClick={closeMenu}
        onContextMenu={handleContextMenu}
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Nav />

        <All_icons
          showDock={showDock}
          windowState={windowState}
          setWindowState={setWindowState}
        />

        {menu.visible && (
          <div className="context-menu" style={{ top: menu.y, left: menu.x }}>
            <div onClick={() => setWallpaper("/wallpapers/w1.jpg")}>
              Mountain
            </div>
            <div onClick={() => setWallpaper("/wallpapers/w2.jpg")}>Night</div>
            <div onClick={() => setWallpaper("/wallpapers/w3.jpg")}>
              Abstract
            </div>
            <div onClick={() => setWallpaper("/wallpapers/w4.jpg")}>Ocean</div>
          </div>
        )}

        {windowState.active === "github" && (
          <Github windowName="github" setWindowState={setWindowState} />
        )}
        {windowState.active === "note" && (
          <Note windowName="note" setWindowState={setWindowState} />
        )}
        {windowState.active === "resume" && (
          <Resume windowName="resume" setWindowState={setWindowState} />
        )}
        {windowState.active === "spotify" && (
          <Spotify windowName="spotify" setWindowState={setWindowState} />
        )}
        {windowState.active === "certificates" && (
          <Certificates
            windowName="certificates"
            setWindowState={setWindowState}
          />
        )}
        {windowState.active === "cli" && (
          <Cli windowName="cli" setWindowState={setWindowState} />
        )}
      </main>
    </>
  );
};

export default App;

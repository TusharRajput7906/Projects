import React from "react";
import "./All_icons.scss";

const All_icons = ({ windowState, setWindowState, showDock }) => {

  const openOnly = (key) => {
    setWindowState(state => ({
      active: key,
      apps: { ...state.apps, [key]: "open" }
    }));
  };

  const mail = () => {
    const to = "tusharsingh7906rajput@gmail.com";
    const body = `Hi Tushar,

I visited your portfolio and would like to connect.

Name:
Email:
Message:`;

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  };

  return (
    <footer className={`all_icons ${showDock ? "dock-show" : "dock-hide"}`}>

      {/* Github */}
      <div className="dock-item">
        <img onClick={() => openOnly("github")} className="icon github" src="/doc_icons/github.svg"/>
        <span className="dock-label">Github</span>
        <div className={`dock-dot ${windowState.apps.github !== "closed" ? "active" : ""}`}></div>
      </div>

      {/* Notes */}
      <div className="dock-item">
        <img onClick={() => openOnly("note")} className="icon note" src="/doc_icons/note.svg"/>
        <span className="dock-label">Notes</span>
        <div className={`dock-dot ${windowState.apps.note !== "closed" ? "active" : ""}`}></div>
      </div>

      {/* Resume */}
      <div className="dock-item">
        <img onClick={() => openOnly("resume")} className="icon pdf" src="/doc_icons/pdf.svg"/>
        <span className="dock-label">Resume</span>
        <div className={`dock-dot ${windowState.apps.resume !== "closed" ? "active" : ""}`}></div>
      </div>

      {/* Calendar */}
      <div className="dock-item">
        <img onClick={() => window.open("https://calendar.google.com","_blank")} className="icon calender" src="/doc_icons/calender.svg"/>
        <span className="dock-label">Calendar</span>
        <div className="dock-dot"></div>
      </div>

      {/* Spotify */}
      <div className="dock-item">
        <img onClick={() => openOnly("spotify")} className="icon spotify" src="/doc_icons/spotify.svg"/>
        <span className="dock-label">Spotify</span>
        <div className={`dock-dot ${windowState.apps.spotify !== "closed" ? "active" : ""}`}></div>
      </div>

      {/* Mail */}
      <div className="dock-item">
        <img onClick={mail} className="icon mail" src="/doc_icons/mail.svg"/>
        <span className="dock-label">Mail</span>
        <div className="dock-dot"></div>
      </div>

      {/* LinkedIn */}
      <div className="dock-item">
        <img onClick={() => window.open("https://www.linkedin.com/in/tushar-rajput-88a837279/","_blank")} className="icon link" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/250px-LinkedIn_logo_initials.png"/>
        <span className="dock-label">LinkedIn</span>
        <div className="dock-dot"></div>
      </div>
<div className="dock-item">
  <img
    onClick={() => openOnly("certificates")}
    className="icon folder"
    src="https://static.vecteezy.com/system/resources/thumbnails/005/911/684/small/business-agreement-icon-certificate-symbol-for-your-web-site-logo-app-ui-design-free-vector.jpg"
  />
  <span className="dock-label">Certificates</span>
  <div className={`dock-dot ${windowState.apps.certificates !== "closed" ? "active" : ""}`}></div>
</div>

      {/* Terminal */}
      <div className="dock-item">
        <img onClick={() => openOnly("cli")} className="icon cli" src="/doc_icons/cli.svg"/>
        <span className="dock-label">Terminal</span>
        <div className={`dock-dot ${windowState.apps.cli !== "closed" ? "active" : ""}`}></div>
      </div>

    </footer>
  );
};

export default All_icons;

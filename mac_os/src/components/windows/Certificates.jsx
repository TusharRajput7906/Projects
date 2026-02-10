import React, { useState } from "react";
import MacWindow from "./MacWindow";
// import { certificates } from '/src/data/CertificateData';
import { certificates } from "../../data/CertificateData";
import "./certificates.scss";

const Certificates = ({ windowName, setWindowState }) => {

  // which certificate is open
  const [selected,setSelected]=useState(null);

  const [preview, setPreview] = useState(null);

React.useEffect(()=>{
  const handler=(e)=>{
    if(!selected) return;

    if(e.key==="Enter") setPreview(selected);
    if(e.code==="Space"){
      e.preventDefault();
      setPreview(selected);
    }
  };

  window.addEventListener("keydown",handler);
  return ()=>window.removeEventListener("keydown",handler);
},[selected]);


  return (
    <>
      {/* ===== Folder Window ===== */}
      <MacWindow
        windowName={windowName}
        setWindowState={setWindowState}
        width="720px"
        height="520px"
      >
        <div className="cert-folder">

          {certificates.map((cert) => (
  <div
    key={cert.id}
    className={`cert-file ${selected?.id===cert.id?"active":""}`}
    onClick={()=>setSelected(cert)}
    onDoubleClick={()=>setPreview(cert)}
  >
    <img src="/doc_icons/pdf.svg" alt="pdf"/>

    <p className="cert-name">{cert.name}</p>
    <span className="cert-meta">{cert.issuer} • {cert.date}</span>

    {/* ⭐ Tooltip HERE */}
    <div className="cert-tooltip">
      <strong>{cert.name}</strong>
      <p>{cert.issuer}</p>
      <small>{cert.date}</small>
    </div>

  </div>
))}


        </div>
      </MacWindow>

      {/* ===== Preview Window ===== */}
      {preview && (
        <MacWindow
          windowName="preview"
          setWindowState={() => setPreview(null)}
          width="820px"
          height="600px"
        >
          <div className="cert-preview">

            {/* Top Info Bar */}
            <div className="preview-info">
              <div>
                <strong>{preview.name}</strong>
                <p>{preview.issuer} — {preview.date}</p>
              </div>

              <a
                href={preview.file}
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn"
              >
                Open in new tab
              </a>
            </div>

            {/* PDF Viewer */}
            <embed
              src={preview.file}
              type="application/pdf"
              className="cert-frame"
            />

          </div>
        </MacWindow>
      )}
    </>
  );
};

export default Certificates;

import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import "./window.scss";

const MacWindow = ({ children, width="80vh", height="60vh", windowName, setWindowState }) => {

  const [maximized,setMaximized] = useState(false);

  useEffect(()=>{
  if(maximized)
    document.documentElement.classList.add("fullscreen-mode");
  else
    document.documentElement.classList.remove("fullscreen-mode");

  return ()=>{
    document.documentElement.classList.remove("fullscreen-mode");
  };
},[maximized]);


  return (
    <Rnd
      size={maximized ? {width:"100vw",height:"100vh"} : {width,height}}
      position={maximized ? {x:0,y:0} : {x:250,y:100}}
      disableDragging={maximized}
      enableResizing={!maximized}
    >
      <div className="Window">
        <div className="nav">
          <div className="dots">

            <div
              className="dot red"
              onClick={()=>{
  document.documentElement.classList.remove("fullscreen-mode");
  setMaximized(false);

  setWindowState(state=>({
    active:null,
    apps:{...state.apps,[windowName]:"closed"}
  }));
}}

            />

            <div
              className="dot yellow"
              onClick={()=>{
  document.documentElement.classList.remove("fullscreen-mode");
  setMaximized(false);

  setWindowState(state=>({
    ...state,
    active:null,
    apps:{...state.apps,[windowName]:"minimized"}
  }));
}}

            />

            <div className="dot green" onClick={()=>setMaximized(prev=>!prev)} />

          </div>
          <div className="title"><p>tusharrajput -zsh</p></div>
        </div>

        <div className="main-content">{children}</div>
      </div>
    </Rnd>
  );
};

export default MacWindow;

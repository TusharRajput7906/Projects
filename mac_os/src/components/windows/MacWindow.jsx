import React from 'react'
import {Rnd} from 'react-rnd'
import './window.scss'
const MacWindow = ({children,width="80vh",height="60vh",windowName,setWindowState}) => {
  return (
    <Rnd default={{
        width:width,
        height:height,
        x:250,
        y:100
    }}>
        <div className="Window">
            <div className="nav">
                <div className="dots">
                <div onClick={()=>setWindowState(state=>({...state,[windowName]:false}))} className="dot red">x</div>
                <div className="dot yellow">-</div>
                <div className="dot green"></div>

            </div>
                <div className="title"><p>tusharrajput -zsh</p></div>
            </div>
            <div className="main-content">
                {children}
            </div>
        </div>
    </Rnd>
  )
}

export default MacWindow

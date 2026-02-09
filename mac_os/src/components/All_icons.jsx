import React from 'react'
import './All_icons.scss'
import { github, nord } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import Spotify from './windows/Spotify'
import Resume from './windows/Resume'
const All_icons = ({windowState,setWindowState}) => {
  const openOnly = (key) => {
    setWindowState({
      github: false,
      note: false,
      resume: false,
      spotify: false,
      cli: false,
      [key]: true,
    })
  }

  return (
   <footer className='all_icons'>
    <img onClick={()=>openOnly('github')} className='icon github'  src="/doc_icons/github.svg" alt="pdf icon" />
    <img onClick={()=>openOnly('note')} className='icon note' src="/doc_icons/note.svg" alt="pdf icon" />
    <img onClick={()=>openOnly('resume')} className='icon pdf' src="/doc_icons/pdf.svg" alt="pdf icon" />
    <img onClick={()=>{window.open("https://calendar.google.com","_blank")}} className='icon calender' src="/doc_icons/calender.svg" alt="pdf icon" />
    <img onClick={()=>openOnly('spotify')} className='icon spotify' src="/doc_icons/spotify.svg" alt="pdf icon" />
    <img onClick={()=>{window.open("mailto:tushar@example.com","_blank")}} className='icon mail' src="/doc_icons/mail.svg" alt="pdf icon" />
    <img onClick={()=>{window.open("https://www.linkedin.com/in/tushar-rajput-88a837279/","_blank")}} className='icon link' src="/doc_icons/link.svg" alt="pdf icon" />
    <img onClick={()=>openOnly('cli')} className='icon cli' src="/doc_icons/cli.svg" alt="pdf icon" />
   </footer>
  )
}

export default All_icons

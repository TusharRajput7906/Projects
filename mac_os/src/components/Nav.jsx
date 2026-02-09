import React from 'react'
import './Nav.scss'
import DateAndTime from './DateAndTime'

const Nav = () => {
  return (
    <nav className='navbar'>
        <div className="left">
            <div className='apple-icon'>
                <img className='apple' src="/navbar_icons/apple.svg" alt="" />
            </div>
            <div className="name">
                <p>Tushar Rajput</p>
            </div>
            <div className="file">
                <p>File</p>
            </div>
            <div className="window">
                <p>Window</p>
            </div>
            <div className="terminal">
                <p>Terminal</p>
            </div>
        </div>
        <div className="right">
            <DateAndTime />
        </div>
    </nav>
  )
}

export default Nav

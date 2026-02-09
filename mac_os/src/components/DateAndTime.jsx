import React, { useState, useEffect } from 'react'
import './DateAndTime.scss'

const DateAndTime = () => {
  const [dateTime, setDateTime] = useState('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      
      const dayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
      const monthName = now.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()
      const date = now.getDate()
      const hours = now.getHours()
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? 'pm' : 'am'
      const displayHours = hours % 12 || 12
      
      const formatted = `${dayName} ${monthName} ${date} ,${displayHours}:${minutes} ${ampm}`
      setDateTime(formatted)
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className='wifi-icon'>
        <img className='wifi' src="/navbar_icons/wifi.svg" alt="" />
      </div>
      <div>{dateTime}</div>
    </>
  )
}

export default DateAndTime

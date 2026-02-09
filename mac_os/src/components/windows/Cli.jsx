import React from 'react'
import MacWindow from './MacWindow'
import Terminal from 'react-console-emulator'
import './cli.scss'
const Cli = ({windowName,setWindowState}) => {
  const commands = {
    about: {
      description: 'Learn about me',
      fn: () => `Hi! I'm Tushar Rajput, a passionate Full Stack Developer with expertise in React, JavaScript, and modern web technologies. I love building interactive and user-friendly applications.`
    },
    portfolio: {
      description: 'View my portfolio info',
      fn: () => `Portfolio: https://tusharrajput.dev\nGithub: https://github.com/tusharrajput\nLinkedIn: https://linkedin.com/in/tusharrajput`
    },
    skills: {
      description: 'List my technical skills',
      fn: () => `Frontend: React, JavaScript, HTML, CSS, SCSS\nBackend: Node.js, Express\nTools: Git, Webpack, Vite\nDatabases: MongoDB, SQL`
    },
    contact: {
      description: 'Get contact information',
      fn: () => `Email: tushar@example.com\nPhone: +91-XXXXXXXXXX\nLocation: India`
    },
    projects: {
      description: 'View my projects',
      fn: () => `1. E-Commerce Platform - React, Node.js, MongoDB\n2. Task Management App - React, Context API\n3. Portfolio Website - React, SCSS\n4. Image Editor - Vanilla JS, Canvas API\n5. CLI Dashboard - React, Node.js`
    },
    experience: {
      description: 'View my work experience',
      fn: () => `Frontend Developer at TechCorp (2023-Present)\n- Built responsive web applications using React\n- Collaborated with design teams\n\nJunior Developer at WebStudio (2022-2023)\n- Developed full-stack features\n- Fixed bugs and optimized performance`
    },
    github: {
      description: 'Open my GitHub profile',
      fn: () => `GitHub Profile: https://github.com/tusharrajput\nTotal Repositories: 25+\nContributions: Active open-source contributor`
    },
    email: {
      description: 'Get my email address',
      fn: () => `Email: tushar@example.com`
    },
    education: {
      description: 'View my education',
      fn: () => `B.Tech in Computer Science - XYZ University (2020-2024)\nCertifications: React Advanced Patterns, Full Stack Web Development`
    }
  }

  const welcomeMessage = `
╔═══════════════════════════════════════════════════════════╗
║         Welcome to Tushar Rajput's Portfolio CLI           ║
╚═══════════════════════════════════════════════════════════╝

Available Commands:
  about        - Learn more about me
  portfolio    - View my portfolio links
  skills       - Check my technical skills
  contact      - Get contact information
  projects     - View my projects
  experience   - Learn about my work experience
  github       - Visit my GitHub profile
  email        - Get my email address
  education    - View my educational background
  clear        - Clear the terminal

Type any command to get started! 🚀
`

  return (
  <MacWindow windowName={windowName} setWindowState={setWindowState} width='88vh' height='65vh'>
    <div className="cli-window">
        <Terminal
        commands={commands}
        welcomeMessage={welcomeMessage}
        promptLabel={'tusharrajput:~$'}
        promptLabelStyle={{color:"#00FF00"}}
        nputAreaStyle={{color:"black"}}
      />
    </div>
  </MacWindow>
  )
}

export default Cli

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import {SafeArea, SystemBarsStyle} from "@capacitor-community/safe-area"
SafeArea.setSystemBarsStyle({ style: SystemBarsStyle.Dark})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

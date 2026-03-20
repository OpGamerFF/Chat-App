import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Make sure to put your actual Google Client ID here or in an environment variable!
const GOOGLE_CLIENT_ID = '90022419736-2plp0sc032g2n6sttdshmd6of4e772n4.apps.googleusercontent.com'; // Dummy testing ID, please replace

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)

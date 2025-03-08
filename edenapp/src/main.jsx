import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeApp, testDatabaseConnection } from './lib/appInit'

// Initialize the application
initializeApp().then(() => {
  // Test database connection
  testDatabaseConnection().then((result) => {
    if (!result.success) {
      console.warn('Database connection test failed:', result.message);
    }
  });
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

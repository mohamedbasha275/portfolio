import { useState } from 'react'

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Mohammed Basha
        </h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
          Flutter Developer
        </p>
        <p style={{ marginTop: '2rem', opacity: 0.8 }}>
          Portfolio coming soon...
        </p>
      </div>
    </div>
  )
}

export default App
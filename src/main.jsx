import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));

// Conditional Strict Mode for development
const renderApp = () => (
  process.env.NODE_ENV === 'production' ? <App /> : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);

root.render(renderApp());
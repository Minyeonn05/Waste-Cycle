// client/src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Import APIProvider
import { APIProvider } from '@vis.gl/react-google-maps';

// 2. 🚨🚨🚨 ใส่ Google Maps API Key ของคุณ 🚨🚨🚨
// (ควรเก็บใน .env.local แล้วใช้ import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
const GOOGLE_MAPS_API_KEY = "AIzaSyAPfTBWHeEn1Oi-DEkW2afcidFLaznmTvU"; 

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. หุ้ม App ด้วย APIProvider */}
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <App />
    </APIProvider>
  </React.StrictMode>
);
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="rounded-xl bg-white p-10 shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600">
          Bike Rental System
        </h1>

        <p className="mt-3 text-gray-600">
          React + TypeScript + Tailwind CSS v4
        </p>

        <button className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;

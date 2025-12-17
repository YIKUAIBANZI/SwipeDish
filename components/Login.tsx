import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white text-gray-900 p-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-black mb-2 tracking-tighter text-black">SwipeDish</h1>
          <p className="text-gray-500 text-lg tracking-wide uppercase font-medium">Find Food Fast</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 text-lg rounded-full bg-gray-100 border-2 border-transparent focus:border-black focus:bg-white focus:outline-none transition-all text-center placeholder-gray-400 font-bold"
              placeholder="Your Name"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-black text-white py-4 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-xl active:scale-95"
          >
            LET'S EAT
          </button>
        </form>
      </div>
    </div>
  );
};

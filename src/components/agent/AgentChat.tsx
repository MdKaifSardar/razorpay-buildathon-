'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface AgentChatProps {
  onRunTask: (prompt: string) => void;
  isLoading: boolean;
}

export function AgentChat({ onRunTask, isLoading }: AgentChatProps) {
  const [prompt, setPrompt] = useState('Find me good wireless headphones under ₹8,000 and buy them.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onRunTask(prompt);
    }
  };

  const presetPrompts = [
    'Find wireless headphones under ₹8,000',
    'Buy Keychron keyboard under ₹7,000',
    'Find smartwatch below ₹5,000',
    'Buy Apple Watch SE under ₹10,000', // Demo policy rejection (> limit)
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping"></div>
          <h3 className="font-semibold text-white text-base">AI Commerce Assistant</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Groq GPT-OSS 120B</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Tell your AI buyer what to find and purchase..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute right-2 top-1.5 bottom-1.5"
            size="sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Searching...
              </span>
            ) : (
              'Instruct Agent →'
            )}
          </Button>
        </div>

        {/* Preset Prompt Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs text-slate-500 self-center mr-1">Examples:</span>
          {presetPrompts.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setPrompt(preset);
                onRunTask(preset);
              }}
              disabled={isLoading}
              className="text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-all hover:border-slate-600"
            >
              "{preset}"
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

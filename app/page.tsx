"use client";

import { useState, useEffect, useRef } from 'react';
import { Upload, Timer, RefreshCw, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [code, setCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [cursorPosition, setCursorPosition] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCode(text);
        setUserInput('');
        setTime(0);
        setWpm(0);
        setAccuracy(100);
        setIsRunning(false);
        setCursorPosition(0);
      };
      reader.readAsText(file);
    }
  };

  const startTest = () => {
    if (!isRunning && code) {
      setIsRunning(true);
      setUserInput('');
      setTime(0);
      setWpm(0);
      setAccuracy(100);
      setCursorPosition(0);
      textareaRef.current?.focus();
    }
  };

  const resetTest = () => {
    setUserInput('');
    setTime(0);
    setWpm(0);
    setAccuracy(100);
    setIsRunning(false);
    setCursorPosition(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (userInput) {
      // Calculate WPM
      const words = userInput.length / 5;
      const minutes = time / 60;
      const calculatedWpm = Math.round(words / minutes);
      setWpm(calculatedWpm || 0);

      // Calculate accuracy
      let correct = 0;
      const minLength = Math.min(userInput.length, code.length);
      for (let i = 0; i < minLength; i++) {
        if (userInput[i] === code[i]) correct++;
      }
      const calculatedAccuracy = Math.round((correct / minLength) * 100);
      setAccuracy(calculatedAccuracy || 100);

      // Check if test is complete
      if (userInput === code) {
        setIsRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  }, [userInput, code, time]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isRunning) {
      setUserInput(e.target.value);
      setCursorPosition(e.target.selectionStart || 0);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart || 0);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart || 0);
  };

  const renderCode = () => {
    return code.split('').map((char, index) => {
      const userChar = userInput[index];
      let className = 'opacity-50'; // Default style for untyped characters

      if (userChar !== undefined) {
        className = userChar === char ? 'text-green-400' : 'text-red-400';
      }

      // Add cursor
      if (index === cursorPosition && isRunning) {
        return (
          <span key={index} className="relative">
            <span className={className}>{char}</span>
            <span className="absolute top-0 left-0 w-0.5 h-full bg-white animate-pulse"></span>
          </span>
        );
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Coding Speed Test
        </h1>

        <div className="mb-8 flex justify-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
            <Upload className="w-5 h-5" />
            Upload Code
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".txt,.js,.py,.java,.cpp,.html,.css"
              className="hidden"
            />
          </label>

          <button
            onClick={startTest}
            disabled={!code || isRunning}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              !code || isRunning
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20',
            )}
          >
            <Play className="w-5 h-5" />
            Start Test
          </button>

          <button
            onClick={resetTest}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Reset
          </button>
        </div>
        <div className=" sticky top-0 left-0 grid grid-cols-3 gap-8 m-10">
          <div className="bg-white/5 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold mb-2">{time}s</div>
            <div className="text-gray-400">Time</div>
          </div>
          <div className="bg-white/5 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold mb-2">{wpm}</div>
            <div className="text-gray-400">WPM</div>
          </div>
          <div className="bg-white/5 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold mb-2">{accuracy}%</div>
            <div className="text-gray-400">Accuracy</div>
          </div>
        </div>
        <div className="relative bg-white/5 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Code Editor</h2>
          <div className="relative font-mono">
            <pre className="whitespace-pre-wrap break-all p-4 bg-white/5 rounded border border-white/10 min-h-[200px]">
              {code ? renderCode() : 'Upload a file to start the test'}
            </pre>
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={handleInputChange}
              onKeyUp={handleKeyUp}
              onClick={handleClick}
              disabled={!isRunning}
              className="absolute inset-0 w-full h-full opacity-0 p-4 font-mono resize-none focus:outline-none"
              placeholder={
                isRunning ? 'Start typing...' : 'Click Start Test to begin'
              }
              style={{ caretColor: 'transparent' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onTranscript, currentLanguage = 'Telugu' }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setIsSupported(false); return; }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    const langMap = {
      'Telugu': 'te-IN', 'Hindi': 'hi-IN', 'Tamil': 'ta-IN',
      'Kannada': 'kn-IN', 'English': 'en-IN', 'Auto Detect': 'te-IN'
    };
    rec.lang = langMap[currentLanguage] || 'en-IN';

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) t += e.results[i][0].transcript;
      }
      if (t) onTranscript(t);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    setRecognition(rec);
  }, [currentLanguage]);

  const toggle = () => {
    if (!isSupported || !recognition) return;
    if (isListening) { recognition.stop(); } else { try { recognition.start(); } catch(e){} }
  };

  if (!isSupported) return (
    <span className="mono-meta text-muted text-[10px]">Voice not supported</span>
  );

  return (
    <button
      type="button"
      onClick={toggle}
      data-hover
      className={`inline-flex items-center space-x-2 px-4 py-2 border border-primary/10 hover-smooth text-xs font-medium ${
        isListening
          ? 'bg-primary text-white'
          : 'bg-surface text-primary hover:bg-primary hover:text-white'
      }`}
    >
      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
      <span className="mono-meta">{isListening ? 'Listening…' : 'Voice'}</span>
    </button>
  );
}

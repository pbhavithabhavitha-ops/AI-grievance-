import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Track from './pages/Track';
import Admin from './pages/Admin';

function CustomCursor() {
  const cursorRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const lerped = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMove = (e) => {
      pos.current.x = e.clientX - 8;
      pos.current.y = e.clientY - 8;
    };

    const loop = () => {
      lerped.current.x += (pos.current.x - lerped.current.x) * 0.15;
      lerped.current.y += (pos.current.y - lerped.current.y) * 0.15;
      cursor.style.left = `${lerped.current.x}px`;
      cursor.style.top = `${lerped.current.y}px`;
      requestAnimationFrame(loop);
    };

    const addHover = () => cursor.classList.add('hovering');
    const removeHover = () => cursor.classList.remove('hovering');

    window.addEventListener('mousemove', onMove);
    requestAnimationFrame(loop);

    const attach = () => {
      document.querySelectorAll('a, button, select, input, textarea, [data-hover]').forEach((el) => {
        el.addEventListener('mouseenter', addHover);
        el.addEventListener('mouseleave', removeHover);
      });
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      observer.disconnect();
    };
  }, []);

  return <div ref={cursorRef} id="custom-cursor" />;
}

export default function App() {
  return (
    <Router>
      <CustomCursor />
      <div className="min-h-screen flex flex-col bg-surface text-primary font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track" element={<Track />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 py-5 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-primary text-2xl font-bold tracking-tighter lowercase hover-smooth flex items-baseline space-x-1.5" data-hover>
          <span>janseva</span>
          <span className="mono-meta text-[9px] text-muted border border-primary/20 px-1.5 py-0.5 leading-none">v1</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {[
            { path: '/', label: 'submit' },
            { path: '/track', label: 'track' },
            { path: '/admin', label: 'dashboard' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              data-hover
              className={`mono-meta text-xs tracking-widest hover-smooth ${
                isActive(item.path) 
                  ? 'text-primary font-bold border-b-2 border-primary pb-0.5' 
                  : 'text-muted hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-primary" data-hover>
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-footer text-white mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-4xl md:text-5xl font-bold tracking-display lowercase">janseva ai</h3>
            <p className="body-text text-sm text-white/60 max-w-sm leading-relaxed">
              An AI-powered multilingual public grievance resolution engine — built for Indian civic governance. Bridging languages, eliminating routing delays, empowering every citizen voice.
            </p>
          </div>

          {/* Socials */}
          <div className="space-y-4">
            <h4 className="mono-meta text-white/40 mb-4">Socials</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {['Twitter / X', 'LinkedIn', 'GitHub', 'Medium'].map((s) => (
                <li key={s}>
                  <a href="#" data-hover className="hover:text-white hover-smooth">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="mono-meta text-white/40 mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" data-hover className="hover:text-white hover-smooth">janaseva@gov.in</a></li>
              <li><a href="#" data-hover className="hover:text-white hover-smooth">+91 40 2345 6789</a></li>
              <li className="text-white/40">Hyderabad, Telangana</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t-footer mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/30">
          <span>© 2026 JanSeva AI. All rights reserved.</span>
          <span>Prototype v1.0</span>
        </div>
      </div>
    </footer>
  );
}

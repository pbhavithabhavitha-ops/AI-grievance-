import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';
import SampleGrievances from '../components/SampleGrievances';
import AIAnalysisModal from '../components/AIAnalysisModal';
import TicketCard from '../components/TicketCard';
import HowItWorks from '../components/HowItWorks';
import WhyJanSeva from '../components/WhyJanSeva';
import { analyzeGrievance, submitGrievance } from '../services/api';

const STATE_DISTRICTS = {
  'Andhra Pradesh': [
    'Visakhapatnam', 'NTR Vijayawada', 'Tirupati', 'Guntur', 'Kakinada', 
    'East Godavari (Rajamahendravaram)', 'Eluru', 'West Godavari (Bhimavaram)', 
    'Krishna (Machilipatnam)', 'Prakasam (Ongole)', 'SPSR Nellore', 'Kurnool', 
    'Nandyal', 'Anantapur', 'Sri Sathya Sai (Puttaparthi)', 'Chittoor', 
    'Annamayya (Rayachoti)', 'YSR Kadapa', 'Srikakulam', 'Vizianagaram', 
    'Parvathipuram Manyam', 'Alluri Sitharama Raju', 'Palnadu (Narasaraopet)', 
    'Bapatla', 'Dr. B.R. Ambedkar Konaseema', 'Anakapalli'
  ],
  'Telangana': [
    'Hyderabad', 'Medchal-Malkajgiri', 'Rangareddy', 'Warangal', 'Hanamkonda', 
    'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Mahabubnagar', 
    'Sangareddy', 'Siddipet', 'Suryapet', 'Mancherial', 'Peddapalli', 
    'Adilabad', 'Jagtial', 'Kamareddy', 'Bhadradri Kothagudem', 'Mahabubabad', 
    'Jayashankar Bhupalpally', 'Mulugu', 'Nagarkurnool', 'Wanaparthy', 
    'Jogulamba Gadwal', 'Vikarabad', 'Medak', 'Jangaon', 'Yadadri Bhuvanagiri', 
    'Rajanna Sircilla', 'Nirmal', 'Kumuram Bheem Asifabad', 'Narayanpet'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 
    'Tirunelveli', 'Erode', 'Vellore', 'Kanchipuram', 'Thanjavur'
  ],
  'Karnataka': [
    'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Dakshina Kannada (Mangaluru)', 
    'Dharwad (Hubballi)', 'Belagavi', 'Kalaburagi', 'Davanagere'
  ],
  'Maharashtra': [
    'Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 
    'Chhatrapati Sambhajinagar', 'Nashik', 'Solapur'
  ]
};

export default function Home() {
  const [grievanceText, setGrievanceText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Telugu');
  const [selectedCategory, setSelectedCategory] = useState('Auto Detect');
  
  // Geographic Location State
  const [state, setState] = useState('Telangana');
  const [district, setDistrict] = useState('Hyderabad');
  const [city, setCity] = useState('Hyderabad');
  const [area, setArea] = useState('Kukatpally Zone');
  const [landmark, setLandmark] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto update district selection when state changes
  useEffect(() => {
    if (STATE_DISTRICTS[state]) {
      const defaultDist = STATE_DISTRICTS[state][0];
      setDistrict(defaultDist);
      setCity(defaultDist.split(' ')[0]);
    }
  }, [state]);

  const handleSampleSelect = (text, language) => {
    setGrievanceText(text);
    setSelectedLanguage(language);
    if (language === 'Telugu') {
      setState('Telangana');
      setDistrict('Hyderabad');
      setCity('Hyderabad');
    } else if (language === 'Hindi') {
      setState('Telangana');
      setDistrict('Hyderabad');
      setCity('Hyderabad');
    } else if (language === 'Tamil') {
      setState('Tamil Nadu');
      setDistrict('Chennai');
      setCity('Chennai');
    } else if (language === 'Kannada') {
      setState('Karnataka');
      setDistrict('Bengaluru Urban');
      setCity('Bengaluru');
    }
    setErrorMessage('');
  };

  const handleVoiceTranscript = (text) => {
    setGrievanceText((prev) => (prev ? `${prev} ${text}` : text));
    setErrorMessage('');
  };

  const handleAnalyzeClick = async (e) => {
    e.preventDefault();
    if (!grievanceText.trim()) {
      setErrorMessage('Please enter a grievance description.');
      return;
    }
    setErrorMessage('');
    setTicketResult(null);
    setIsModalOpen(true);
    setIsAnalyzing(true);
    try {
      const data = await analyzeGrievance(grievanceText, selectedLanguage, selectedCategory);
      setAnalysisResult(data);
    } catch (err) {
      setErrorMessage('Failed to connect to backend. Ensure the server is running on port 8000.');
      setIsModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!analysisResult) return;
    setIsSubmitting(true);
    try {
      const ticket = await submitGrievance({
        original_text: grievanceText,
        language: analysisResult.language,
        translation: analysisResult.translation,
        category: analysisResult.category,
        priority: analysisResult.priority,
        department: analysisResult.department,
        summary: analysisResult.summary,
        suggested_action: analysisResult.suggested_action,
        state: state || 'Telangana',
        city: city || district || 'Hyderabad',
        area: area ? `${district} - ${area}` : `${district} Zone`,
        ward: `${district} Ward`,
        landmark: landmark || ''
      });
      setTicketResult(ticket);
      setIsModalOpen(false);
      setGrievanceText('');
    } catch (err) {
      alert('Error saving grievance ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>

      {/* ── HERO SECTION ── */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 pt-12 pb-16 text-center">
        <span className="mono-meta text-muted mb-6 reveal-wrap">
          <span className="reveal-inner">AI-Powered Multilingual Civic Governance</span>
        </span>

        <h1 className="display-heading text-[12vw] md:text-[10vw] lg:text-[8vw] leading-none">
          {'JanSeva'.split('').map((ch, i) => (
            <span key={i} className="reveal-wrap inline-block">
              <span className={`reveal-inner d${i + 1}`}>{ch}</span>
            </span>
          ))}
        </h1>

        <p className="body-text text-secondary text-base md:text-lg max-w-md mt-8">
          Submit public grievances in Telugu, Hindi, Tamil, Kannada, Marathi, or English. Our AI auto-classifies urgency and routes to regional municipal departments across India.
        </p>
      </section>

      {/* ── INFINITE MARQUEE ── */}
      <section className="border-t-editorial border-b-editorial overflow-hidden py-8">
        <div className="marquee-track">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex space-x-6 px-3">
              {[
                { text: 'Electricity', cls: 'marquee-card-a' },
                { text: 'Water Supply', cls: 'marquee-card-b' },
                { text: 'Roads', cls: 'marquee-card-c' },
                { text: 'Sanitation', cls: 'marquee-card-a' },
                { text: 'Transport', cls: 'marquee-card-b' },
                { text: 'Public Safety', cls: 'marquee-card-c' },
                { text: 'Electricity', cls: 'marquee-card-b' },
                { text: 'Water Supply', cls: 'marquee-card-a' },
              ].map((item, i) => (
                <div key={i} className={`flex-shrink-0 w-48 h-64 bg-primary/5 ${item.cls} overflow-hidden flex items-end p-4`}
                  style={{ aspectRatio: '5/7' }}>
                  <span className="mono-meta text-primary/40 text-[10px]">{item.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── TICKET SUCCESS ── */}
      {ticketResult && <TicketCard ticketData={ticketResult} />}

      {/* ── SUBMIT GRIEVANCE FORM ── */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 py-24">

        <div className="mb-12">
          <span className="mono-meta text-muted block mb-3">Submit</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-display">
            Public Grievance
          </h2>
        </div>

        <SampleGrievances onSelectSample={handleSampleSelect} />

        <form onSubmit={handleAnalyzeClick} className="space-y-8">

          {/* Text Input + Voice */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="mono-meta text-muted text-[10px]">Describe Grievance *</label>
              <VoiceInput onTranscript={handleVoiceTranscript} currentLanguage={selectedLanguage} />
            </div>
            <textarea
              rows={5}
              value={grievanceText}
              onChange={(e) => setGrievanceText(e.target.value)}
              placeholder="మా ప్రాంతంలో గత మూడు రోజులుగా వీధి దీపాలు పనిచేయడం లేదు..."
              className="w-full p-5 border border-primary/10 focus:border-primary text-sm body-text placeholder:text-primary/20 outline-none hover-smooth bg-transparent"
            />
          </div>

          {/* Language + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="mono-meta text-muted text-[10px]">Language</label>
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-3 border border-primary/10 focus:border-primary text-xs font-medium bg-transparent outline-none hover-smooth">
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="English">English</option>
                <option value="Auto Detect">Auto Detect</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="mono-meta text-muted text-[10px]">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-primary/10 focus:border-primary text-xs font-medium bg-transparent outline-none hover-smooth">
                <option value="Auto Detect">Auto Detect</option>
                <option value="Roads">Roads</option>
                <option value="Water">Water</option>
                <option value="Electricity">Electricity</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Transport">Transport</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Location: State, District (Fixed List), City/Town/Mandal (Editable), Area, Landmark */}
          <div className="border-t-editorial pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="mono-meta text-muted text-[10px]">Geographic Location</span>
              <span className="mono-meta text-[9px] text-muted">Official Municipal Administrative Routing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* State Selector */}
              <div>
                <label className="mono-meta text-muted text-[10px] block mb-1">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 border border-primary/10 focus:border-primary text-xs font-bold bg-transparent outline-none hover-smooth"
                >
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
              </div>

              {/* Fixed District Selector */}
              <div>
                <label className="mono-meta text-muted text-[10px] block mb-1">District *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-3 border border-primary/10 focus:border-primary text-xs font-bold bg-transparent outline-none hover-smooth"
                >
                  {(STATE_DISTRICTS[state] || ['Hyderabad']).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Editable City / Town / Mandal */}
              <div>
                <label className="mono-meta text-muted text-[10px] block mb-1">City / Town / Mandal *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kukatpally / Madhapur / Gajuwaka"
                  className="w-full p-3 border border-primary/10 focus:border-primary text-xs font-bold bg-transparent outline-none hover-smooth"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mono-meta text-muted text-[10px] block mb-1">Area / Colony / Street</label>
                <input 
                  type="text" 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Phase 3 / Beach Road / Main Road"
                  className="w-full p-3 border border-primary/10 focus:border-primary text-xs bg-transparent outline-none hover-smooth" 
                />
              </div>
              <div>
                <label className="mono-meta text-muted text-[10px] block mb-1">Landmark (Optional)</label>
                <input 
                  type="text" 
                  value={landmark} 
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Bus Stop / Opp Metro Station"
                  className="w-full p-3 border border-primary/10 focus:border-primary text-xs bg-transparent outline-none hover-smooth" 
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <p className="mono-meta text-xs text-primary bg-primary/5 p-3 border border-primary/10">{errorMessage}</p>
          )}

          {/* Submit */}
          <button type="submit" data-hover
            className="w-full py-5 bg-primary text-white font-bold text-sm tracking-display hover-smooth hover:bg-primary/80 flex items-center justify-center space-x-2">
            <span>Analyze & Route with AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>
      </section>

      {/* AI Modal */}
      <AIAnalysisModal
        isOpen={isModalOpen} 
        isLoading={isAnalyzing} 
        analysisData={analysisResult}
        onClose={() => setIsModalOpen(false)} 
        onConfirmSubmit={handleConfirmSubmit} 
        isSubmitting={isSubmitting}
      />

      {/* Presentation Sections */}
      <HowItWorks />
      <WhyJanSeva />
    </div>
  );
}

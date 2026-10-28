import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Star,
  Clock,
  Compass,
  Building,
  Scale,
  Phone,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { approvedServices } from '../../config/services';

export const HERO_SLIDES = [
  {
    id: 1,
    title: "Independent Property Surveys & Valuations Across London & The Home Counties",
    eyebrow: "RICS Home Survey Standard Aligned • Independent Practice",
    subtitle: "Make confident property purchasing decisions with clear, jargon-free technical reports. Inspecting residential properties throughout London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85",
    altText: "Prestigious British residential property architecture",
    tagline: "Conventional & Modern Homes",
    accent: "Level 2 & Level 3 Surveys"
  },
  {
    id: 2,
    title: "Comprehensive Level 3 Building Surveys for Period & Listed Homes",
    eyebrow: "Structural Defect Diagnostics • Historic Fabric Specialists",
    subtitle: "Exhaustive structural investigations, historic lime mortar diagnostics, timber decay mapping, and prioritized remediation schedules for period Victorian, Edwardian, and listed properties.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=85",
    altText: "Period English heritage residence in the Home Counties",
    tagline: "Historic & Complex Structures",
    accent: "Full Structural Investigation"
  },
  {
    id: 3,
    title: "Fast-Track Level 2 Homebuyer Surveys & Red Book Valuations",
    eyebrow: "Traffic-Light Defect Ratings • RICS Registered Valuers",
    subtitle: "Color-coded Condition 1-2-3 defect ratings designed to help you understand urgent repairs and renegotiate asking prices before legal exchange.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=85",
    altText: "Contemporary high-specification residential architecture",
    tagline: "Modern Homes & Mortgages",
    accent: "Developer Defect Audits"
  }
];

export function HeroSlider({ onQuickQuoteSelect, initialService = 'homebuyer-survey-level-2' }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quickService, setQuickService] = useState(initialService);
  const [quickPostcode, setQuickPostcode] = useState('');
  const timerRef = useRef(null);

  const totalSlides = HERO_SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const activeSlideData = HERO_SLIDES[currentSlide];

  const handleQuickQuoteSubmit = (e) => {
    e.preventDefault();
    if (onQuickQuoteSelect) {
      onQuickQuoteSelect({
        serviceId: quickService,
        postcode: quickPostcode.trim()
      });
    }
    const quoteElement = document.getElementById('quote-section') || document.getElementById('quote');
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="hero-slider-section relative overflow-hidden"
      aria-label="Surveying Practice Hero Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Architectural Slides */}
      {HERO_SLIDES.map((slide, index) => {
        const isCurrent = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`hero-slide-bg ${isCurrent ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.image})`,
              transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 8s ease'
            }}
            role="img"
            aria-label={slide.altText}
            aria-hidden={!isCurrent}
          >
            {/* Controlled Deep Architectural Gradient Overlay */}
            <div className="hero-slide-overlay" />
          </div>
        );
      })}

      {/* Main Content inside Container */}
      <div className="container hero-container relative z-10">
        <div className="editorial-hero-content text-center">
          {/* Trustpilot Strip & Coverage Bar */}
          <div className="hero-trustpilot-strip hero-animate-badge mx-auto mb-3 inline-flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-xs text-white">
            <div className="flex text-emerald-400 font-bold tracking-widest text-[11px]">★★★★★</div>
            <span><strong>4.8 / 5</strong> on Trustpilot</span>
            <span className="text-slate-400 hidden sm:inline">&bull; 100% RICS-Aligned Practice</span>
          </div>

          <div className="hero-unified-pill hero-animate-badge mx-auto">
            <div className="pill-section pill-accreditation">
              <ShieldCheck size={14} className="text-white flex-shrink-0" aria-hidden="true" />
              <span>{activeSlideData.eyebrow}</span>
            </div>
            <span className="pill-separator" aria-hidden="true">&bull;</span>
            <div className="pill-section pill-location">
              <MapPin size={13} className="text-white flex-shrink-0" aria-hidden="true" />
              <span>London &bull; Surrey &bull; Oxfordshire &bull; Buckinghamshire &bull; Berkshire</span>
            </div>
          </div>

          {/* Slide Title with Entrance Transition */}
          <h1 key={`title-${currentSlide}`} className="editorial-hero-title hero-animate-title">
            {activeSlideData.title}
          </h1>

          {/* Slide Subtitle */}
          <p key={`subtitle-${currentSlide}`} className="editorial-hero-subtitle hero-animate-subtitle">
            {activeSlideData.subtitle}
          </p>

          {/* Quick-Quote Interactive Selector Bar */}
          <div className="hero-quick-quote-container hero-animate-cta">
            <form onSubmit={handleQuickQuoteSubmit} className="hero-quick-quote-bar">
              <div className="quick-quote-field quick-service-field">
                <label htmlFor="hero-service-select" className="quick-field-label">
                  <Building size={14} aria-hidden="true" />
                  <span>Required Survey Service</span>
                </label>
                <select
                  id="hero-service-select"
                  value={quickService}
                  onChange={(e) => setQuickService(e.target.value)}
                  className="quick-select-input"
                >
                  {approvedServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} — {service.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="quick-quote-field quick-postcode-field">
                <label htmlFor="hero-postcode-input" className="quick-field-label">
                  <MapPin size={14} aria-hidden="true" />
                  <span>Property Postcode</span>
                </label>
                <input
                  id="hero-postcode-input"
                  type="text"
                  placeholder="e.g. SW1A 1AA or GU1 4AA"
                  value={quickPostcode}
                  onChange={(e) => setQuickPostcode(e.target.value.toUpperCase())}
                  className="quick-text-input"
                />
              </div>

              <div className="quick-quote-action">
                <button type="submit" className="hero-primary-quote-btn">
                  <span>Request Fixed-Fee Quote</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </form>

            {/* Secondary Link to Browse Services */}
            <div className="hero-secondary-link-wrap">
              <a href="#services" className="hero-secondary-services-link">
                <span>Or explore all 5 RICS-aligned survey disciplines</span>
                <ChevronRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Trust and Assurance Indicators */}
          <div className="editorial-hero-trust-bar hero-animate-features">
            <div className="hero-trust-pill">
              <ShieldCheck size={16} className="text-white flex-shrink-0" aria-hidden="true" />
              <span>RICS Benchmark Aligned</span>
            </div>
            <div className="hero-trust-pill">
              <Scale size={16} className="text-white flex-shrink-0" aria-hidden="true" />
              <span>100% Zero Contractor Bias</span>
            </div>
            <div className="hero-trust-pill">
              <Clock size={16} className="text-white flex-shrink-0" aria-hidden="true" />
              <span>3 – 5 Business Day Turnaround</span>
            </div>
            <div className="hero-trust-pill">
              <Phone size={16} className="text-white flex-shrink-0" aria-hidden="true" />
              <span>Post-Survey Surveyor Phone Debrief</span>
            </div>
          </div>

          {/* Slider Controls & Pagination Indicators */}
          <div className="hero-slider-controls hero-animate-controls">
            {/* Prev / Next Buttons */}
            <div className="slider-nav-buttons">
              <button
                type="button"
                className="slider-arrow-btn"
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="slider-arrow-btn"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Progress Dots */}
            <div className="slider-dots" role="tablist" aria-label="Slide indicators">
              {HERO_SLIDES.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <button
                    key={slide.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`slider-dot ${isActive ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Slide ${index + 1}: ${slide.tagline}`}
                  >
                    <span className="slider-dot-inner" />
                  </button>
                );
              })}
            </div>

            {/* Slide Counter Label */}
            <span className="slider-counter">
              0{currentSlide + 1} / 0{totalSlides} &bull; {activeSlideData.tagline}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

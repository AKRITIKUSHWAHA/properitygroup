import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Clock,
  Compass,
  Building
} from 'lucide-react';
import { Button } from '../common/Button';

export const HERO_SLIDES = [
  {
    id: 1,
    title: "Independent Property Surveys & Valuations Across London & The Home Counties",
    eyebrow: "RICS Home Survey Standard Aligned • Independent Practice",
    subtitle: "Make confident property purchasing decisions with clear, jargon-free technical reports. Inspecting residential properties throughout London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
    altText: "Elegant UK residential property architecture",
    tagline: "Conventional & Modern Homes"
  },
  {
    id: 2,
    title: "Comprehensive Level 3 Building Surveys for Period & Listed Homes",
    eyebrow: "Structural Defect Diagnostics • Historic Fabric Specialists",
    subtitle: "Exhaustive structural investigations, historic lime mortar diagnostics, timber decay mapping, and prioritized remediation schedules for period Victorian, Edwardian, and listed properties.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1800&q=85",
    altText: "Period English heritage residence in the Home Counties",
    tagline: "Historic & Complex Structures"
  },
  {
    id: 3,
    title: "Precision New-Build Snagging & Impartial Red Book Valuations",
    eyebrow: "NHBC Warranty Compliance • RICS Registered Valuers",
    subtitle: "Forensic defect audits for developer warranty remediation alongside legally robust Help to Buy, shared ownership staircasing, probate, and matrimonial asset appraisals.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=85",
    altText: "Contemporary high-specification residential architecture",
    tagline: "New-Build Quality & Red Book Valuations"
  }
];

export function HeroSlider({ onQuoteClick, children }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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

  // Auto-advance slides every 7 seconds
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 7000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const activeSlideData = HERO_SLIDES[currentSlide];

  return (
    <div
      className="hero-slider-wrapper"
      role="region"
      aria-roledescription="carousel"
      aria-label="Surveying Highlights Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background Slides with Ken-Burns Subtle Zoom */}
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`hero-slide-bg ${isActive ? 'active' : ''}`}
            aria-hidden={!isActive}
            style={{
              backgroundImage: `url(${slide.image})`
            }}
          >
            {/* Controlled Deep Architectural Gradient Overlay */}
            <div className="hero-slide-overlay" />
          </div>
        );
      })}

      {/* Main Content Grid inside Container */}
      <div className="container hero-container relative z-10">
        <div className="hero-grid">
          {/* Left Column: Animated Text Content with Glassmorphic Panel */}
          <div className="hero-content-column">
            {/* Unified Professional Trust & Coverage Eyebrow Bar */}
            <div className="hero-unified-pill hero-animate-badge">
              <div className="pill-section pill-accreditation">
                <ShieldCheck size={14} className="text-gold flex-shrink-0" aria-hidden="true" />
                <span>{activeSlideData.eyebrow}</span>
              </div>
              <span className="pill-separator" aria-hidden="true">&bull;</span>
              <div className="pill-section pill-location">
                <MapPin size={13} className="text-gold flex-shrink-0" aria-hidden="true" />
                <span>London &bull; Surrey &bull; Oxfordshire &bull; Buckinghamshire &bull; Berkshire</span>
              </div>
            </div>

            {/* Slide Title with Key Entrance */}
            <h1 key={`title-${currentSlide}`} className="hero-title hero-animate-title">
              {activeSlideData.title}
            </h1>

            {/* Slide Subtitle */}
            <p key={`subtitle-${currentSlide}`} className="hero-subtitle hero-animate-subtitle">
              {activeSlideData.subtitle}
            </p>

            {/* High-Impact Action Buttons */}
            <div className="hero-cta-group hero-animate-cta">
              <Button
                href="#quote"
                onClick={onQuoteClick}
                variant="outline-white"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                className="hero-primary-cta"
              >
                Request a Fixed-Fee Survey Quote
              </Button>

              <Button
                href="#services"
                variant="outline-white"
                size="lg"
                className="hero-secondary-cta"
              >
                Explore Survey Services
              </Button>
            </div>

            {/* Trust and Assurance Indicators */}
            <div className="hero-features-list hero-animate-features">
              <div className="hero-feature-item">
                <CheckCircle2 size={16} className="text-gold" aria-hidden="true" />
                <span>5 Regulated Survey Disciplines</span>
              </div>
              <div className="hero-feature-item">
                <CheckCircle2 size={16} className="text-gold" aria-hidden="true" />
                <span>Clear Traffic-Light Defect Ratings</span>
              </div>
              <div className="hero-feature-item">
                <CheckCircle2 size={16} className="text-gold" aria-hidden="true" />
                <span>Direct Post-Survey Phone Debrief</span>
              </div>
              <div className="hero-feature-item">
                <CheckCircle2 size={16} className="text-gold" aria-hidden="true" />
                <span>3 – 5 Business Day Report Turnaround</span>
              </div>
            </div>

            {/* High-Impact Floating Trust Card */}
            <div className="hero-floating-stat-badge">
              <span className="stat-pulse-dot" aria-hidden="true" />
              <div className="stat-text-group">
                <span className="stat-highlight">1,200+ Verified RICS Surveys</span>
                <span className="stat-sub">London &amp; Home Counties &bull; 98.6% On-Time Delivery &bull; ★★★★★ 4.9/5</span>
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

          {/* Right Column: Floating Form Slot */}
          <div className="hero-form-column" id="quote">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  Sparkles
} from 'lucide-react';
import { Button } from '../common/Button';

export const HERO_SLIDES = [
  {
    id: 1,
    title: "The UK's Trusted Home Survey & Valuation Specialists",
    eyebrow: "RICS Regulated Practice • Nationwide Home Survey Standard",
    subtitle: "Protect your purchase with independent, jargon-free property surveys across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Fast 48-hour digital delivery with direct surveyor telephone debrief.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=85",
    altText: "Classic British residential street with Victorian brick architecture",
    tagline: "Conventional & Period Properties"
  },
  {
    id: 2,
    title: "Exhaustive Level 3 Structural Building Surveys for Period & Listed Homes",
    eyebrow: "Structural Defect Diagnostics • Historic Lime & Timber Specialists",
    subtitle: "In-depth forensic investigations of load-bearing walls, roof trusses, subfloor timbers, and historic movement for Victorian, Edwardian, Georgian, and listed properties.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=85",
    altText: "Period English heritage residence in the Home Counties",
    tagline: "Historic & Complex Structures"
  },
  {
    id: 3,
    title: "Fast-Track Level 2 Homebuyer Surveys & Red Book Valuations",
    eyebrow: "Traffic-Light Defect Ratings • RICS Registered Valuers",
    subtitle: "Color-coded Condition 1-2-3 defect ratings designed to help you understand urgent repairs and renegotiate asking prices before legal exchange.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85",
    altText: "Modern executive English suburban home in Surrey",
    tagline: "Modern Homes & Mortgages"
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

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 8000);
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
            {/* Trustpilot 4.8★ Pill Strip (e.surv Benchmark) */}
            <div className="hero-trustpilot-strip hero-animate-badge">
              <div className="tp-stars-group">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="tp-star-mini">
                    <Star size={11} className="fill-white text-white" />
                  </div>
                ))}
              </div>
              <span className="tp-rating-label">
                <strong>4.8 / 5</strong> &bull; Excellent on Trustpilot (2,500+ Reviews)
              </span>
            </div>

            {/* Unified Professional Trust & Coverage Eyebrow Bar */}
            <div className="hero-unified-pill hero-animate-badge" style={{ animationDelay: '0.1s' }}>
              <div className="pill-section pill-accreditation">
                <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />
                <span>{activeSlideData.eyebrow}</span>
              </div>
              <span className="pill-separator" aria-hidden="true">&bull;</span>
              <div className="pill-section pill-location">
                <MapPin size={13} className="text-sky-400 flex-shrink-0" aria-hidden="true" />
                <span>London &bull; Surrey &bull; Oxon &bull; Bucks &bull; Berks</span>
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
                Get an Instant Quote (60s)
              </Button>

              <Button
                href="#services"
                variant="outline-white"
                size="lg"
                className="hero-secondary-cta"
              >
                Compare RICS Level 2 &amp; 3
              </Button>
            </div>

            {/* Trust and Assurance Indicators */}
            <div className="hero-features-list hero-animate-features">
              <div className="hero-feature-item">
                <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
                <span>Traffic-Light 1-2-3 Defect Ratings</span>
              </div>
              <div className="hero-feature-item">
                <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
                <span>Direct Post-Survey Phone Debrief</span>
              </div>
              <div className="hero-feature-item">
                <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
                <span>Fast 48h – 72h Digital PDF Delivery</span>
              </div>
              <div className="hero-feature-item">
                <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
                <span>Over £14,000 Avg. Buyer Savings</span>
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  FileText,
  ChevronDown,
  Award,
  Calendar,
  Layers,
  Search,
  Check,
  User,
  LogIn,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export const PracticeWebsitePage = () => {
  const { user, isAuthenticated, getRoleDashboard } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('l2');
  const [propertyPrice, setPropertyPrice] = useState(350000);
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Pricing calculation helper
  const calculateFee = () => {
    let base = 450;
    if (selectedService === 'l3') base = 750;
    if (selectedService === 'snag') base = 380;
    if (selectedService === 'valuation') base = 520;
    if (selectedService === 'damp') base = 420;
    if (selectedService === 'expert') base = 900;

    const valueAdjustment = Math.max(0, Math.floor((propertyPrice - 200000) / 100000) * 45);
    return base + valueAdjustment;
  };

  const services = [
    {
      id: 'l2',
      title: 'RICS Level 2 Homebuyer Survey',
      badge: 'Most Popular',
      priceFrom: '£450',
      description: 'Ideal for standard conventional properties in reasonable condition built after 1900. Includes traffic-light condition ratings.',
      features: [
        'Full interior & exterior inspection',
        'Roof space & chimney breast review',
        'Damp meter readings throughout',
        'Clear RICS 1-3 condition ratings',
        'Urgent repairs & maintenance advice',
      ],
    },
    {
      id: 'l3',
      title: 'RICS Level 3 Full Building Survey',
      badge: 'Comprehensive',
      priceFrom: '£750',
      description: 'Essential for older properties (pre-1900), listed buildings, altered homes, or properties planning major renovations.',
      features: [
        'In-depth structural integrity report',
        'Diagnostic analysis of defects & causes',
        'Estimated repair costs & timelines',
        'Drone roof inspection (where safe)',
        'Direct phone debrief with your surveyor',
      ],
    },
    {
      id: 'snag',
      title: 'New Build Snagging Survey',
      badge: 'New Homes',
      priceFrom: '£380',
      description: 'Detailed inspection of newly constructed homes before or after completion to hold developers accountable to NHBC standards.',
      features: [
        'Average 150+ snags identified per home',
        'Cosmetic, structural & regulatory checks',
        'Ready-to-submit developer PDF report',
        'Thermal imaging thermal leak detection',
        'Re-inspection option available',
      ],
    },
    {
      id: 'valuation',
      title: 'RICS Red Book Valuation',
      badge: 'Legal & Tax',
      priceFrom: '£520',
      description: 'Formal RICS-compliant valuations for probate, Help to Buy redemption, shared ownership, capital gains, and matrimonial disputes.',
      features: [
        'RICS Registered Valuer certified',
        'Accepted by HMRC, lenders & solicitors',
        'Target Market Comparables analysis',
        'Valid for 3 months with easy extension',
        'Independent open-market assessment',
      ],
    },
    {
      id: 'damp',
      title: 'Specific Defect & Damp Survey',
      badge: 'Specialist',
      priceFrom: '£420',
      description: 'Independent diagnostic report targeting specific issues such as rising damp, condensation, timber rot, or wall cracks without contractor sales bias.',
      features: [
        'Independent diagnosis (we sell no treatments)',
        'Moisture profiling with protimeter',
        'Remedial specifications report',
        'Guaranteed unbiased recommendations',
        'Protects against unnecessary £5k+ treatments',
      ],
    },
    {
      id: 'expert',
      title: 'Expert Witness & Dispute Reports',
      badge: 'Litigation',
      priceFrom: '£900',
      description: 'Court-compliant Civil Procedure Rules (CPR Part 35) surveying reports for property disputes, building contractor claims, and boundary issues.',
      features: [
        'Civil Procedure Rules (CPR 35) compliant',
        'Available for court cross-examination',
        'Evidence-based forensic analysis',
        'Joint single expert instructions',
        'Strict RICS professional conduct code',
      ],
    },
  ];

  const faqs = [
    {
      q: 'What is the difference between a Level 2 and Level 3 survey?',
      a: 'A Level 2 Homebuyer survey is tailored for conventional modern homes in reasonable condition. A Level 3 Building survey provides a thorough, forensic examination of structural fabric, causes of hidden defects, detailed remediation advice, and estimated repair timelines. It is strongly recommended for homes built before 1900 or substantially altered.',
    },
    {
      q: 'How quickly will I receive my completed report?',
      a: 'Our chartered surveyors provide an immediate verbal debrief over the phone on the afternoon of inspection. The complete, professionally formatted RICS digital report is delivered via your secure Client Portal within 48 to 72 hours.',
    },
    {
      q: 'Are your surveyors directly accredited with RICS?',
      a: 'Yes. All our practicing surveyors are qualified Chartered Surveyors (MRICS / FRICS) or registered RICS Associate members (AssocRICS), bound by RICS regulatory governance and holding full £250,000+ Professional Indemnity Insurance.',
    },
    {
      q: 'Do you arrange key collection and estate agent access?',
      a: 'Absolutely. Once you confirm your booking, our administrative operations team liaises directly with your estate agent, vendor, or site manager to schedule access, inspect keys, and coordinate inspection times seamlessly.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#2563EB] selection:text-white overflow-x-hidden">
      {/* Top Banner Announcement */}
      <div className="bg-[#071534] text-slate-200 text-xs py-2 px-3 sm:px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-semibold text-white truncate">UK Property Surveying Practice</span>
            <span className="text-slate-400 hidden xl:inline">• Independent RICS-Aligned Surveyors Across England & Wales</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-slate-300 shrink-0">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#2563EB]" />
              <strong>0800 783 9120</strong>
            </span>
            <span className="hidden md:flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Next-day inspection slots
            </span>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2">
          {/* Logo matching User reference */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-[#0B1F4D] flex items-center justify-center text-white shadow-md shadow-[#0B1F4D]/20 group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-[#0B1F4D] leading-none truncate">
                UK Property Surveying Practice
              </div>
              <div className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1 truncate">
                INDEPENDENT RICS-ALIGNED SURVEYORS
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#services" className="hover:text-[#2563EB] transition-colors">Survey Services</a>
            <a href="#calculator" className="hover:text-[#2563EB] transition-colors">Fee Estimator</a>
            <a href="#why-us" className="hover:text-[#2563EB] transition-colors">Why Choose Us</a>
            <a href="#faqs" className="hover:text-[#2563EB] transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-[#2563EB] transition-colors">Contact</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <button
                onClick={() => navigate(getRoleDashboard(user.role))}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1F4D] text-white hover:bg-[#12285E] text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Go to Dashboard</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/90 text-slate-700 hover:text-[#0B1F4D] hover:bg-slate-50 text-xs font-bold transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Client Portal / Login</span>
              </Link>
            )}

            <a
              href="#calculator"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all"
            >
              <span>Instant Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-[#0B1F4D] rounded-xl hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                Survey Services
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                Fee Estimator
              </a>
              <a
                href="#why-us"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                Why Choose Us
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                FAQ
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                Contact
              </a>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
              >
                Client Portal / Login
              </Link>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 text-center rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm"
              >
                Instant Survey Quote
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 pt-10 sm:pt-16 pb-16 sm:pb-24 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0B1F4D] text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span>INDEPENDENT RICS-ALIGNED SURVEYORS</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-[#0B1F4D] tracking-tight leading-[1.15]">
                Protecting Your Property Investment Across The UK
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Expert residential & commercial building surveys with clear traffic-light condition ratings, transparent fixed fees, and comprehensive digital reports delivered within 48 hours.
              </p>

              {/* Key Trust Checkmarks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-left text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>RICS Aligned Practice</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fast 48-Hour Turnaround</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fixed Fee Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct Surveyor Debrief</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Drone Roof Inspections</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>£250k Insurance Cover</span>
                </div>
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3">
                <a
                  href="#calculator"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Calculate Instant Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0B1F4D] text-sm font-bold border border-slate-200/90 shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <User className="w-4 h-4 text-[#2563EB]" />
                  <span>Client & Surveyor Portal</span>
                </Link>
              </div>

              {/* Rating Proof */}
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-4 border-t border-slate-200/60 text-xs text-slate-500">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span>
                  <strong>4.9 / 5.0 Rating</strong> from 850+ verified UK buyers
                </span>
              </div>
            </div>

            {/* Right: Interactive Live Quote Estimator */}
            <div id="calculator" className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-900/5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-[#0B1F4D]">Instant Fee Estimator</h3>
                    <p className="text-xs text-slate-500">Get a guaranteed fixed price in 10 seconds</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Fixed Price
                  </span>
                </div>

                <div className="space-y-4 pt-4">
                  {/* Select Survey Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Required Survey Type
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      <option value="l2">RICS Level 2 Homebuyer Survey (Standard)</option>
                      <option value="l3">RICS Level 3 Full Building Survey (Comprehensive)</option>
                      <option value="snag">New Build Snagging Inspection</option>
                      <option value="valuation">RICS Red Book Property Valuation</option>
                      <option value="damp">Specific Defect & Damp Diagnostic</option>
                      <option value="expert">Expert Witness & CPR 35 Report</option>
                    </select>
                  </div>

                  {/* Property Value Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Property Purchase Price</span>
                      <span className="text-[#2563EB]">£{propertyPrice.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="100000"
                      max="1500000"
                      step="25000"
                      value={propertyPrice}
                      onChange={(e) => setPropertyPrice(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>£100k</span>
                      <span>£750k</span>
                      <span>£1.5m+</span>
                    </div>
                  </div>

                  {/* Calculated Price Result */}
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Estimated Fee (inc. VAT)
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-[#0B1F4D]">
                        £{calculateFee()}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      <span className="block font-semibold text-emerald-700">✓ No hidden extras</span>
                      <span>✓ Report in 48h</span>
                    </div>
                  </div>

                  {/* Proceed to Booking */}
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#12285E] text-white text-xs font-bold shadow-md shadow-[#0B1F4D]/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Proceed to Book Inspection</span>
                    <ArrowRight className="w-4 h-4 text-[#2563EB]" />
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Instant confirmation • Key collection handled with your selling agent
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block mb-1">
            RICS Certified Services
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F4D] tracking-tight">
            Comprehensive Property Surveying Solutions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every inspection is executed in strict adherence to RICS Home Survey Standards by local, highly experienced chartered surveyors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {srv.badge}
                  </span>
                  <span className="text-base font-black text-[#0B1F4D]">
                    {srv.priceFrom} <span className="text-[10px] font-normal text-slate-400">from</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0B1F4D] mb-2">{srv.title}</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{srv.description}</p>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {srv.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Book This Survey</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-16 sm:py-24 bg-[#0B1F4D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">
              The Independent Advantage
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Why Instruct UK Property Surveying Practice?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              We work solely for you—the buyer. No estate agent commissions, no contractor cross-selling.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-1">100% Independent</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                We are completely separate from estate agents and lenders. Our sole duty of care is protecting you.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-1">48-Hour Report SLA</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Same-day phone debrief followed by comprehensive digital PDF report published to your portal within 48h.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-1">Direct Surveyor Call</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Speak directly to the chartered surveyor who inspected your home to ask questions before exchanging contracts.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-1">Negotiation Leverage</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our clients save an average of £5,800 by using our survey defect costings to renegotiate purchase prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest block mb-1">
            Questions & Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F4D]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#0B1F4D] cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    expandedFaq === idx ? 'rotate-180 text-[#2563EB]' : ''
                  }`}
                />
              </button>
              {expandedFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Footer */}
      <footer id="contact" className="bg-[#071534] text-slate-400 text-xs pt-14 pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            {/* Column 1: Logo & Tagline */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B1F4D] flex items-center justify-center text-white ring-1 ring-white/20">
                  <Building2 className="w-5 h-5 text-white stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white leading-none">
                    UK Property Surveying Practice
                  </div>
                  <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                    INDEPENDENT RICS-ALIGNED SURVEYORS
                  </div>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Independent chartered building surveyors delivering authoritative property inspections across London, the Midlands, and the South of England.
              </p>
            </div>

            {/* Column 2: Services */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Our Surveys</h5>
              <ul className="space-y-2 text-[11px]">
                <li><a href="#services" className="hover:text-white transition-colors">RICS Level 2 Homebuyer</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">RICS Level 3 Building Survey</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">New Build Snagging</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Red Book Valuations</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Damp & Timber Diagnosis</a></li>
              </ul>
            </div>

            {/* Column 3: Portals */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Portals & Access</h5>
              <ul className="space-y-2 text-[11px]">
                <li><Link to="/login" className="hover:text-white transition-colors">Client Portal Sign In</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Chartered Surveyor Login</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Staff & Operations Dispatch</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register Survey Account</Link></li>
                <li><Link to="/forgot-password" className="hover:text-white transition-colors">Password Reset</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact & Regulatory */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Direct Practice Contact</h5>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>0800 783 9120 / 020 7946 0192</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>instructions@propertysurveying.co.uk</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>14 Berkeley Street, Mayfair, London W1J 8BY</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>© 2026 UK Property Surveying Practice. All rights reserved.</span>
            <span>INDEPENDENT RICS-ALIGNED SURVEYORS • Professional Indemnity Insured</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

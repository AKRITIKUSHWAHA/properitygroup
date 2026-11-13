import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  ArrowRight, 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  Phone, 
  FileText, 
  Scale, 
  Home, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { SurveySelector } from '../../components/home/SurveySelector';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function WhichSurveyPage() {
  useDocumentTitle(
    "Which Survey Do I Need? — Interactive RICS Survey Decision Tool",
    "Interactive property survey recommendation tool. Compare RICS Level 2 Homebuyer Survey, Level 3 Building Survey, and New-Build Snagging to choose the right inspection for your home."
  );

  return (
    <div className="which-survey-page luxury-site-canvas">
      {/* 1. Page Header & Hero Banner */}
      <section className="which-survey-hero bg-gradient-to-b from-slate-950 via-[#0B1F4D] to-slate-900 text-white pt-24 pb-16 border-b border-slate-800">
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home size={13} />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-emerald-400">What Survey Do I Need?</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
              <Compass size={14} />
              <span>Interactive RICS Decision Calculator</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              What Survey Do I Need?
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Selecting the right survey ensures you don't overpay for unnecessary testing or under-inspect complex structures. Answer 3 quick questions below for an instant, tailored recommendation.
            </p>
          </div>
        </Container>
      </section>

      {/* 2. Interactive Decision Tool */}
      <div className="py-12 bg-slate-900/60">
        <SurveySelector />
      </div>

      {/* 3. Comprehensive RICS Survey Level Comparison Guide */}
      <section className="section py-16 bg-slate-950 text-white border-t border-slate-800">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
              RICS Benchmark Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Compare Survey Levels at a Glance
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              All surveys are conducted by independent RICS-aligned building surveyors with zero contractor bias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level 2 Card */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 inline-block mb-3">
                  Most Popular
                </span>
                <h3 className="text-xl font-bold text-white mb-1">RICS Level 2</h3>
                <div className="text-sm font-semibold text-slate-400 mb-4">Homebuyer Survey</div>
                <div className="text-2xl font-black text-white font-mono mb-4">From £425 <span className="text-xs font-normal text-slate-400">Inc VAT</span></div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Best for standard, conventional houses and purpose-built flats built after 1930 in reasonable physical condition.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Visual roof, wall, chimney &amp; drainage check</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Electronic damp meter profiling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Traffic-light (1-2-3) defect rating system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Direct telephone debrief with surveyor</span>
                  </li>
                </ul>
              </div>

              <Button to="/services/homebuyer-survey-level-2" variant="primary" size="sm" className="w-full">
                View Level 2 Details
              </Button>
            </div>

            {/* Level 3 Card */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/60 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                Maximum Structural Depth
              </div>

              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-3 mt-2">
                  Comprehensive Structural
                </span>
                <h3 className="text-xl font-bold text-white mb-1">RICS Level 3</h3>
                <div className="text-sm font-semibold text-slate-400 mb-4">Full Building Survey</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mb-4">From £650 <span className="text-xs font-normal text-slate-400">Inc VAT</span></div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Essential for older properties (pre-1930), listed buildings, altered homes, or properties in poor condition.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Full load-bearing walls &amp; structural framing audit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Subfloor &amp; roof void timber decay diagnostics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Prioritized repair schedules &amp; budgeting advice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Direct pre- and post-inspection surveyor debrief</span>
                  </li>
                </ul>
              </div>

              <Button to="/services/building-survey-level-3" variant="gold" size="sm" className="w-full">
                View Level 3 Details
              </Button>
            </div>

            {/* Snagging Report Card */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block mb-3">
                  Brand-New Homes
                </span>
                <h3 className="text-xl font-bold text-white mb-1">Snagging Report</h3>
                <div className="text-sm font-semibold text-slate-400 mb-4">New-Build Pre-Handover</div>
                <div className="text-2xl font-black text-white font-mono mb-4">From £350 <span className="text-xs font-normal text-slate-400">Inc VAT</span></div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  For brand-new developments and off-plan properties before or shortly after warranty handover.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Room-by-room cosmetic &amp; technical defect schedule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>NHBC / Premier guarantee compliance check</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Photographic defect catalogue for developer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Protection before 2-year developer warranty ends</span>
                  </li>
                </ul>
              </div>

              <Button to="/services/snagging-report" variant="primary" size="sm" className="w-full">
                View Snagging Details
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Hotline & Consultation Banner */}
      <section className="py-12 bg-gradient-to-r from-[#0B1F4D] to-[#142A43] text-white border-t border-slate-800">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-xl font-bold text-white">Still Unsure Which Survey Fits?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Speak directly with an RICS building surveyor on <strong className="text-white">{siteConfig.contact.telephoneDisplay}</strong> for free guidance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button to="/request-quote" variant="gold" size="md" icon={ArrowRight} iconPosition="right">
                Get Fixed-Fee Quote
              </Button>
              <a 
                href={`tel:${siteConfig.contact.telephone}`} 
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-2"
                style={{ color: '#FFFFFF' }}
              >
                <Phone size={14} />
                <span>{siteConfig.contact.telephoneDisplay}</span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
export default WhichSurveyPage;

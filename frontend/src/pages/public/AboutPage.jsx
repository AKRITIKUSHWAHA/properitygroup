import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  ShieldCheck, 
  Award, 
  Scale, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  UserCheck 
} from 'lucide-react';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function AboutPage() {
  useDocumentTitle(
    "About Us — NJS Property Group | Director Natasha Shergill",
    "Learn about NJS Property Group, our leadership under Director Natasha Shergill with 10+ years of experience across real estate, surveying, and legal advisory, and our RICS-aligned practice standards."
  );

  return (
    <div className="about-page luxury-site-canvas">
      {/* 1. Hero Header Banner */}
      <section className="about-hero bg-gradient-to-b from-slate-950 via-[#0B1F4D] to-slate-900 text-white pt-24 pb-16 border-b border-slate-800">
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home size={13} />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-emerald-400">About Us</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
              <ShieldCheck size={14} />
              <span>Independent RICS-Aligned Practice</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              About NJS Property Group
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              An independent chartered building surveying and valuation practice dedicated to delivering objective defect diagnostics, clear technical insight, and uncompromising buyer protection across London and the Home Counties.
            </p>
          </div>
        </Container>
      </section>

      {/* 2. Director Profile Section (Client Focus: Natasha Shergill) */}
      <section className="section py-16 bg-slate-900/60 text-white border-b border-slate-800">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Director Image / Badge Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm rounded-3xl p-1 bg-gradient-to-b from-emerald-500/40 via-slate-700/50 to-slate-800/80 shadow-2xl">
                <div className="rounded-[22px] bg-slate-950 p-6 sm:p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Profile Emblem / Avatar */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-br from-[#0B1F4D] to-slate-800 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-xl mb-5">
                    <UserCheck size={48} className="text-emerald-400" />
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight">Natasha Shergill</h3>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mt-1 mb-4">
                    Director &amp; Practice Principal
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 mb-6">
                    <Award size={13} className="text-emerald-400" />
                    <span>10+ Years Professional Practice</span>
                  </div>

                  {/* Key Credentials Badges */}
                  <div className="grid grid-cols-2 gap-2 text-left pt-4 border-t border-slate-800 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-bold">Focus</span>
                      <span className="text-white font-semibold">Real Estate &amp; Valuation</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-bold">Expertise</span>
                      <span className="text-white font-semibold">Surveying &amp; Legal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Leadership Bio & Vision */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <GraduationCap size={15} />
                <span>Practice Leadership</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Decade-Long Commitment to Precision &amp; Client Advocacy
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Under the strategic direction of <strong className="text-white font-bold">Natasha Shergill</strong>, NJS Property Group has established itself as a premier independent property advisory practice. With over a decade of comprehensive experience spanning real estate acquisitions, building surveying standards, and property legal frameworks, Natasha oversees our mission to safeguard purchasers from unforeseen structural liabilities.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Her multifaceted background in surveying, property law, and real estate market dynamics ensures that every inspection conducted by NJS adheres strictly to the highest RICS benchmarks, offering clients transparent, court-tested, and commercially astute advice.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                    <CheckCircle2 size={16} />
                    <span>100% Unbiased Advice</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Committed to diagnostic reporting only. We never sell repair products or contractor services.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                    <CheckCircle2 size={16} />
                    <span>Direct Communication</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Personalized attention with direct telephone consultations before and after report delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Core Practice Standards & Ethics */}
      <section className="section py-16 bg-slate-950 text-white border-b border-slate-800">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
              Our Foundations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Instruct NJS Property Group?
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Our independent status guarantees that our sole fiduciary duty is to you, the instructing client.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pure Independence</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unlike corporate panel firms tied to estate agents or mortgage lenders, our reports are written exclusively for your financial protection.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Scale size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Legal &amp; CPR Part 35 Depth</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our evidence-based inspections and defect schedules are admissible in court for litigation, boundary disputes, and warranty claims.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">RICS Standards Benchmarks</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every report incorporates traffic-light condition ratings (1-Green, 2-Amber, 3-Red) with actionable repair cost advice.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Official Industry Accreditations Strip */}
      <section className="py-12 bg-slate-900/90 border-b border-slate-800">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Professional Accreditations
              </span>
              <h3 className="text-lg font-bold text-white">Regulated &amp; Aligned Practice</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              <div className="h-14 px-4 py-2 rounded-2xl bg-white flex items-center justify-center shadow-md">
                <img src="/images/rics-regulated-logo.jpeg" alt="Regulated by RICS" style={{ maxHeight: "36px", maxWidth: "110px", width: "auto", height: "auto", objectFit: "contain" }} />
              </div>
              <div className="h-14 px-4 py-2 rounded-2xl bg-white flex items-center justify-center shadow-md">
                <img src="/images/rics-valuer-logo.png" alt="RICS Registered Valuer" style={{ maxHeight: "36px", maxWidth: "110px", width: "auto", height: "auto", objectFit: "contain" }} />
              </div>
              <div className="h-14 px-4 py-2 rounded-2xl bg-white flex items-center justify-center shadow-md">
                <img src="/images/ciob-logo.png" alt="CIOB" style={{ maxHeight: "36px", maxWidth: "110px", width: "auto", height: "auto", objectFit: "contain" }} />
              </div>
              <div className="h-14 px-4 py-2 rounded-2xl bg-white flex items-center justify-center shadow-md">
                <img src="/images/rpsa-logo.png" alt="RPSA" style={{ maxHeight: "36px", maxWidth: "110px", width: "auto", height: "auto", objectFit: "contain" }} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 5. Contact & Booking Callout Banner */}
      <section className="py-14 bg-gradient-to-r from-[#0B1F4D] via-[#142A43] to-slate-900 text-white">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Ready to Discuss Your Property?</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Speak directly with Director Natasha Shergill and our surveying team on <strong className="text-white">{siteConfig.contact.telephoneDisplay}</strong>.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button to="/request-quote" variant="gold" size="md" icon={ArrowRight} iconPosition="right">
                Request Survey Quote
              </Button>
              <Button to="/contact" variant="outline-white" size="md">
                Contact Office
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
export default AboutPage;


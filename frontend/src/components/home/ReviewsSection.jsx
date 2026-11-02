import React from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, Quote } from 'lucide-react';
import { Container } from '../common/Container';
import { SectionHeading } from '../common/SectionHeading';

export function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      name: 'Sarah & James Mitchell',
      location: 'Guildford, Surrey',
      surveyType: 'RICS Level 3 Building Survey',
      date: 'Verified October 2026',
      stars: 5,
      headline: 'Saved us £18,500 on our Victorian terrace purchase',
      content:
        'The surveyor identified extensive hidden damp in the subfloor timbers and a decaying chimney stack that the estate agent had glossed over. The clear traffic light rating and photographic evidence gave us the leverage to renegotiate the purchase price before exchanging contracts. Absolutely invaluable service.',
    },
    {
      id: 2,
      name: 'Marcus Vance',
      location: 'Kensington, London W8',
      surveyType: 'RICS Level 2 Homebuyer Survey',
      date: 'Verified October 2026',
      stars: 5,
      headline: '48-hour digital delivery was vital for our timeline',
      content:
        'We were on a tight deadline with a chain. The inspection was carried out on Tuesday and the full 54-page indexed report was in our inbox by Thursday afternoon. The surveyor also took 25 minutes on the phone to explain every item in plain English. Could not recommend more highly.',
    },
    {
      id: 3,
      name: 'Dr. Priya Sharma',
      location: 'Jericho, Oxford',
      surveyType: 'RICS Level 2 Home Survey',
      date: 'Verified September 2026',
      stars: 5,
      headline: 'Traffic-light defect coding made it so easy to understand',
      content:
        'As first-time buyers, reading technical architectural jargon can be overwhelming. The green, amber, red condition scoring was straightforward. We knew exactly which repairs were urgent safety concerns and which could wait a year. 10/10 service.',
    },
    {
      id: 4,
      name: 'Thomas & Charlotte Hughes',
      location: 'Windsor, Berkshire',
      surveyType: 'RICS Level 3 Building Survey',
      date: 'Verified September 2026',
      stars: 5,
      headline: 'Comprehensive, rigorous and CPR compliant',
      content:
        'Instructed for an Edwardian detached house with a later 1990s extension. The surveyor uncovered unconsented structural wall removals and unvented roof spaces. The technical depth was second to none. Worth every penny for peace of mind.',
    },
  ];

  return (
    <section className="section reviews-section" aria-label="Client Testimonials and Trustpilot Reviews">
      <Container>
        {/* Trustpilot Header Hero Badge */}
        <div className="trustpilot-hero-card">
          <div className="trustpilot-brand-col">
            <div className="trustpilot-stars-row">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="tp-star-box">
                  <Star size={18} className="fill-white text-white" />
                </div>
              ))}
            </div>
            <div className="tp-score-text">
              <strong>Rated 4.8 / 5</strong> &bull; Excellent
            </div>
            <span className="tp-count-label">Based on 2,500+ verified homeowner reviews</span>
          </div>

          <div className="trustpilot-metrics-col">
            <div className="tp-metric">
              <span className="tp-metric-val">98.6%</span>
              <span className="tp-metric-lbl">On-Time Delivery</span>
            </div>
            <div className="tp-metric-divider" />
            <div className="tp-metric">
              <span className="tp-metric-val">100%</span>
              <span className="tp-metric-lbl">RICS Aligned</span>
            </div>
            <div className="tp-metric-divider" />
            <div className="tp-metric">
              <span className="tp-metric-val">£14,200</span>
              <span className="tp-metric-lbl">Avg. Defect Savings</span>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <SectionHeading
          eyebrow="Independent Client Feedback"
          title="What Our Clients Say About Our Surveys"
          subtitle="Real reviews from homebuyers across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire who used our reports to protect their property purchases."
        />

        {/* Reviews Grid */}
        <div className="reviews-grid">
          {reviews.map((rev) => (
            <div key={rev.id} className="review-card">
              <div className="review-top">
                <div className="review-stars">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} size={15} className="fill-emerald-500 text-emerald-500" />
                  ))}
                </div>
                <div className="review-verified-badge">
                  <CheckCircle2 size={13} className="text-emerald-600 mr-1" />
                  <span>{rev.date}</span>
                </div>
              </div>

              <h4 className="review-headline">"{rev.headline}"</h4>
              <p className="review-text">{rev.content}</p>

              <div className="review-author-meta">
                <div className="author-avatar">
                  {rev.name.charAt(0)}
                </div>
                <div className="author-details">
                  <span className="author-name">{rev.name}</span>
                  <span className="author-loc">{rev.location} &bull; <strong className="text-slate-700">{rev.surveyType}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}


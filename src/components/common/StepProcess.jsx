import React from 'react';
import { FileSearch, FileSignature, HardHat, FileCheck2, ArrowRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

export function StepProcess() {
  const steps = [
    {
      number: "01",
      title: "Online Quote & Scope",
      icon: FileSearch,
      desc: "Specify your property type, address, and target timescale to receive a fixed, transparent quotation tailored to your property's age and architectural form."
    },
    {
      number: "02",
      title: "Terms & Booking",
      icon: FileSignature,
      desc: "Review your service-specific Terms of Engagement and confirm booking details. Our coordinators liaise directly with the selling agent or vendor for site access."
    },
    {
      number: "03",
      title: "Physical Site Inspection",
      icon: HardHat,
      desc: "Our surveyor attends the property to conduct a non-invasive physical examination of roofs, structural walls, fabric, subfloor ventilation, and grounds."
    },
    {
      number: "04",
      title: "Detailed Report & Advice",
      icon: FileCheck2,
      desc: "Receive your comprehensive, indexed PDF report typically within 3 to 5 working days, followed by an immediate telephone debrief with your surveyor."
    }
  ];

  return (
    <div className="process-component" aria-label="Survey Process Overview">
      <SectionHeading
        eyebrow="The Survey Journey"
        title="What to Expect: From Instruction to Final Report"
        subtitle="A structured, transparent four-step workflow ensuring you receive rigorous inspection, clear defect diagnosis, and actionable property guidance."
      />

      {/* Process Timeline Grid */}
      <div className="process-timeline-wrapper">
        <div className="process-timeline-bar" aria-hidden="true" />
        <div className="step-grid">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div key={step.number} className="step-card group stagger-item">
                <div className="step-top-row">
                  <div className="step-icon-wrap" aria-hidden="true">
                    <StepIcon size={22} />
                  </div>
                  <span className="step-badge-number">{step.number}</span>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                <div className="step-indicator-bar" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

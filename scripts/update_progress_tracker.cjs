const fs = require('fs');
const path = require('path');

const trackerPath = path.join(__dirname, '../src/components/customer/SurveyProgressTracker.jsx');
let content = fs.readFileSync(trackerPath, 'utf8');

const dynamicStagesCode = `
export const getSurveyStages = (job) => {
  const property = job?.property || 'the property';
  const surveyor = job?.surveyor || 'Assigned Surveyor';
  const fee = job?.quote?.baseFee ? \`£\${job.quote.baseFee.toFixed(2)} (+VAT)\` : 'agreed fee';

  return [
    {
      step: 1,
      title: 'Enquiry Received',
      shortName: 'Enquiry',
      date: job?.date ? \`Logged: \${job.date}\` : 'Recently',
      icon: Send,
      desc: \`Survey instruction logged for \${property} via online portal.\`,
    },
    {
      step: 2,
      title: 'Quote Issued',
      shortName: 'Quote',
      date: 'NJS Estimating',
      icon: FileText,
      desc: \`Fixed-price fee proposal \${fee} issued by NJS estimating team.\`,
    },
    {
      step: 3,
      title: 'Quote Accepted',
      shortName: 'Accepted',
      date: 'Client Instruction',
      icon: CheckCircle2,
      desc: \`Customer confirmed instruction for \${job?.surveyType || 'RICS Survey'}.\`,
    },
    {
      step: 4,
      title: 'Terms Signed',
      shortName: 'Signed',
      date: job?.termsStatus === 'Signed' ? 'Executed' : 'Pending',
      icon: FileCheck,
      desc: 'RICS Letter of Engagement digitally executed under RICS regulatory governance.',
    },
    {
      step: 5,
      title: 'Payment Confirmed',
      shortName: 'Paid',
      date: job?.paymentStatus === 'Paid' ? 'Settled' : 'Pending',
      icon: CreditCard,
      desc: job?.paymentStatus === 'Paid' ? 'Client account payment settled in full. VAT receipt available in portal.' : 'Deposit or full invoice pending payment settlement.',
    },
    {
      step: 6,
      title: 'Appointment Booked',
      shortName: 'Booked',
      date: job?.date ? \`\${job.date}, \${job.timeSlot || 'Confirmed slot'}\` : 'Scheduled',
      icon: CalendarCheck,
      desc: \`Inspection confirmed with \${surveyor}. Access arranged directly with selling agent.\`,
    },
    {
      step: 7,
      title: 'Inspection Completed',
      shortName: 'Inspected',
      date: 'Field Inspection',
      icon: Eye,
      desc: \`Physical on-site inspection concluded by \${surveyor}.\`,
    },
    {
      step: 8,
      title: 'Report Preparation',
      shortName: 'Drafting',
      date: 'Drafting',
      icon: Sparkles,
      desc: 'Surveyor drafting technical condition ratings and analyzing photographic evidence.',
    },
    {
      step: 9,
      title: 'Quality Check',
      shortName: 'QA Review',
      date: 'Peer Review',
      icon: ShieldCheck,
      desc: 'Lead Surveyor auditing defect ratings against RICS Home Survey Standard.',
    },
    {
      step: 10,
      title: 'Report Delivered',
      shortName: 'Delivered',
      date: 'Available Now',
      icon: Download,
      desc: 'Final accredited survey report published to your customer portal for instant download.',
    },
  ];
};

export const SURVEY_STAGES = getSurveyStages(null);
`;

// Replace static SURVEY_STAGES with dynamic getSurveyStages
const oldStagesRegex = /export const SURVEY_STAGES = \[[\s\S]*?\n\];/;
content = content.replace(oldStagesRegex, dynamicStagesCode.trim());

// Inside SurveyProgressTracker component, use dynamic stages
content = content.replace(
  'export const SurveyProgressTracker = ({ currentStep = 7, job = null }) => {\n  const [selectedStep, setSelectedStep] = useState(currentStep);',
  'export const SurveyProgressTracker = ({ currentStep = 7, job = null }) => {\n  const [selectedStep, setSelectedStep] = useState(currentStep);\n  const stages = getSurveyStages(job);'
);

content = content.replace(
  'const activeStageObj = SURVEY_STAGES.find((s) => s.step === selectedStep) || SURVEY_STAGES[currentStep - 1];',
  'const activeStageObj = stages.find((s) => s.step === selectedStep) || stages[currentStep - 1];'
);

content = content.replace(
  "Real-time milestone tracking for {job?.property || '14 Mayfair Gate, London W1K 2PB'}",
  "Real-time milestone tracking for {job?.property || 'Your Property'}"
);

content = content.replace(
  'Stage {currentStep} of 10: {SURVEY_STAGES[currentStep - 1]?.title}',
  'Stage {currentStep} of 10: {stages[currentStep - 1]?.title}'
);

content = content.replace(
  '{SURVEY_STAGES.map((stage) => {',
  '{stages.map((stage) => {'
);

fs.writeFileSync(trackerPath, content, 'utf8');
console.log('Successfully updated SurveyProgressTracker.jsx with dynamic stages and privacy protection!');


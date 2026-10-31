import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  PoundSterling,
  ShieldCheck,
  FileText,
  MapPin,
  ExternalLink,
  Download,
  AlertCircle,
  HelpCircle,
  Zap,
  Phone,
  Mail,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  PARTNER_AGENCIES,
  getPartnerReferrals,
  submitNewReferral,
  PROPERTY_INTELLIGENCE_DATA,
} from '../../mock/partners';
import { useToast } from '../../components/ToastContext';
import { downloadReportPDF } from '../../utils/pdfGenerator';

export function PartnerPortalPage() {
  const { addToast } = useToast();
  const [selectedAgencyId, setSelectedAgencyId] = useState('ptr-foxtons');
  const [referrals, setReferrals] = useState(() => getPartnerReferrals());
  const [filterStage, setFilterStage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('referrals'); // 'referrals' or 'intelligence'

  // Property Intelligence Lookup State (Point 26)
  const [lookupPostcode, setLookupPostcode] = useState('W1K 2PB');
  const [intelligenceResult, setIntelligenceResult] = useState(
    PROPERTY_INTELLIGENCE_DATA['W1K 2PB']
  );

  // New Referral Form State
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('');
  const [newBuyerEmail, setNewBuyerEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPostcode, setNewPostcode] = useState('W1K 2PB');
  const [newSurveyLevel, setNewSurveyLevel] = useState('RICS Level 2 Homebuyer Survey');
  const [newKeyDetails, setNewKeyDetails] = useState('');
  const [formIntelPreview, setFormIntelPreview] = useState(null);

  const agency =
    PARTNER_AGENCIES.find((a) => a.id === selectedAgencyId) || PARTNER_AGENCIES[0];

  const agencyReferrals = referrals.filter(
    (ref) => ref.partnerId === agency.id
  );

  // Stats calculation
  const totalReferrals = agencyReferrals.length;
  const completedReferrals = agencyReferrals.filter(
    (r) => r.stageCode === 'completed'
  ).length;
  const totalEarnedCommission = completedReferrals * agency.commissionRate;
  const inProgressReferrals = totalReferrals - completedReferrals;
  const pendingCommission = inProgressReferrals * agency.commissionRate;

  // Filtered list
  const filteredList = agencyReferrals.filter((ref) => {
    if (filterStage === 'completed' && ref.stageCode !== 'completed') return false;
    if (filterStage === 'in_progress' && ref.stageCode === 'completed') return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        ref.buyerName.toLowerCase().includes(q) ||
        ref.propertyAddress.toLowerCase().includes(q) ||
        ref.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePostcodeLookup = (pc) => {
    const clean = pc.trim().toUpperCase();
    setLookupPostcode(clean);
    const data =
      PROPERTY_INTELLIGENCE_DATA[clean] || PROPERTY_INTELLIGENCE_DATA['W1K 2PB'];
    setIntelligenceResult(data);
  };

  const handleFormPostcodeChange = (pc) => {
    setNewPostcode(pc);
    const clean = pc.trim().toUpperCase();
    if (PROPERTY_INTELLIGENCE_DATA[clean]) {
      setFormIntelPreview(PROPERTY_INTELLIGENCE_DATA[clean]);
    } else {
      setFormIntelPreview(null);
    }
  };

  const handleCreateReferral = (e) => {
    e.preventDefault();
    if (!newBuyerName.trim() || !newAddress.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Required Fields',
        message: 'Please provide the buyer name and property address.',
      });
      return;
    }

    const created = submitNewReferral({
      partnerId: agency.id,
      buyerName: newBuyerName.trim(),
      buyerPhone: newBuyerPhone.trim() || '07700 900000',
      buyerEmail: newBuyerEmail.trim() || 'client@example.co.uk',
      propertyAddress: `${newAddress.trim()}, ${newPostcode.trim()}`,
      surveyLevel: newSurveyLevel,
      estimatedFee: newSurveyLevel.includes('Level 3') ? 650 : 425,
      keyDetails: newKeyDetails.trim(),
      epcRating: formIntelPreview ? formIntelPreview.epcRating : 'Band C (Estimated)',
      lastSoldPrice: formIntelPreview
        ? formIntelPreview.lastSoldPrice
        : 'HM Land Registry Record Pending',
    });

    setReferrals(getPartnerReferrals());
    setIsSubmitModalOpen(false);

    // Reset form
    setNewBuyerName('');
    setNewBuyerPhone('');
    setNewBuyerEmail('');
    setNewAddress('');
    setNewKeyDetails('');
    setFormIntelPreview(null);

    addToast({
      type: 'success',
      title: 'Survey Referral Dispatched',
      message: `Lead ${created.id} submitted for ${created.buyerName}. Dispatched to NJS Operations Desk with £50 commission tagged.`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Navigation Bar */}
      <header className="bg-[#0B1F4D] text-white border-b border-blue-900 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white leading-none">
                NJS PROPERTY GROUP
              </div>
              <div className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold mt-0.5">
                Estate Agent &amp; Referral Partner Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Agency Selector Switcher */}
            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              <span className="text-blue-200">Agency:</span>
              <select
                value={selectedAgencyId}
                onChange={(e) => setSelectedAgencyId(e.target.value)}
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
              >
                {PARTNER_AGENCIES.map((ag) => (
                  <option key={ag.id} value={ag.id} className="text-slate-900">
                    {ag.name}
                  </option>
                ))}
              </select>
            </div>

            <Link
              to="/login"
              className="text-xs text-blue-200 hover:text-white font-semibold transition-colors px-2 py-1"
            >
              Client Login
            </Link>

            <Link
              to="/login/admin"
              className="text-xs bg-white text-[#0B1F4D] hover:bg-blue-50 font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs"
            >
              Staff Back-Office
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Welcome & Agency Profile Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified RICS Practice Partner • {agency.code}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F4D] tracking-tight">
              {agency.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Welcome, <strong className="text-slate-700">{agency.contactName}</strong> ({agency.role}). Submit property survey referrals for your buyers, track live inspection progression, and monitor your monthly BACS commission payouts.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {agency.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                {agency.phone}
              </span>
              <span className="flex items-center gap-1">
                <PoundSterling className="w-3.5 h-3.5 text-emerald-600" />
                <strong>£{agency.commissionRate}.00</strong> per completed survey
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0B1F4D]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Survey Referral</span>
            </button>

            <button
              onClick={() => downloadReportPDF('SAMPLE-SPECIMEN-2026', 'Level 2 Homebuyer Survey')}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Download specimen RICS report for buyers"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Buyer Specimen (PDF)</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Referrals</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B1F4D]">
              {totalReferrals}
            </div>
            <div className="text-[11px] text-slate-500">Across London residential sales</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active In Progress</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {inProgressReferrals}
            </div>
            <div className="text-[11px] text-slate-500">Quotes &amp; Scheduled Inspections</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Surveys Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {completedReferrals}
            </div>
            <div className="text-[11px] text-slate-500">Delivered &amp; reports released</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Commission</span>
              <PoundSterling className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              £{totalEarnedCommission}.00
            </div>
            <div className="text-[11px] text-slate-500">
              +£{pendingCommission}.00 pending completion
            </div>
          </div>
        </div>

        {/* Tab Toggle: Referrals Pipeline vs Property Intelligence Tool */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'referrals'
                ? 'border-[#0B1F4D] text-[#0B1F4D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Referrals &amp; Commission Ledger ({agencyReferrals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('intelligence')}
            className={`px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'intelligence'
                ? 'border-[#0B1F4D] text-[#0B1F4D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Property Intelligence (EPC &amp; Land Registry)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              Point 26
            </span>
          </button>
        </div>

        {/* TAB 1: Referrals Pipeline & Commission Table */}
        {activeTab === 'referrals' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search buyer or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B1F4D] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                <button
                  onClick={() => setFilterStage('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    filterStage === 'all'
                      ? 'bg-[#0B1F4D] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({agencyReferrals.length})
                </button>
                <button
                  onClick={() => setFilterStage('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    filterStage === 'completed'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Completed &amp; Paid ({completedReferrals})
                </button>
                <button
                  onClick={() => setFilterStage('in_progress')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    filterStage === 'in_progress'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  In Progress ({inProgressReferrals})
                </button>
              </div>
            </div>

            {/* Referrals List Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Referral ID</th>
                      <th className="py-3.5 px-4">Homebuyer</th>
                      <th className="py-3.5 px-4">Subject Property</th>
                      <th className="py-3.5 px-4">Survey Service</th>
                      <th className="py-3.5 px-4">Pipeline Status</th>
                      <th className="py-3.5 px-4 text-right">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredList.map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0B1F4D]">
                          <div>{ref.id}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {ref.dateSubmitted}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{ref.buyerName}</div>
                          <div className="text-[11px] text-slate-500">{ref.buyerPhone}</div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-slate-800 truncate" title={ref.propertyAddress}>
                            {ref.propertyAddress}
                          </div>
                          <div className="text-[10.5px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="text-emerald-700 font-semibold">{ref.epcRating}</span>
                            <span>•</span>
                            <span>Sold {ref.lastSoldPrice}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{ref.surveyLevel}</span>
                          <div className="text-[10px] text-slate-400">Est. Fee: £{ref.estimatedFee}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                              ref.stageCode === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : ref.stageCode === 'inspection_complete'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {ref.stage}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="text-sm font-black text-emerald-700">
                            £{ref.commissionAmount}.00
                          </div>
                          <div
                            className={`text-[10px] font-bold ${
                              ref.commissionStatus === 'Paid'
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {ref.commissionStatus}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredList.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No referrals match the current search or filter criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: NJS Property Intelligence Tool (Point 26) */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            {/* Search Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#0B1F4D] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Instant UK Property Intelligence (HM Land Registry &amp; EPC Database)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter any UK postcode to inspect building era, official EPC energy certification, floor area (m²), and historic sold prices before placing your buyer's survey.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={lookupPostcode}
                  onChange={(e) => setLookupPostcode(e.target.value.toUpperCase())}
                  placeholder="e.g. W1K 2PB"
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-[#0B1F4D] focus:outline-none w-48"
                />
                <button
                  type="button"
                  onClick={() => handlePostcodeLookup(lookupPostcode)}
                  className="px-4 py-2.5 bg-[#0B1F4D] hover:bg-[#162E6E] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Lookup Intelligence
                </button>

                <div className="flex items-center gap-1 ml-2 text-xs text-slate-400">
                  <span>Presets:</span>
                  {['W1K 2PB', 'SW1X 0JH', 'SW1A 1AA'].map((pc) => (
                    <button
                      key={pc}
                      type="button"
                      onClick={() => handlePostcodeLookup(pc)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] cursor-pointer"
                    >
                      {pc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {intelligenceResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Column 1: Building Specification */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Fabric &amp; Architecture</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">Subject Property</div>
                      <div className="font-bold text-slate-900 text-sm">{intelligenceResult.address}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Construction Era</div>
                      <div className="font-bold text-blue-900">{intelligenceResult.builtEra}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Property Type</div>
                      <div className="font-semibold text-slate-800">{intelligenceResult.propertyType}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Internal Floor Area</div>
                      <div className="font-semibold text-slate-800">{intelligenceResult.floorArea}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Conservation Status</div>
                      <div className="font-semibold text-slate-800">{intelligenceResult.conservationArea}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Legal Tenure</div>
                      <div className="font-semibold text-slate-800">{intelligenceResult.tenure}</div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Energy & Building Services */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Government EPC Rating</span>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-950">Official Certificate</div>
                      <div className="text-2xl font-black text-emerald-700">{intelligenceResult.epcRating}</div>
                      <div className="text-[11px] text-emerald-800">Score: {intelligenceResult.epcScore}/100</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {intelligenceResult.epcRating.split(' ')[1]}
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">Heating &amp; Services</div>
                      <div className="font-medium text-slate-800">{intelligenceResult.heatingType}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">EPC Expiry Date</div>
                      <div className="font-medium text-slate-800">{intelligenceResult.epcExpiry}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Environmental Flood Risk</div>
                      <div className="font-medium text-emerald-700">{intelligenceResult.floodRiskSurface}</div>
                    </div>
                  </div>
                </div>

                {/* Column 3: HM Land Registry Sold Price History */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <PoundSterling className="w-4 h-4 text-emerald-600" />
                    <span>HM Land Registry Records</span>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="text-slate-500 text-[11px]">Most Recent Legal Completion</div>
                    <div className="text-2xl font-black text-[#0B1F4D]">{intelligenceResult.lastSoldPrice}</div>
                    <div className="text-[11px] text-blue-900 font-medium mt-0.5">{intelligenceResult.lastSoldDate}</div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">Previous Transaction</div>
                      <div className="font-medium text-slate-800">{intelligenceResult.previousSoldPrice}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Radon Radiation Risk</div>
                      <div className="font-medium text-slate-800">{intelligenceResult.radonClassification}</div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setNewAddress(intelligenceResult.address);
                          setNewPostcode(intelligenceResult.postcode);
                          setIsSubmitModalOpen(true);
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Refer Survey for this Property</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Submit New Survey Referral */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0B1F4D]">Submit Survey Referral</h3>
                  <div className="text-[11px] text-slate-500">
                    Partner Agency: <strong className="text-slate-700">{agency.name}</strong> ({agency.code})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4 text-xs text-left">
              {/* Buyer Contact Information */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  1. Homebuyer (Client) Details
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Buyer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David & Caroline Sterling"
                    value={newBuyerName}
                    onChange={(e) => setNewBuyerName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B1F4D] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Mobile Telephone</label>
                    <input
                      type="tel"
                      placeholder="e.g. 07700 900812"
                      value={newBuyerPhone}
                      onChange={(e) => setNewBuyerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B1F4D] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. buyer@example.co.uk"
                      value={newBuyerEmail}
                      onChange={(e) => setNewBuyerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B1F4D] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details & Intelligence */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  2. Subject Property &amp; Survey Required
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Property Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14 Mayfair Gate, South Audley Street"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B1F4D] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Postcode</label>
                    <input
                      type="text"
                      placeholder="e.g. W1K 2PB"
                      value={newPostcode}
                      onChange={(e) => handleFormPostcodeChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-[#0B1F4D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Survey Discipline</label>
                    <select
                      value={newSurveyLevel}
                      onChange={(e) => setNewSurveyLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B1F4D] focus:outline-none cursor-pointer"
                    >
                      <option value="RICS Level 2 Homebuyer Survey">RICS Level 2 Homebuyer (£425)</option>
                      <option value="RICS Level 3 Building Survey">RICS Level 3 Building Survey (£650)</option>
                      <option value="New-Build Snagging Inspection">New-Build Snagging (£350)</option>
                      <option value="Red Book Market Valuation">Red Book Market Valuation (£350)</option>
                    </select>
                  </div>
                </div>

                {/* Point 26 Auto-Intelligence Pill */}
                {formIntelPreview && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                    <div>
                      <strong>Property Intelligence:</strong> {formIntelPreview.builtEra} • {formIntelPreview.epcRating}
                    </div>
                    <span className="font-bold text-amber-800">Sold {formIntelPreview.lastSoldPrice}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Keyholder &amp; On-Site Access Instructions (For Surveyor)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Keys at Foxtons office with Sarah Croft (Branch Ref FX-402)"
                    value={newKeyDetails}
                    onChange={(e) => setNewKeyDetails(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B1F4D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Commission Guarantee Box */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PoundSterling className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-950">Partner Referral Reward</div>
                    <div className="text-[10.5px] text-emerald-800">
                      Auto-credited to {agency.name} on survey report delivery
                    </div>
                  </div>
                </div>
                <div className="text-base font-black text-emerald-700">£{agency.commissionRate}.00</div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold shadow-md shadow-[#0B1F4D]/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Referral to NJS Desk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


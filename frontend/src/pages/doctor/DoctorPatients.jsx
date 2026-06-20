import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { doctorPatients, doctorPatientHistory } from '../../lib/api';

const STATUS_STYLES = {
  waiting:  'bg-[#FEF3C7] text-[#D97706]',
  approved: 'bg-[#D1FAE5] text-[#059669]',
  rejected: 'bg-[#FEE2E2] text-[#DC2626]',
};

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    doctorPatients().then(setPatients).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openPatient = (p) => {
    setSelected(p);
    setLoadingHist(true);
    setHistory([]);
    setDateFrom(''); setDateTo('');
    doctorPatientHistory(p.patient_id)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoadingHist(false));
  };

  const q = query.trim().toLowerCase();
  const filteredPatients = q
    ? patients.filter((p) => (p.patient_name || '').toLowerCase().includes(q))
    : patients;

  const filteredHistory = history.filter((h) => {
    if (!h.submitted_at) return true;
    const d = h.submitted_at.slice(0, 10); // YYYY-MM-DD
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Patients" breadcrumb="Your patients and their case history" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient list */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4">
            Patient List {patients.length > 0 ? `(${patients.length})` : ''}
          </h3>

          {/* Search by name */}
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[18px]">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient name…"
              className="w-full pl-10 pr-3 py-2 border border-[#c5c5d8] rounded-lg text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0]"
            />
          </div>

          {loading ? (
            <p className="text-sm text-[#64748B]">Loading…</p>
          ) : patients.length === 0 ? (
            <p className="text-sm text-[#64748B]">No patients yet.</p>
          ) : filteredPatients.length === 0 ? (
            <p className="text-sm text-[#64748B]">No patient matches “{query}”.</p>
          ) : (
            <div className="space-y-2">
              {filteredPatients.map((p) => (
                <button
                  key={p.patient_id}
                  onClick={() => openPatient(p)}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    selected?.patient_id === p.patient_id
                      ? 'border-[#2d3fe0] bg-[#EEF2FF]'
                      : 'border-[#E2E8F0] hover:border-[#c5c5d8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2d3fe0] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {(p.patient_name || '?').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{p.patient_name}</p>
                      <p className="text-xs text-[#64748B]">
                        {p.last_submitted_at ? `Last: ${new Date(p.last_submitted_at).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#2d3fe0] bg-[#EEF2FF] rounded-full px-2 py-0.5">
                    {p.case_count} case{p.case_count > 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected patient history */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          {!selected ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[#c5c5d8] text-5xl mb-3 block">person_search</span>
              <p className="text-sm text-[#64748B]">Select a patient to see all their cases.</p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-1">Case History</h3>
              <p className="text-base font-semibold text-[#0F172A] mb-4">{selected.patient_name}</p>

              {/* Date range filter */}
              {history.length > 0 && (
                <div className="flex items-end gap-3 mb-4 flex-wrap">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">From</label>
                    <input type="date" value={dateFrom} max={dateTo || undefined}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="px-3 py-1.5 border border-[#c5c5d8] rounded-lg text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">To</label>
                    <input type="date" value={dateTo} min={dateFrom || undefined}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="px-3 py-1.5 border border-[#c5c5d8] rounded-lg text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0]" />
                  </div>
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                      className="px-3 py-1.5 text-xs font-semibold text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#f2f4f6]">
                      Clear
                    </button>
                  )}
                </div>
              )}

              {loadingHist ? (
                <p className="text-sm text-[#64748B]">Loading…</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-[#64748B]">No cases.</p>
              ) : filteredHistory.length === 0 ? (
                <p className="text-sm text-[#64748B]">No cases in this date range.</p>
              ) : (
                <div className="space-y-3">
                  {filteredHistory.map((h) => (
                    <div key={h.id} className="border border-[#F1F5F9] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-[#0F172A]">
                          {h.submitted_at ? new Date(h.submitted_at).toLocaleDateString() : ''}
                        </span>
                        <span className={`text-xs font-semibold rounded-full px-2 py-0.5 capitalize ${STATUS_STYLES[h.status] || 'bg-[#f2f4f6] text-[#64748B]'}`}>
                          {h.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B]">
                        AI: {h.ai_label || 'N/A'} (Grade {h.ai_grade ?? 'N/A'})
                      </p>
                      {h.final_diagnosis && (
                        <p className="text-xs text-[#0F172A] mt-1">Diagnosis: {h.final_diagnosis}</p>
                      )}
                      <Link to={`/doctor/case/${h.id}`} className="inline-block mt-2 text-xs font-semibold text-[#2d3fe0] hover:underline">
                        View case →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

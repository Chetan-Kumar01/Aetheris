import { useState, useEffect } from 'react'
import { BarChart2, Download, Eye, Search, FileText, FileCheck, ShieldAlert, Stethoscope, ClipboardList } from 'lucide-react'
import { reports } from '../data/mockData'
import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import { useAetheris } from '../context/AetherisContext'
import { generateReport } from '../api/client'

const TYPE_META = {
    'Operative Note': { icon: FileText, color: 'text-teal-400', bg: 'bg-teal-900/30', border: 'border-teal-800/30' },
    'Discharge Summary': { icon: FileCheck, color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-800/30' },
    'Risk Assessment': { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-800/30' },
    'Anaesthesia Record': { icon: Stethoscope, color: 'text-violet-400', bg: 'bg-violet-900/30', border: 'border-violet-800/30' },
    'Pre-Op Checklist': { icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-800/30' },
}

// Fallback logic for TYPE_META to match backend enum strings if needed
const getTypeMeta = (typeString) => {
    // try exact match first
    if (TYPE_META[typeString]) return TYPE_META[typeString]
    // try loosely matching
    const loose = typeString.toLowerCase()
    if (loose.includes('operative')) return TYPE_META['Operative Note']
    if (loose.includes('discharge')) return TYPE_META['Discharge Summary']
    if (loose.includes('risk')) return TYPE_META['Risk Assessment']
    if (loose.includes('anaesthesia')) return TYPE_META['Anaesthesia Record']
    if (loose.includes('checklist')) return TYPE_META['Pre-Op Checklist']
    return TYPE_META['Operative Note'] // default
}

function handleDownload(report) {
    if (!report) return;
    const filename = `${report.patientName.replace(/\s+/g, '_')}_${report.type.replace(/\s+/g, '_')}.txt`;
    const element = document.createElement("a");
    const file = new Blob([
        `Report Type: ${report.type}\n`,
        `Patient: ${report.patientName}\n`,
        `Date: ${report.generatedAt}\n\n`,
        `${report.content}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // required in some browsers
    element.click();
    document.body.removeChild(element);
}

function ReportCard({ report, onPreview, onDownload }) {
    const meta = getTypeMeta(report.type)
    const Icon = meta.icon

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center`}>
                    <Icon size={18} className={meta.color} />
                </div>
                <StatusBadge
                    status={report.status === 'Auto-Generated' ? 'active' : 'warning'}
                    label={report.status}
                />
            </div>

            <div>
                <p className="text-sm font-semibold text-white mb-0.5">{report.type}</p>
                <p className="text-xs text-gray-400">{report.patientName}</p>
                <p className="text-[10px] text-gray-600 mt-1">{report.generatedAt}</p>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1 whitespace-pre-line">
                {report.content}
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                <button
                    onClick={() => onPreview(report)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                    <Eye size={13} /> Preview
                </button>
                <span className="text-gray-700">·</span>
                <button
                    onClick={() => onDownload(report)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-teal-400 transition-colors"
                >
                    <Download size={13} /> Download
                </button>
            </div>
        </div>
    )
}

function ReportModal({ report, onClose, onDownload }) {
    if (!report) return null
    const meta = getTypeMeta(report.type)
    const Icon = meta.icon

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-fadeIn max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4 sticky top-0 bg-gray-900/90 backdrop-blur-sm pb-2 z-10">
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center`}>
                        <Icon size={18} className={meta.color} />
                    </div>
                    <div>
                        <p className="text-white font-semibold">{report.type}</p>
                        <p className="text-xs text-gray-400">{report.patientName} · {report.generatedAt}</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
                </div>
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono bg-gray-950/50 p-4 rounded-xl border border-gray-800/60 mt-2">
                    {report.content}
                </div>
                <div className="flex gap-2 mt-5">
                    <button
                        onClick={() => onDownload(report)}
                        className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors"
                    >
                        Download Text
                    </button>
                    <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:border-gray-600 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

function GenerateReportModal({ isOpen, onClose, patients, defaultPatient, onGenerate }) {
    const [patientId, setPatientId] = useState('')
    const [reportType, setReportType] = useState('operative_note')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    // Sync default patient when modal opens
    useEffect(() => {
        if (isOpen && defaultPatient) {
            setPatientId(defaultPatient.id)
        }
    }, [isOpen, defaultPatient])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const pat = patients.find(p => p.id === patientId)

        try {
            await onGenerate({
                patient_id: patientId,
                report_type: reportType,
                extra_notes: notes || undefined,
                patient_name: pat?.name,
                patient_age: pat?.age ? String(pat.age) : undefined,
                surgery_name: pat?.surgery_type,
            })
            setNotes('')
            onClose()
        } catch (error) {
            console.error(error)
            alert('Failed to generate report: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-bold text-lg">Generate Report</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">×</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Select Patient</label>
                        <select required value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm">
                            <option value="" disabled>Select a patient...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.surgery_type || 'Procedure TBD'})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Report Type</label>
                        <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm">
                            <option value="operative_note">Operative Note</option>
                            <option value="discharge_summary">Discharge Summary</option>
                            <option value="risk_assessment">Risk Assessment Report</option>
                            <option value="complication_report">Complication Risk Report</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Additional Clinical Notes (Optional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any specific observations or events to include in the generated AI report..." rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm resize-none" />
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-700 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium">Cancel</button>
                        <button type="submit" disabled={loading || !patientId} className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-colors text-sm font-bold shadow-lg shadow-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Generating...' : 'Generate Auto-Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function ReportsPage() {
    const { currentPatient, patients } = useAetheris()
    const [search, setSearch] = useState('')
    const [preview, setPreview] = useState(null)
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const [localReports, setLocalReports] = useState([]) // start empty so no unregistered dummy patients show

    const filtered = localReports.filter(r =>
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.type.toLowerCase().includes(search.toLowerCase())
    )

    const handleGenerate = async (reportData) => {
        const result = await generateReport(reportData)

        // Convert snake_case or specific types to display titles
        let displayType = result.title || result.report_type
        if (displayType === 'operative_note') displayType = 'Operative Note'
        if (displayType === 'discharge_summary') displayType = 'Discharge Summary'
        if (displayType === 'risk_assessment') displayType = 'Risk Assessment'
        if (displayType === 'complication_report') displayType = 'Complication Risk'

        const newReport = {
            id: result.id || Math.random().toString(36).substr(2, 9),
            type: displayType,
            patientName: reportData.patient_name || 'Unknown Patient',
            generatedAt: 'Just now', // Could be formatted from result.created_at
            status: 'Auto-Generated',
            content: result.content
        }

        setLocalReports(prev => [newReport, ...prev])
    }

    return (
        <div className="animate-fadeIn space-y-6">
            <SectionHeader
                title="Reports"
                subtitle="Auto-generated operative records and summaries"
                icon={BarChart2}
                actionLabel="Generate Report"
                onAction={() => setShowGenerateModal(true)}
            />

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Reports', value: localReports.length, color: 'text-teal-400' },
                    { label: 'Auto-Generated', value: localReports.filter(r => r.status === 'Auto-Generated').length, color: 'text-green-400' },
                    { label: 'Pending Review', value: localReports.filter(r => r.status === 'Pending Review' || r.status === 'Needs Review').length, color: 'text-amber-400' },
                    { label: "Today's Reports", value: localReports.length, color: 'text-blue-400' }, // mock all as today
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-900 rounded-2xl border border-gray-800 p-4 text-center">
                        <p className={`text-3xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by patient or report type…"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-600 transition-colors"
                />
            </div>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-4">
                {filtered.map(r => (
                    <ReportCard key={r.id} report={r} onPreview={setPreview} onDownload={handleDownload} />
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-3 text-center py-10 text-gray-500">
                        No reports found matching your search.
                    </div>
                )}
            </div>

            <ReportModal report={preview} onClose={() => setPreview(null)} onDownload={handleDownload} />

            <GenerateReportModal
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                patients={patients}
                defaultPatient={currentPatient}
                onGenerate={handleGenerate}
            />
        </div>
    )
}

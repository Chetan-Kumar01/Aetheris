import { useState } from 'react'
import {
    Heart, Activity, AlertTriangle, FileText,
    ClipboardList, BarChart2, Plus, Inbox,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import MetricCard from '../components/MetricCard'
import AlertCard from '../components/AlertCard'
import SectionHeader from '../components/SectionHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

/* helper: render a labelled section */
function ShowcaseSection({ title, children }) {
    return (
        <section className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-500 mb-4">
                {title}
            </p>
            {children}
        </section>
    )
}

export default function ComponentShowcase() {
    const [alerts, setAlerts] = useState([
        { id: 1, severity: 'high', title: 'Critical: SpO₂ drop', message: 'Patient SpO₂ fell to 89% in OR-2', time: '2 min ago' },
        { id: 2, severity: 'medium', title: 'Warning: Elevated BP', message: 'Robert Mills — BP 158/100 detected', time: '8 min ago' },
        { id: 3, severity: 'low', title: 'Info: Delayed recovery', message: 'Sarah Lin vitals stabilising', time: '15 min ago' },
    ])

    return (
        <div className="max-w-5xl mx-auto">

            {/* ── 1. StatusBadge ─────────────────────────── */}
            <ShowcaseSection title="1 · StatusBadge">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                    <p className="text-xs text-gray-500 mb-4">All four variants</p>
                    <div className="flex flex-wrap gap-3">
                        <StatusBadge status="active" label="Active" />
                        <StatusBadge status="warning" label="Warning" />
                        <StatusBadge status="critical" label="Critical" />
                        <StatusBadge status="inactive" label="Inactive" />
                    </div>
                    <p className="text-xs text-gray-500 mt-4 mb-2">With custom labels</p>
                    <div className="flex flex-wrap gap-3">
                        <StatusBadge status="active" label="In Surgery" />
                        <StatusBadge status="warning" label="Requires Attention" />
                        <StatusBadge status="critical" label="Code Blue" />
                        <StatusBadge status="inactive" label="Discharged" />
                    </div>
                </div>
            </ShowcaseSection>

            {/* ── 2. MetricCard ──────────────────────────── */}
            <ShowcaseSection title="2 · MetricCard">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <MetricCard title="Heart Rate" icon={Heart} value="78" unit="bpm" trend="up" trendValue="+4.2%" color="red" />
                    <MetricCard title="SpO₂" icon={Activity} value="98" unit="%" trend="down" trendValue="-0.5%" color="blue" />
                    <MetricCard title="Active Cases" icon={ClipboardList} value="12" unit="" trend="up" trendValue="+2" color="teal" />
                    <MetricCard title="Reports" icon={FileText} value="24" unit="" trend={null} color="amber" />
                </div>
            </ShowcaseSection>

            {/* ── 3. AlertCard ───────────────────────────── */}
            <ShowcaseSection title="3 · AlertCard">
                <div className="space-y-3">
                    {alerts.map(a => (
                        <AlertCard
                            key={a.id}
                            severity={a.severity}
                            title={a.title}
                            message={a.message}
                            time={a.time}
                            onDismiss={() => setAlerts(prev => prev.filter(x => x.id !== a.id))}
                        />
                    ))}
                    {alerts.length === 0 && (
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 text-center text-sm text-gray-500">
                            All alerts dismissed ✓
                        </div>
                    )}
                </div>
            </ShowcaseSection>

            {/* ── 4. SectionHeader ───────────────────────── */}
            <ShowcaseSection title="4 · SectionHeader">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-6">
                    {/* With icon + action */}
                    <div className="border-b border-gray-800 pb-6">
                        <SectionHeader
                            title="Active Surgeries"
                            subtitle="Real-time OR status"
                            icon={BarChart2}
                            actionLabel="+ Schedule"
                            onAction={() => alert('Action triggered!')}
                        />
                        <p className="text-xs text-gray-600">↑ With icon, subtitle and action button</p>
                    </div>
                    {/* Title only */}
                    <div>
                        <SectionHeader title="Reports Overview" />
                        <p className="text-xs text-gray-600">↑ Title only (no icon, no action)</p>
                    </div>
                </div>
            </ShowcaseSection>

            {/* ── 5. LoadingSpinner ──────────────────────── */}
            <ShowcaseSection title="5 · LoadingSpinner">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                    <div className="flex items-center gap-10 flex-wrap">
                        <div className="flex flex-col items-center gap-3">
                            <LoadingSpinner size="sm" color="teal" />
                            <span className="text-xs text-gray-500">sm / teal</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <LoadingSpinner size="md" color="teal" />
                            <span className="text-xs text-gray-500">md / teal</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <LoadingSpinner size="lg" color="teal" />
                            <span className="text-xs text-gray-500">lg / teal</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 px-6 py-4 bg-teal-700/30 rounded-xl">
                            <LoadingSpinner size="md" color="white" />
                            <span className="text-xs text-gray-400">md / white</span>
                        </div>
                    </div>
                </div>
            </ShowcaseSection>

            {/* ── 6. EmptyState ──────────────────────────── */}
            <ShowcaseSection title="6 · EmptyState">
                <div className="grid grid-cols-2 gap-4">
                    {/* With action */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800">
                        <EmptyState
                            icon={Inbox}
                            title="No reports yet"
                            description="Reports will appear here once surgeries are completed and processed."
                            actionLabel="Generate Report"
                            onAction={() => alert('Generating...')}
                        />
                    </div>
                    {/* Without action */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800">
                        <EmptyState
                            icon={AlertTriangle}
                            title="No alerts"
                            description="The system is running normally. Alerts will appear here if any anomalies are detected."
                        />
                    </div>
                </div>
            </ShowcaseSection>

        </div>
    )
}

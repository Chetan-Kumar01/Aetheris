/**
 * SectionHeader
 * Props:
 *   title       string
 *   subtitle    string | undefined
 *   icon        lucide-react component | undefined
 *   actionLabel string | undefined
 *   onAction    function | undefined
 */
export default function SectionHeader({
    title = '',
    subtitle = '',
    icon: Icon,
    actionLabel = '',
    onAction,
}) {
    return (
        <div className="flex justify-between items-center mb-6">
            {/* Left: icon + title + subtitle */}
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="w-9 h-9 rounded-xl bg-teal-600/20 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-teal-400" />
                    </div>
                )}
                <div>
                    <h2 className="text-xl font-bold text-white leading-tight">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Right: action button */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors shadow-lg shadow-teal-900/30"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    )
}

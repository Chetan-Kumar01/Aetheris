/**
 * EmptyState
 * Props:
 *   icon        lucide-react component | undefined
 *   title       string
 *   description string | undefined
 *   actionLabel string | undefined
 *   onAction    function | undefined
 */
export default function EmptyState({
    icon: Icon,
    title = 'Nothing here yet',
    description = '',
    actionLabel = '',
    onAction,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {/* Icon circle */}
            {Icon && (
                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-5">
                    <Icon size={28} className="text-gray-500" />
                </div>
            )}

            {/* Title */}
            <p className="text-base font-semibold text-gray-400 mb-2">{title}</p>

            {/* Description */}
            {description && (
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{description}</p>
            )}

            {/* CTA */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-6 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors shadow-lg shadow-teal-900/30"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    )
}

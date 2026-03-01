import { AlertCircle, RefreshCw, X } from 'lucide-react'

/**
 * ApiErrorBanner
 * Displays a styled red banner for backend connection errors.
 *
 * Props:
 *   error     – string error message
 *   onRetry   – function called when Retry is clicked
 *   onDismiss – function called when X is clicked
 */
export default function ApiErrorBanner({ error, onRetry, onDismiss }) {
    if (!error) return null

    return (
        <div className="bg-red-950 border border-red-700 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
            {/* Icon */}
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-900/60 border border-red-800/50
        flex items-center justify-center mt-0.5">
                <AlertCircle size={18} className="text-red-400" />
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
                <p className="text-red-400 font-semibold text-sm mb-1">Backend Connection Error</p>
                <p className="text-red-300 text-xs leading-relaxed mb-2 break-words">{error}</p>
                <p className="text-red-500/70 text-[10px] font-mono leading-tight">
                    Make sure: <span className="text-red-400">uvicorn app.main:app --reload --port 8000</span> is running
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 flex-shrink-0">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
              bg-red-700 hover:bg-red-600 text-white transition-all active:scale-[0.97]"
                    >
                        <RefreshCw size={11} />
                        Retry
                    </button>
                )}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="flex items-center justify-center w-full py-1.5 rounded-lg
              text-red-400 hover:text-red-200 hover:bg-red-900/50 transition-colors"
                        title="Dismiss"
                    >
                        <X size={13} />
                    </button>
                )}
            </div>
        </div>
    )
}

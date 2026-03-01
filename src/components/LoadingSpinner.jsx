/**
 * LoadingSpinner
 * Props:
 *   size   "sm" | "md" | "lg"   (default: "md")
 *   color  "teal" | "white"     (default: "teal")
 */

const SIZE_MAP = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
}

const COLOR_MAP = {
    teal: 'border-teal-500 border-t-transparent',
    white: 'border-white border-t-transparent',
}

export default function LoadingSpinner({ size = 'md', color = 'teal' }) {
    const sizeClass = SIZE_MAP[size] ?? SIZE_MAP.md
    const colorClass = COLOR_MAP[color] ?? COLOR_MAP.teal

    return (
        <span
            role="status"
            aria-label="Loading"
            className={`inline-block animate-spin rounded-full ${sizeClass} ${colorClass}`}
        />
    )
}

export default function CartIcon({
    size = 26,
    color = 'currentColor',
    strokeWidth = 1.5,
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path d="M9 4 Q12 1.5 15 4" />
            <rect x="4" y="4" width="16" height="17" rx="4" />
            <line x1="4" y1="9" x2="20" y2="9" />
            <rect x="10" y="6.5" width="4" height="2.5" rx="0.8" />
        </svg>
    );
}
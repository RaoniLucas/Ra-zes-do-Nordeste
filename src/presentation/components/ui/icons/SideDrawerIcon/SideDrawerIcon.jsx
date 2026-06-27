import { motion } from 'motion/react';

export default function SideDrawerIcon({ isOpen, onToggle }) {
    return (
        <button onClick={onToggle} className="menu-toggle">
            <svg width="28" height="28" viewBox="0 0 24 24">
                <motion.line
                    x1="4"
                    y1="6"
                    x2="20"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
                    transition={{ duration: 0.3 }}
                />
                <motion.line
                    x1="4"
                    y1="18"
                    x2={isOpen ? '20' : '15'}
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
                    transition={{ duration: 0.3 }}
                />
            </svg>
        </button>
    );
}
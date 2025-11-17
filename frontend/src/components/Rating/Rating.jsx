import React, { useState } from 'react';
import { Star } from 'lucide-react';

// Simple, accessible star rating component
// Props:
// - value: number (0-5) current value (controlled)
// - onChange: function(newValue) called when user selects a rating
// - size: 'sm' | 'md' | 'lg' (default 'md')
// - readOnly: boolean (default false)
// - className: optional wrapper classes
export default function Rating({ value = 0, onChange = () => { }, size = 'md', readOnly = false, className = '' }) {
    const [hover, setHover] = useState(0);

    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-7 h-7',
        lg: 'w-9 h-9'
    };

    const starSizeClass = sizes[size] || sizes.md;

    const handleMouseEnter = (i) => setHover(i);
    const handleMouseLeave = () => setHover(0);
    const handleClick = (i) => {
        if (readOnly) return;
        onChange(i);
    };

    return (
        <div className={`inline-flex items-center gap-1 ${className}`} role="group" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((i) => {
                const filled = hover ? i <= hover : i <= value;
                return (
                    <button
                        key={i}
                        type="button"
                        onMouseEnter={() => handleMouseEnter(i)}
                        onMouseLeave={handleMouseLeave}
                        onFocus={() => handleMouseEnter(i)}
                        onBlur={handleMouseLeave}
                        onClick={() => handleClick(i)}
                        aria-label={`${i} star${i > 1 ? 's' : ''}`}
                        className="focus:outline-none"
                        disabled={readOnly}
                    >
                        <Star
                            className={`${starSizeClass} transition-all duration-150 ${filled ? 'fill-yellow-400 text-yellow-400 scale-110' : 'text-gray-300'}`}
                        />
                    </button>
                );
            })}
        </div>
    );
}

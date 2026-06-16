function Logo() {
  return (
    <svg viewBox="0 0 160 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#5b21b6"/>
        </linearGradient>
      </defs>

      <circle cx="18" cy="22" r="16" stroke="url(#ringGrad)" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <circle cx="18" cy="22" r="14" fill="#f5f3ff" opacity="0.6"/>

      <rect x="11" y="16" width="3" height="6" rx="1.5" fill="url(#barGrad)"/>
      <rect x="16" y="12" width="3" height="14" rx="1.5" fill="url(#barGrad)"/>
      <rect x="21" y="8" width="3" height="22" rx="1.5" fill="url(#barGrad)"/>

      <circle cx="14" cy="30" r="1" fill="#7c3aed" opacity="0.3"/>
      <circle cx="28" cy="34" r="1" fill="#a78bfa" opacity="0.2"/>

      <text x="42" y="31" fontFamily="'Ma Shan Zheng', cursive, sans-serif" fontWeight="400" fontSize="28" fill="#5b21b6" letterSpacing="2">
        方休
      </text>
    </svg>
  )
}

export default Logo

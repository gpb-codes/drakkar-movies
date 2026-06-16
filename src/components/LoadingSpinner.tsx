export default function LoadingSpinner() {
  return (
    <div className="ld">
      <div className="ld__wrap">
        <div className="ld__ring ld__ring--1" />
        <div className="ld__ring ld__ring--2" />
        <div className="ld__core">
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="ldg" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#c084fc"/>
                <stop offset="100%" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
            <rect width="36" height="36" rx="10" fill="url(#ldg)" opacity="0.15"/>
            <path d="M11 9L18 18L11 27" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <style>{`
        .ld {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 55vh;
          width: 100%;
        }
        .ld__wrap {
          position: relative;
          width: 56px;
          height: 56px;
        }
        .ld__ring {
          position: absolute;
          inset: 0;
          border: 1.5px solid transparent;
          border-radius: 50%;
        }
        .ld__ring--1 {
          border-top-color: var(--accent-purple);
          animation: ldSpin 1s linear infinite;
        }
        .ld__ring--2 {
          inset: 6px;
          border-top-color: var(--accent-gold);
          animation: ldSpin 1.4s linear infinite reverse;
        }
        .ld__core {
          position: absolute;
          inset: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ldPulse 1.2s ease-in-out infinite;
        }
        @keyframes ldSpin { to { transform: rotate(360deg); } }
        @keyframes ldPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}

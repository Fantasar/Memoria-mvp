export default function TestBanner() {
  return (
    <div
      className="fixed top-0 left-0 w-full bg-amber-50 border-b border-amber-200 py-1 overflow-hidden z-50"
      style={{ height: '28px' }}
    >
      <div
        className="whitespace-nowrap text-xs text-amber-700 font-medium tracking-wide"
        style={{
          display: 'inline-block',
          animation: 'scroll 40s linear infinite',
        }}
      >
        ⚠️ Site de démonstration — Les données et paiements sont fictifs &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
        ⚠️ Site de démonstration — Les données et paiements sont fictifs &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
        ⚠️ Site de démonstration — Les données et paiements sont fictifs &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
        ⚠️ Site de démonstration — Les données et paiements sont fictifs &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
        ⚠️ Site de démonstration — Les données et paiements sont fictifs &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
        ⚠️ Site de démonstration — Les données et paiements sont fictifs &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
      </div>
      <style>{`
        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
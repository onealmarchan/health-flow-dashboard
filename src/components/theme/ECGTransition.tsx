import { useEffect, useState } from 'react';

/**
 * Full-screen ECG line sweep overlay. Renders once when `trigger` changes
 * and auto-unmounts after ~900ms.
 */
export function ECGTransition({ trigger }: { trigger: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 1600 200"
        preserveAspectRatio="none"
        className="w-full h-40 opacity-90"
      >
        {/* Baseline */}
        <line x1="0" y1="100" x2="1600" y2="100" stroke="hsl(var(--primary) / 0.15)" strokeWidth="1" />
        {/* ECG polyline */}
        <path
          d="M0,100 L200,100 L260,100 L275,80 L290,120 L310,40 L330,160 L350,100 L500,100 L560,100 L575,80 L590,120 L610,40 L630,160 L650,100 L800,100 L860,100 L875,80 L890,120 L910,40 L930,160 L950,100 L1100,100 L1160,100 L1175,80 L1190,120 L1210,40 L1230,160 L1250,100 L1600,100"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ecg-sweep"
        />
      </svg>
    </div>
  );
}

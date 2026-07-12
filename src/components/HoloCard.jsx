import React from 'react';

// Holographic tilt card — follows the cursor with a 3D tilt + a moving glare sweep.
// Pure CSS transforms; disables itself when the viewer prefers reduced motion.
export default function HoloCard({ color = '#7dd3fc', className = '', style = {}, glare = true, max = 12, children }) {
  const ref = React.useRef(null);
  const [t, setT] = React.useState({ rx: 0, ry: 0, gx: 50, gy: 50, on: false });
  const reduce = React.useRef(
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const onMove = (e) => {
    if (reduce.current || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;   // 0..1
    const py = (e.clientY - r.top) / r.height;   // 0..1
    setT({ rx: (0.5 - py) * max, ry: (px - 0.5) * max, gx: px * 100, gy: py * 100, on: true });
  };
  const onLeave = () => setT({ rx: 0, ry: 0, gx: 50, gy: 50, on: false });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={'relative rounded-2xl ' + className}
      style={{
        ...style,
        transform: `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
        transformStyle: 'preserve-3d',
        transition: t.on ? 'transform 60ms linear' : 'transform 500ms cubic-bezier(0.22,1,0.36,1)',
        boxShadow: t.on ? `0 30px 70px -30px ${color}88` : `0 14px 40px -24px ${color}66`
      }}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden"
          style={{ opacity: t.on ? 1 : 0, transition: 'opacity 300ms ease' }}
        >
          {/* moving specular glare */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(650px circle at ${t.gx}% ${t.gy}%, ${color}40, transparent 42%)`,
              mixBlendMode: 'screen'
            }}
          />
          {/* holographic sheen band */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(${105 + t.ry * 2}deg, transparent 38%, ${color}22 47%, #ffffff33 50%, ${color}22 53%, transparent 62%)`,
              mixBlendMode: 'screen'
            }}
          />
        </div>
      )}
    </div>
  );
}

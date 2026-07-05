import React from 'react';

/**
 * 3D Showroom.
 * If character.model_url points to a .glb/.gltf, renders it via <model-viewer>
 * (loaded lazily from CDN). Otherwise shows the CSS hologram fallback.
 */
export default function Showroom3D({ modelUrl, fallbackImage }) {
  const hasModel = modelUrl && /\.(glb|gltf)(\?|$)/i.test(modelUrl);

  React.useEffect(() => {
    if (hasModel && !customElements.get('model-viewer')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
      document.head.appendChild(s);
    }
  }, [hasModel]);

  return (
    <div className="relative h-[560px] rounded-2xl border border-ice/25 overflow-hidden bg-[#060818]">
      <div className="absolute top-4 left-5 font-mono text-[9px] tracking-[0.3em] text-ice/75">
        HOLO-BAY 04 · {hasModel ? 'GLB MODEL LOADED' : 'HOLOGRAM FALLBACK'}
      </div>
      {hasModel ? (
        <model-viewer src={modelUrl} camera-controls auto-rotate shadow-intensity="0.6"
          style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
          <div className="relative w-64 h-96 rounded-xl overflow-hidden animate-[spin3d_14s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }}>
            {fallbackImage && (
              <img src={fallbackImage} alt="hologram"
                className="w-full h-full object-cover mix-blend-screen"
                style={{ filter: 'sepia(1) hue-rotate(165deg) saturate(3) brightness(0.95)' }} />
            )}
          </div>
          <style>{'@keyframes spin3d { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }'}</style>
        </div>
      )}
      <div className="absolute bottom-4 inset-x-0 text-center font-mono text-[9px] tracking-[0.4em] text-chrome/45">
        DRAG TO ROTATE
      </div>
    </div>
  );
}
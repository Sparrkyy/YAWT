function muscleColor(value, maxValue) {
  const t = Math.min(value / maxValue, 1);
  const alpha = 0.15 + t * 0.85;
  return `rgba(10, 132, 255, ${alpha.toFixed(2)})`;
}

function neutral() {
  return 'rgba(120,120,128,0.25)';
}

function BodySilhouette() {
  const n = neutral();
  const s = "var(--border)";
  return (
    <>
      {/* Head */}
      <ellipse cx="100" cy="30" rx="19" ry="22" fill={n} stroke={s} strokeWidth="1" />
      {/* Neck */}
      <rect x="93" y="50" width="14" height="16" rx="3" fill={n} stroke={s} strokeWidth="1" />

      {/* Upper torso (chest/shoulder region) */}
      <path d="M68,66 Q100,62 132,66 L130,108 Q114,118 100,120 Q86,118 70,108 Z"
        fill={n} stroke={s} strokeWidth="1" />
      {/* Mid torso (abs/waist) */}
      <path d="M70,108 L72,152 Q84,164 100,166 Q116,164 128,152 L130,108 Z"
        fill={n} stroke={s} strokeWidth="1" />
      {/* Lower torso (hips/pelvis) */}
      <path d="M72,152 Q84,164 100,166 Q116,164 128,152 L128,200 Q114,208 100,208 Q86,208 72,200 Z"
        fill={n} stroke={s} strokeWidth="1" />

      {/* Left upper arm */}
      <path d="M52,72 Q44,80 43,102 Q42,128 46,152 Q48,162 54,164 L60,132 L64,76 Z"
        fill={n} stroke={s} strokeWidth="1" />
      {/* Left lower arm */}
      <path d="M50,164 Q44,172 44,196 Q44,218 47,236 Q50,244 55,244 Q60,244 62,238 L62,168 Z"
        fill={n} stroke={s} strokeWidth="1" />
      {/* Right upper arm (mirrored) */}
      <path d="M148,72 Q156,80 157,102 Q158,128 154,152 Q152,162 146,164 L140,132 L136,76 Z"
        fill={n} stroke={s} strokeWidth="1" />
      {/* Right lower arm (mirrored) */}
      <path d="M150,164 Q156,172 156,196 Q156,218 153,236 Q150,244 145,244 Q140,244 138,238 L138,168 Z"
        fill={n} stroke={s} strokeWidth="1" />

      {/* Left upper leg */}
      <path d="M72,200 Q68,208 68,236 Q68,262 72,278 L92,278 L94,208 Q88,200 72,200 Z"
        fill={n} stroke={s} strokeWidth="1" />
      {/* Left lower leg */}
      <path d="M72,280 Q68,292 68,316 Q68,340 72,354 Q76,364 83,366 Q90,366 92,358 L92,282 Z"
        fill={n} stroke={s} strokeWidth="1" />
      {/* Right upper leg (mirrored) */}
      <path d="M128,200 Q132,208 132,236 Q132,262 128,278 L108,278 L106,208 Q112,200 128,200 Z"
        fill={n} stroke={s} strokeWidth="1" />
      {/* Right lower leg (mirrored) */}
      <path d="M128,280 Q132,292 132,316 Q132,340 128,354 Q124,364 117,366 Q110,366 108,358 L108,282 Z"
        fill={n} stroke={s} strokeWidth="1" />
    </>
  );
}

function FrontBody({ eff, max }) {
  const c = (m) => muscleColor(eff[m] ?? 0, max);
  const lbl = (x1, y1, label, value) => (
    <>
      <line x1={x1} y1={y1} x2="152" y2={y1} stroke="var(--border)" strokeWidth="0.75" />
      <text x="154" y={y1 + 3} fontSize="8" fill="var(--text-secondary)">{label} {parseFloat(value.toFixed(2))}</text>
    </>
  );

  return (
    <>
      <BodySilhouette />

      {/* Shoulders — rounded deltoid caps */}
      <path d="M64,68 Q54,66 50,74 Q46,84 50,96 Q54,104 62,102 Q70,98 72,90 Q72,80 68,70 Z"
        fill={c('shoulders')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M136,68 Q146,66 150,74 Q154,84 150,96 Q146,104 138,102 Q130,98 128,90 Q128,80 132,70 Z"
        fill={c('shoulders')} stroke="var(--border)" strokeWidth="0.75" />

      {/* Chest — two pec fan shapes */}
      <path d="M100,70 Q88,68 80,72 Q72,80 72,92 Q72,104 78,110 Q88,116 100,112 Z"
        fill={c('chest')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M100,70 Q112,68 120,72 Q128,80 128,92 Q128,104 122,110 Q112,116 100,112 Z"
        fill={c('chest')} stroke="var(--border)" strokeWidth="0.75" />
      {/* Sternum groove */}
      <line x1="100" y1="70" x2="100" y2="112" stroke="var(--border)" strokeWidth="0.75" opacity="0.5" />
      {/* Lower pec crease */}
      <path d="M78,110 Q89,116 100,114 Q111,116 122,110" fill="none" stroke="var(--border)" strokeWidth="0.75" opacity="0.5" />

      {/* Biceps — elongated teardrop */}
      <path d="M54,88 Q50,96 50,110 Q50,126 54,136 Q58,142 63,140 Q68,136 68,120 Q68,104 64,90 Z"
        fill={c('biceps')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M146,88 Q150,96 150,110 Q150,126 146,136 Q142,142 137,140 Q132,136 132,120 Q132,104 136,90 Z"
        fill={c('biceps')} stroke="var(--border)" strokeWidth="0.75" />

      {/* Triceps (front) — lateral head sliver */}
      <path d="M68,88 Q72,94 72,112 Q70,126 66,138 Q70,130 72,118 Q74,106 70,90 Z"
        fill={c('triceps')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M132,88 Q128,94 128,112 Q130,126 134,138 Q130,130 128,118 Q126,106 130,90 Z"
        fill={c('triceps')} stroke="var(--border)" strokeWidth="0.75" />

      {/* Abs — shaped region */}
      <path d="M86,112 Q84,116 84,124 L84,162 Q88,166 100,168 Q112,166 116,162 L116,124 Q116,116 114,112 Z"
        fill={c('abs')} stroke="var(--border)" strokeWidth="0.75" />
      {/* Linea alba */}
      <line x1="100" y1="112" x2="100" y2="168" stroke="var(--border)" strokeWidth="0.75" opacity="0.5" />
      {/* Ab row intersections */}
      <line x1="85" y1="125" x2="115" y2="125" stroke="var(--border)" strokeWidth="0.75" opacity="0.5" />
      <line x1="85" y1="140" x2="115" y2="140" stroke="var(--border)" strokeWidth="0.75" opacity="0.5" />
      <line x1="85" y1="155" x2="115" y2="155" stroke="var(--border)" strokeWidth="0.75" opacity="0.5" />

      {/* Quads — tapered thigh + vastus medialis teardrop */}
      <path d="M72,206 Q68,214 68,238 Q68,258 72,270 Q76,278 84,280 Q92,278 94,270 Q96,256 96,234 Q96,212 93,206 Z"
        fill={c('quads')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M82,258 Q78,264 78,274 Q80,282 86,282 Q90,278 90,270 Q90,262 86,256 Z"
        fill={c('quads')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M128,206 Q132,214 132,238 Q132,258 128,270 Q124,278 116,280 Q108,278 106,270 Q104,256 104,234 Q104,212 107,206 Z"
        fill={c('quads')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M118,258 Q122,264 122,274 Q120,282 114,282 Q110,278 110,270 Q110,262 114,256 Z"
        fill={c('quads')} stroke="var(--border)" strokeWidth="0.75" />

      {/* Calves — diamond/heart shape */}
      <path d="M76,286 Q72,294 72,308 Q72,324 76,336 Q80,344 86,344 Q90,342 92,332 Q94,318 92,302 Q90,288 84,282 Z"
        fill={c('calves')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M124,286 Q128,294 128,308 Q128,324 124,336 Q120,344 114,344 Q110,342 108,332 Q106,318 108,302 Q110,288 116,282 Z"
        fill={c('calves')} stroke="var(--border)" strokeWidth="0.75" />

      {/* Labels */}
      {lbl(50,  84,  'Shoulders', eff.shoulders ?? 0)}
      {lbl(120, 90,  'Chest',     eff.chest ?? 0)}
      {lbl(50,  112, 'Biceps',    eff.biceps ?? 0)}
      {lbl(70,  100, 'Triceps',   eff.triceps ?? 0)}
      {lbl(116, 140, 'Abs',       eff.abs ?? 0)}
      {lbl(130, 244, 'Quads',     eff.quads ?? 0)}
      {lbl(126, 312, 'Calves',    eff.calves ?? 0)}
    </>
  );
}

function BackBody({ eff, max }) {
  const c = (m) => muscleColor(eff[m] ?? 0, max);
  const lbl = (x1, y1, label, value) => (
    <>
      <line x1={x1} y1={y1} x2="152" y2={y1} stroke="var(--border)" strokeWidth="0.75" />
      <text x="154" y={y1 + 3} fontSize="8" fill="var(--text-secondary)">{label} {parseFloat(value.toFixed(2))}</text>
    </>
  );

  return (
    <>
      <BodySilhouette />

      {/* Rear Delts — slightly larger/rounder cap */}
      <path d="M64,68 Q54,62 48,70 Q44,82 50,96 Q56,104 64,100 Q72,96 72,86 Q72,76 66,68 Z"
        fill={c('rearDelts')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M136,68 Q146,62 152,70 Q156,82 150,96 Q144,104 136,100 Q128,96 128,86 Q128,76 134,68 Z"
        fill={c('rearDelts')} stroke="var(--border)" strokeWidth="0.75" />

      {/* Back — lats (V-taper) */}
      <path d="M100,70 Q92,68 82,72 Q72,78 70,92 Q68,106 72,118 Q78,128 88,130 Q96,130 100,126 Z"
        fill={c('back')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M100,70 Q108,68 118,72 Q128,78 130,92 Q132,106 128,118 Q122,128 112,130 Q104,130 100,126 Z"
        fill={c('back')} stroke="var(--border)" strokeWidth="0.75" />
      {/* Upper trap diamond */}
      <path d="M88,66 Q100,62 112,66 L110,80 Q100,84 90,80 Z"
        fill={c('back')} stroke="var(--border)" strokeWidth="0.75" />
      {/* Spine line */}
      <line x1="100" y1="66" x2="100" y2="160" stroke="var(--border)" strokeWidth="0.75" opacity="0.5" />

      {/* Triceps (back) — full horseshoe shape */}
      <path d="M50,84 Q46,92 46,110 Q46,126 50,136 Q54,142 61,142 Q67,140 70,132 Q72,120 70,106 Q68,90 62,84 Z"
        fill={c('triceps')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M150,84 Q154,92 154,110 Q154,126 150,136 Q146,142 139,142 Q133,140 130,132 Q128,120 130,106 Q132,90 138,84 Z"
        fill={c('triceps')} stroke="var(--border)" strokeWidth="0.75" />

      {/* Low Back — erector spinae pillars */}
      <path d="M92,132 Q88,136 88,144 L88,162 Q90,166 94,166 Q98,164 98,160 L98,142 Q98,136 94,132 Z"
        fill={c('lowBack')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M108,132 Q112,136 112,144 L112,162 Q110,166 106,166 Q102,164 102,160 L102,142 Q102,136 106,132 Z"
        fill={c('lowBack')} stroke="var(--border)" strokeWidth="0.75" />

      {/* Glutes — large rounded mounds */}
      <path d="M70,164 Q66,170 66,182 Q66,196 72,204 Q78,210 86,210 Q94,210 98,204 Q100,198 100,188 Q100,174 96,166 Q90,160 80,162 Z"
        fill={c('glutes')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M130,164 Q134,170 134,182 Q134,196 128,204 Q122,210 114,210 Q106,210 102,204 Q100,198 100,188 Q100,174 104,166 Q110,160 120,162 Z"
        fill={c('glutes')} stroke="var(--border)" strokeWidth="0.75" />
      {/* Glute fold arc */}
      <path d="M70,204 Q84,210 100,210 Q116,210 130,204" fill="none" stroke="var(--border)" strokeWidth="0.75" opacity="0.5" />

      {/* Hamstrings — long posterior thigh */}
      <path d="M70,210 Q66,218 66,238 Q66,258 70,270 Q74,280 82,282 Q90,280 94,272 Q96,260 96,240 Q96,220 92,210 Z"
        fill={c('hamstrings')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M130,210 Q134,218 134,238 Q134,258 130,270 Q126,280 118,282 Q110,280 106,272 Q104,260 104,240 Q104,220 108,210 Z"
        fill={c('hamstrings')} stroke="var(--border)" strokeWidth="0.75" />

      {/* Calves (back) — same diamond shape */}
      <path d="M76,286 Q72,294 72,308 Q72,324 76,336 Q80,344 86,344 Q90,342 92,332 Q94,318 92,302 Q90,288 84,282 Z"
        fill={c('calves')} stroke="var(--border)" strokeWidth="0.75" />
      <path d="M124,286 Q128,294 128,308 Q128,324 124,336 Q120,344 114,344 Q110,342 108,332 Q106,318 108,302 Q110,288 116,282 Z"
        fill={c('calves')} stroke="var(--border)" strokeWidth="0.75" />
      {/* Medial/lateral calf split lines */}
      <line x1="84" y1="286" x2="84" y2="326" stroke="var(--border)" strokeWidth="0.75" opacity="0.4" />
      <line x1="116" y1="286" x2="116" y2="326" stroke="var(--border)" strokeWidth="0.75" opacity="0.4" />

      {/* Labels */}
      {lbl(50,  84,  'Rear Delts',  eff.rearDelts ?? 0)}
      {lbl(130, 100, 'Back',        eff.back ?? 0)}
      {lbl(70,  112, 'Triceps',     eff.triceps ?? 0)}
      {lbl(112, 148, 'Low Back',    eff.lowBack ?? 0)}
      {lbl(130, 186, 'Glutes',      eff.glutes ?? 0)}
      {lbl(130, 248, 'Hamstrings',  eff.hamstrings ?? 0)}
      {lbl(126, 312, 'Calves',      eff.calves ?? 0)}
    </>
  );
}

export default function BodyDiagram({ effectiveSets, side, onSideChange }) {
  const max = Math.max(...Object.values(effectiveSets), 4);
  const eff = effectiveSets;

  return (
    <div className="body-diagram">
      <div className="side-toggle">
        <button
          className={`side-btn ${side === 'front' ? 'active' : ''}`}
          onClick={() => onSideChange('front')}
        >
          Front
        </button>
        <button
          className={`side-btn ${side === 'back' ? 'active' : ''}`}
          onClick={() => onSideChange('back')}
        >
          Back
        </button>
      </div>

      <svg className="body-svg" viewBox="0 0 250 420" xmlns="http://www.w3.org/2000/svg">
        {side === 'front' ? <FrontBody eff={eff} max={max} /> : <BackBody eff={eff} max={max} />}
      </svg>
    </div>
  );
}

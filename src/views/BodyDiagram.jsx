function muscleColor(value, maxValue) {
  const t = Math.min(value / maxValue, 1);
  const alpha = 0.15 + t * 0.85;
  return `rgba(10, 132, 255, ${alpha.toFixed(2)})`;
}

function neutral() {
  return 'rgba(120,120,128,0.12)';
}

function BodySilhouette() {
  const n = neutral();
  return (
    <>
      {/* Head */}
      <ellipse cx="100" cy="22" rx="14" ry="17" fill={n} />

      {/* Torso with neck — athletic V-taper */}
      <path d={`
        M92,38 Q90,46 82,50 Q66,56 58,62
        Q54,70 54,80 Q56,96 60,110
        Q64,124 68,134 Q74,142 76,150
        Q76,160 74,170 Q72,180 74,192
        Q84,204 100,206
        Q116,204 126,192
        Q128,180 126,170 Q124,160 124,150
        Q126,142 132,134 Q136,124 140,110
        Q144,96 146,80 Q146,70 142,62
        Q134,56 118,50 Q110,46 108,38 Z
      `} fill={n} />

      {/* Left arm — angled slightly outward, shorter forearm */}
      <path d={`
        M56,62 Q48,58 42,64
        Q36,74 32,90 Q28,108 28,126
        Q28,140 32,148
        Q30,158 28,172 Q26,188 28,200
        Q30,210 34,216 Q38,220 42,218
        Q46,216 48,208 Q50,196 50,184
        Q50,170 48,160 Q46,152 48,148
        Q52,136 54,120 Q56,104 58,88
        Q60,74 58,64 Z
      `} fill={n} />
      {/* Right arm — mirrored, shorter forearm */}
      <path d={`
        M144,62 Q152,58 158,64
        Q164,74 168,90 Q172,108 172,126
        Q172,140 168,148
        Q170,158 172,172 Q174,188 172,200
        Q170,210 166,216 Q162,220 158,218
        Q154,216 152,208 Q150,196 150,184
        Q150,170 152,160 Q154,152 152,148
        Q148,136 146,120 Q144,104 142,88
        Q140,74 142,64 Z
      `} fill={n} />

      {/* Left leg */}
      <path d={`
        M76,194 Q70,202 66,218
        Q62,240 62,260 Q62,276 66,288
        Q64,300 62,318 Q60,340 64,358
        Q68,372 76,376 Q84,376 88,366
        Q92,350 92,332 Q92,312 90,296
        Q88,286 88,278 Q90,264 90,246
        Q90,228 86,212 Q82,200 76,194 Z
      `} fill={n} />
      {/* Right leg */}
      <path d={`
        M124,194 Q130,202 134,218
        Q138,240 138,260 Q138,276 134,288
        Q136,300 138,318 Q140,340 136,358
        Q132,372 124,376 Q116,376 112,366
        Q108,350 108,332 Q108,312 110,296
        Q112,286 112,278 Q110,264 110,246
        Q110,228 114,212 Q118,200 124,194 Z
      `} fill={n} />
    </>
  );
}

function FrontBody({ eff, max }) {
  const c = (m) => muscleColor(eff[m] ?? 0, max);
  const s = "var(--border)";
  const sw = "0.75";
  const lbl = (x1, y1, label, value) => (
    <>
      <line x1={x1} y1={y1} x2="168" y2={y1} stroke={s} strokeWidth="0.5" strokeOpacity="0.5" />
      <text x="170" y={y1 + 3} fontSize="7.5" fill="var(--text-secondary)">{label} {parseFloat(value.toFixed(2))}</text>
    </>
  );

  return (
    <>
      <BodySilhouette />

      {/* Shoulders / Deltoids — rounded caps wrapping the shoulder joint */}
      <path d="M58,60 Q48,56 42,64 Q36,76 38,90 Q42,100 50,98 Q58,94 60,86 Q62,76 60,64 Z"
        fill={c('shoulders')} stroke={s} strokeWidth={sw} />
      <path d="M142,60 Q152,56 158,64 Q164,76 162,90 Q158,100 150,98 Q142,94 140,86 Q138,76 140,64 Z"
        fill={c('shoulders')} stroke={s} strokeWidth={sw} />

      {/* Chest — pectoralis major, two fan shapes */}
      <path d="M98,64 Q86,62 76,68 Q66,76 64,90 Q64,102 70,108 Q80,114 98,110 Z"
        fill={c('chest')} stroke={s} strokeWidth={sw} />
      <path d="M102,64 Q114,62 124,68 Q134,76 136,90 Q136,102 130,108 Q120,114 102,110 Z"
        fill={c('chest')} stroke={s} strokeWidth={sw} />
      {/* Sternum groove */}
      <line x1="100" y1="64" x2="100" y2="110" stroke={s} strokeWidth={sw} opacity="0.4" />
      {/* Lower pec crease */}
      <path d="M70,108 Q86,114 100,112 Q114,114 130,108" fill="none" stroke={s} strokeWidth={sw} opacity="0.4" />

      {/* Triceps (front) — lateral head on outer arm */}
      <path d="M56,88 Q58,96 58,110 Q56,124 52,134 Q48,140 46,132 Q44,122 46,108 Q48,96 54,90 Z"
        fill={c('triceps')} stroke={s} strokeWidth={sw} />
      <path d="M144,88 Q142,96 142,110 Q144,124 148,134 Q152,140 154,132 Q156,122 154,108 Q152,96 146,90 Z"
        fill={c('triceps')} stroke={s} strokeWidth={sw} />

      {/* Biceps — elongated along the arm */}
      <path d="M48,88 Q42,98 38,114 Q36,130 40,140 Q44,148 50,144 Q54,138 56,124 Q56,108 52,94 Z"
        fill={c('biceps')} stroke={s} strokeWidth={sw} />
      <path d="M152,88 Q158,98 162,114 Q164,130 160,140 Q156,148 150,144 Q146,138 144,124 Q144,108 148,94 Z"
        fill={c('biceps')} stroke={s} strokeWidth={sw} />

      {/* Abs — rectus abdominis with detail lines */}
      <path d="M84,110 Q82,114 82,122 L82,160 Q86,168 100,170 Q114,168 118,160 L118,122 Q118,114 116,110 Z"
        fill={c('abs')} stroke={s} strokeWidth={sw} />
      {/* Linea alba */}
      <line x1="100" y1="110" x2="100" y2="170" stroke={s} strokeWidth={sw} opacity="0.4" />
      {/* Ab row lines */}
      <line x1="83" y1="124" x2="117" y2="124" stroke={s} strokeWidth={sw} opacity="0.4" />
      <line x1="83" y1="138" x2="117" y2="138" stroke={s} strokeWidth={sw} opacity="0.4" />
      <line x1="83" y1="152" x2="117" y2="152" stroke={s} strokeWidth={sw} opacity="0.4" />

      {/* Quads — rectus femoris + vastus lateralis/medialis */}
      <path d="M76,200 Q70,210 66,230 Q64,252 68,270 Q72,282 80,284 Q88,282 90,274 Q92,260 92,240 Q92,222 88,210 Z"
        fill={c('quads')} stroke={s} strokeWidth={sw} />
      {/* VMO teardrop */}
      <path d="M78,262 Q74,268 74,276 Q76,284 82,284 Q86,280 86,274 Q86,266 82,260 Z"
        fill={c('quads')} stroke={s} strokeWidth={sw} />
      <path d="M124,200 Q130,210 134,230 Q136,252 132,270 Q128,282 120,284 Q112,282 110,274 Q108,260 108,240 Q108,222 112,210 Z"
        fill={c('quads')} stroke={s} strokeWidth={sw} />
      {/* VMO teardrop */}
      <path d="M122,262 Q126,268 126,276 Q124,284 118,284 Q114,280 114,274 Q114,266 118,260 Z"
        fill={c('quads')} stroke={s} strokeWidth={sw} />

      {/* Calves — gastrocnemius diamond */}
      <path d="M70,296 Q66,306 64,322 Q64,340 68,352 Q72,362 78,362 Q84,360 88,350 Q92,338 90,320 Q88,304 82,294 Z"
        fill={c('calves')} stroke={s} strokeWidth={sw} />
      <path d="M130,296 Q134,306 136,322 Q136,340 132,352 Q128,362 122,362 Q116,360 112,350 Q108,338 110,320 Q112,304 118,294 Z"
        fill={c('calves')} stroke={s} strokeWidth={sw} />

      {/* Tibialis — front of shin */}
      <path d="M82,296 Q84,306 86,318 Q88,334 86,348 Q84,356 80,354 Q78,348 76,336 Q74,320 76,304 Q78,296 82,296 Z"
        fill={c('tibialis')} stroke={s} strokeWidth={sw} />
      <path d="M118,296 Q116,306 114,318 Q112,334 114,348 Q116,356 120,354 Q122,348 124,336 Q126,320 124,304 Q122,296 118,296 Z"
        fill={c('tibialis')} stroke={s} strokeWidth={sw} />

      {/* Labels */}
      {lbl(150, 74,  'Shoulders', eff.shoulders ?? 0)}
      {lbl(136, 92,  'Chest',     eff.chest ?? 0)}
      {lbl(150, 110, 'Triceps',   eff.triceps ?? 0)}
      {lbl(150, 128, 'Biceps',    eff.biceps ?? 0)}
      {lbl(118, 146, 'Abs',       eff.abs ?? 0)}
      {lbl(134, 248, 'Quads',     eff.quads ?? 0)}
      {lbl(134, 320, 'Calves',    eff.calves ?? 0)}
      {lbl(120, 340, 'Tibialis',  eff.tibialis ?? 0)}
    </>
  );
}

function BackBody({ eff, max }) {
  const c = (m) => muscleColor(eff[m] ?? 0, max);
  const s = "var(--border)";
  const sw = "0.75";
  const lbl = (x1, y1, label, value) => (
    <>
      <line x1={x1} y1={y1} x2="168" y2={y1} stroke={s} strokeWidth="0.5" strokeOpacity="0.5" />
      <text x="170" y={y1 + 3} fontSize="7.5" fill="var(--text-secondary)">{label} {parseFloat(value.toFixed(2))}</text>
    </>
  );

  return (
    <>
      <BodySilhouette />

      {/* Rear Delts — posterior deltoid caps */}
      <path d="M58,60 Q46,56 40,64 Q34,78 38,92 Q44,102 52,98 Q60,94 62,84 Q62,74 60,64 Z"
        fill={c('rearDelts')} stroke={s} strokeWidth={sw} />
      <path d="M142,60 Q154,56 160,64 Q166,78 162,92 Q156,102 148,98 Q140,94 138,84 Q138,74 140,64 Z"
        fill={c('rearDelts')} stroke={s} strokeWidth={sw} />

      {/* Back — trapezius + latissimus dorsi (V-taper) */}
      <path d="M98,64 Q84,60 72,66 Q60,72 56,84 L58,98 Q64,114 74,128 Q84,136 94,136 L98,124 Z"
        fill={c('back')} stroke={s} strokeWidth={sw} />
      <path d="M102,64 Q116,60 128,66 Q140,72 144,84 L142,98 Q136,114 126,128 Q116,136 106,136 L102,124 Z"
        fill={c('back')} stroke={s} strokeWidth={sw} />
      {/* Upper trap diamond */}
      <path d="M88,56 Q100,50 112,56 L110,72 Q100,76 90,72 Z"
        fill={c('back')} stroke={s} strokeWidth={sw} />
      {/* Spine line */}
      <line x1="100" y1="56" x2="100" y2="168" stroke={s} strokeWidth={sw} opacity="0.4" />

      {/* Triceps (back) — full horseshoe visible */}
      <path d="M46,86 Q42,96 40,112 Q38,128 42,140 Q46,148 52,146 Q56,142 58,132 Q60,120 58,106 Q56,94 50,86 Z"
        fill={c('triceps')} stroke={s} strokeWidth={sw} />
      <path d="M154,86 Q158,96 160,112 Q162,128 158,140 Q154,148 148,146 Q144,142 142,132 Q140,120 142,106 Q144,94 150,86 Z"
        fill={c('triceps')} stroke={s} strokeWidth={sw} />

      {/* Low Back — erector spinae pillars */}
      <path d="M92,132 Q88,136 88,146 L88,164 Q90,170 94,170 Q98,168 98,162 L98,144 Q98,136 94,132 Z"
        fill={c('lowBack')} stroke={s} strokeWidth={sw} />
      <path d="M108,132 Q112,136 112,146 L112,164 Q110,170 106,170 Q102,168 102,162 L102,144 Q102,136 106,132 Z"
        fill={c('lowBack')} stroke={s} strokeWidth={sw} />

      {/* Glutes — gluteus maximus, large rounded */}
      <path d="M74,170 Q68,176 66,190 Q66,204 72,212 Q78,218 88,218 Q96,218 100,212 Q102,206 102,196 Q102,182 98,174 Q92,168 82,170 Z"
        fill={c('glutes')} stroke={s} strokeWidth={sw} />
      <path d="M126,170 Q132,176 134,190 Q134,204 128,212 Q122,218 112,218 Q104,218 100,212 Q98,206 98,196 Q98,182 102,174 Q108,168 118,170 Z"
        fill={c('glutes')} stroke={s} strokeWidth={sw} />
      {/* Glute fold arc */}
      <path d="M72,212 Q86,218 100,218 Q114,218 128,212" fill="none" stroke={s} strokeWidth={sw} opacity="0.4" />

      {/* Hamstrings — biceps femoris + semitendinosus */}
      <path d="M72,218 Q68,226 66,246 Q64,266 68,280 Q72,290 80,292 Q88,290 90,282 Q92,268 92,248 Q92,230 88,218 Z"
        fill={c('hamstrings')} stroke={s} strokeWidth={sw} />
      <path d="M128,218 Q132,226 134,246 Q136,266 132,280 Q128,290 120,292 Q112,290 110,282 Q108,268 108,248 Q108,230 112,218 Z"
        fill={c('hamstrings')} stroke={s} strokeWidth={sw} />

      {/* Calves (back) — gastrocnemius two heads */}
      <path d="M70,296 Q66,306 64,322 Q64,340 68,352 Q72,362 78,362 Q84,360 88,350 Q92,338 90,320 Q88,304 82,294 Z"
        fill={c('calves')} stroke={s} strokeWidth={sw} />
      <path d="M130,296 Q134,306 136,322 Q136,340 132,352 Q128,362 122,362 Q116,360 112,350 Q108,338 110,320 Q112,304 118,294 Z"
        fill={c('calves')} stroke={s} strokeWidth={sw} />
      {/* Medial/lateral calf split */}
      <line x1="78" y1="296" x2="78" y2="344" stroke={s} strokeWidth={sw} opacity="0.3" />
      <line x1="122" y1="296" x2="122" y2="344" stroke={s} strokeWidth={sw} opacity="0.3" />

      {/* Labels */}
      {lbl(148, 76,  'Rear Delts', eff.rearDelts ?? 0)}
      {lbl(138, 96,  'Back',       eff.back ?? 0)}
      {lbl(148, 116, 'Triceps',    eff.triceps ?? 0)}
      {lbl(112, 152, 'Low Back',   eff.lowBack ?? 0)}
      {lbl(134, 194, 'Glutes',     eff.glutes ?? 0)}
      {lbl(134, 256, 'Hamstrings', eff.hamstrings ?? 0)}
      {lbl(134, 330, 'Calves',     eff.calves ?? 0)}
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

      <svg className="body-svg" viewBox="0 0 270 420" role="img" aria-label={`Muscle volume heatmap, ${side} view`} xmlns="http://www.w3.org/2000/svg">
        {side === 'front' ? <FrontBody eff={eff} max={max} /> : <BackBody eff={eff} max={max} />}
      </svg>
    </div>
  );
}

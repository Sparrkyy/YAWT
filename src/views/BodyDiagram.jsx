function muscleColor(value, maxValue) {
  const t = Math.min(value / maxValue, 1);
  const alpha = 0.15 + t * 0.85;
  return `rgba(10, 132, 255, ${alpha.toFixed(2)})`;
}

function neutral() {
  return 'rgba(120,120,128,0.25)';
}

function FrontBody({ eff, max }) {
  const c = (m) => muscleColor(eff[m] ?? 0, max);
  const lbl = (x1, y1, label, value) => (
    <>
      <line x1={x1} y1={y1} x2="155" y2={y1} stroke="var(--border)" strokeWidth="0.75" />
      <text x="157" y={y1 + 3} fontSize="8" fill="var(--text-secondary)">{label} {value.toFixed(1)}</text>
    </>
  );

  return (
    <>
      {/* Head */}
      <ellipse cx="100" cy="28" rx="22" ry="26" fill={neutral()} stroke="var(--border)" strokeWidth="1" />
      {/* Neck */}
      <rect x="92" y="52" width="16" height="14" rx="4" fill={neutral()} stroke="var(--border)" strokeWidth="1" />

      {/* Shoulders */}
      <ellipse cx="67" cy="78" rx="17" ry="13" fill={c('shoulders')} stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="133" cy="78" rx="17" ry="13" fill={c('shoulders')} stroke="var(--border)" strokeWidth="1" />

      {/* Chest */}
      <path d="M82,70 Q100,80 118,70 L118,98 Q100,106 82,98 Z" fill={c('chest')} stroke="var(--border)" strokeWidth="1" />

      {/* Biceps */}
      <ellipse cx="58" cy="112" rx="10" ry="20" fill={c('biceps')} stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="142" cy="112" rx="10" ry="20" fill={c('biceps')} stroke="var(--border)" strokeWidth="1" />

      {/* Triceps (front view — partially visible) */}
      <ellipse cx="52" cy="115" rx="7" ry="18" fill={c('triceps')} stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="148" cy="115" rx="7" ry="18" fill={c('triceps')} stroke="var(--border)" strokeWidth="1" />

      {/* Abs */}
      <rect x="85" y="100" width="30" height="50" rx="6" fill={c('abs')} stroke="var(--border)" strokeWidth="1" />

      {/* Hip/waist */}
      <path d="M82,155 Q100,165 118,155 L122,195 Q100,200 78,195 Z" fill={neutral()} stroke="var(--border)" strokeWidth="1" />

      {/* Quads */}
      <ellipse cx="88" cy="230" rx="18" ry="42" fill={c('quads')} stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="112" cy="230" rx="18" ry="42" fill={c('quads')} stroke="var(--border)" strokeWidth="1" />

      {/* Calves */}
      <ellipse cx="88" cy="320" rx="12" ry="36" fill={c('calves')} stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="112" cy="320" rx="12" ry="36" fill={c('calves')} stroke="var(--border)" strokeWidth="1" />

      {/* Callout labels */}
      {lbl(112, 78,  'Shoulders', eff.shoulders ?? 0)}
      {lbl(118, 90,  'Chest',     eff.chest ?? 0)}
      {lbl(68,  108, 'Biceps',    eff.biceps ?? 0)}
      {lbl(59,  118, 'Triceps',   eff.triceps ?? 0)}
      {lbl(115, 140, 'Abs',       eff.abs ?? 0)}
      {lbl(112, 230, 'Quads',     eff.quads ?? 0)}
      {lbl(105, 320, 'Calves',    eff.calves ?? 0)}
    </>
  );
}

function BackBody({ eff, max }) {
  const c = (m) => muscleColor(eff[m] ?? 0, max);
  const lbl = (x1, y1, label, value) => (
    <>
      <line x1={x1} y1={y1} x2="155" y2={y1} stroke="var(--border)" strokeWidth="0.75" />
      <text x="157" y={y1 + 3} fontSize="8" fill="var(--text-secondary)">{label} {value.toFixed(1)}</text>
    </>
  );

  return (
    <>
      {/* Head */}
      <ellipse cx="100" cy="28" rx="22" ry="26" fill="rgba(120,120,128,0.25)" stroke="var(--border)" strokeWidth="1" />
      {/* Neck */}
      <rect x="92" y="52" width="16" height="14" rx="4" fill="rgba(120,120,128,0.25)" stroke="var(--border)" strokeWidth="1" />

      {/* Rear Delts */}
      <ellipse cx="67" cy="78" rx="17" ry="13" fill={c('rearDelts')} stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="133" cy="78" rx="17" ry="13" fill={c('rearDelts')} stroke="var(--border)" strokeWidth="1" />

      {/* Back */}
      <path d="M78,68 L122,68 L128,130 Q100,138 72,130 Z" fill={c('back')} stroke="var(--border)" strokeWidth="1" />

      {/* Triceps */}
      <ellipse cx="56" cy="110" rx="11" ry="22" fill={c('triceps')} stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="144" cy="110" rx="11" ry="22" fill={c('triceps')} stroke="var(--border)" strokeWidth="1" />

      {/* Low Back */}
      <rect x="84" y="132" width="32" height="28" rx="5" fill={c('lowBack')} stroke="var(--border)" strokeWidth="1" />

      {/* Glutes */}
      <path d="M78,162 Q100,175 122,162 L124,208 Q100,215 76,208 Z" fill={c('glutes')} stroke="var(--border)" strokeWidth="1" />

      {/* Hamstrings */}
      <ellipse cx="88" cy="245" rx="18" ry="40" fill={c('hamstrings')} stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="112" cy="245" rx="18" ry="40" fill={c('hamstrings')} stroke="var(--border)" strokeWidth="1" />

      {/* Calves */}
      <ellipse cx="88" cy="320" rx="12" ry="36" fill={c('calves')} stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="112" cy="320" rx="12" ry="36" fill={c('calves')} stroke="var(--border)" strokeWidth="1" />

      {/* Callout labels */}
      {lbl(112, 78,  'Rear Delts',  eff.rearDelts ?? 0)}
      {lbl(122, 100, 'Back',        eff.back ?? 0)}
      {lbl(67,  110, 'Triceps',     eff.triceps ?? 0)}
      {lbl(116, 146, 'Low Back',    eff.lowBack ?? 0)}
      {lbl(122, 180, 'Glutes',      eff.glutes ?? 0)}
      {lbl(112, 245, 'Hamstrings',  eff.hamstrings ?? 0)}
      {lbl(105, 320, 'Calves',      eff.calves ?? 0)}
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

      <svg className="body-svg" viewBox="0 0 200 420" xmlns="http://www.w3.org/2000/svg">
        {side === 'front' ? <FrontBody eff={eff} max={max} /> : <BackBody eff={eff} max={max} />}
      </svg>
    </div>
  );
}

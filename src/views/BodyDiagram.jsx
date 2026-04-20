import Model from 'react-body-highlighter';

const INTENSITY_LEVELS = 5;

// Each muscle gets a base color and a block of frequency slots for intensity
// anteriorDelts is a virtual key: frontDelts + sideDelts combined (library has no lateral-delt slug)
const MUSCLE_CONFIG = {
  chest:         { slugs: ['chest'],                       color: [224, 85, 85] },
  anteriorDelts: { slugs: ['front-deltoids'],              color: [232, 145, 58] },
  biceps:        { slugs: ['biceps'],                      color: [76, 175, 80] },
  triceps:    { slugs: ['triceps'],                     color: [38, 166, 154] },
  abs:        { slugs: ['abs'],                         color: [160, 184, 64] },
  quads:      { slugs: ['quadriceps'],                  color: [74, 144, 217] },
  calves:     { slugs: ['calves'],                      color: [126, 87, 194] },
  tibialis:   { slugs: ['left-soleus', 'right-soleus'], color: [106, 140, 175] },
  back:       { slugs: ['trapezius', 'upper-back'],     color: [192, 57, 43] },
  rearDelts:  { slugs: ['back-deltoids'],               color: [212, 118, 58] },
  lowBack:    { slugs: ['lower-back'],                  color: [192, 122, 159] },
  glutes:     { slugs: ['gluteal'],                     color: [47, 168, 181] },
  hamstrings: { slugs: ['hamstring'],                   color: [142, 68, 173] },
};

const MUSCLE_KEYS = Object.keys(MUSCLE_CONFIG);

// Build highlightedColors: for each muscle, 5 entries from faint to full
// frequency = muscleIndex * INTENSITY_LEVELS + intensityBucket (1-based)
const HIGHLIGHT_COLORS = [];
for (const key of MUSCLE_KEYS) {
  const [r, g, b] = MUSCLE_CONFIG[key].color;
  for (let i = 0; i < INTENSITY_LEVELS; i++) {
    // Mix with white: level 0 = very faint, level 4 = full color
    const t = (i + 1) / INTENSITY_LEVELS;          // 0.2 → 1.0
    const alpha = 0.2 + t * 0.8;                    // 0.36 → 1.0
    const mr = Math.round(255 + (r - 255) * t);
    const mg = Math.round(255 + (g - 255) * t);
    const mb = Math.round(255 + (b - 255) * t);
    HIGHLIGHT_COLORS.push(`rgba(${mr}, ${mg}, ${mb}, ${alpha.toFixed(2)})`);
  }
}

function muscleBucket(value, maxValue) {
  const t = Math.min(value / maxValue, 1);
  return Math.max(0, Math.min(INTENSITY_LEVELS - 1, Math.round(t * (INTENSITY_LEVELS - 1))));
}

function augmentSets(effectiveSets) {
  return {
    ...effectiveSets,
    anteriorDelts: (effectiveSets.frontDelts ?? 0) + (effectiveSets.sideDelts ?? 0)
  };
}

function buildModelData(effectiveSets, maxValue) {
  const data = [];
  const augmented = augmentSets(effectiveSets);

  for (let mi = 0; mi < MUSCLE_KEYS.length; mi++) {
    const muscle = MUSCLE_KEYS[mi];
    const config = MUSCLE_CONFIG[muscle];
    const value = augmented[muscle] ?? 0;
    if (value <= 0) continue;

    const bucket = muscleBucket(value, maxValue);
    const frequency = mi * INTENSITY_LEVELS + bucket + 1;

    data.push({
      name: muscle,
      muscles: config.slugs,
      frequency,
    });
  }

  return data;
}

function sideClass(side, btn) { return `side-btn${side === btn ? ' active' : ''}`; }
function modelType(side) { return side === 'front' ? 'anterior' : 'posterior'; }

export default function BodyDiagram({ effectiveSets, side, onSideChange }) {
  const max = Math.max(...Object.values(effectiveSets), 4);
  const data = buildModelData(effectiveSets, max);

  return (
    <div className="body-diagram">
      <div className="side-toggle">
        <button className={sideClass(side, 'front')} onClick={() => onSideChange('front')}>
          Front
        </button>
        <button className={sideClass(side, 'back')} onClick={() => onSideChange('back')}>
          Back
        </button>
      </div>

      <Model
        data={data}
        type={modelType(side)}
        highlightedColors={HIGHLIGHT_COLORS}
        style={{ width: '100%', maxWidth: '220px', padding: '0' }}
      />
    </div>
  );
}

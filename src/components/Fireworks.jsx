import { useEffect } from 'react';

const PARTICLES = [
  { x:'20%', y:'70%', color:'#FFD60A', delay:'0s',    rise:'-200px', bx:'-80px',  by:'-40px',  dur:'0.55s', bdur:'0.85s' },
  { x:'20%', y:'70%', color:'#FF9F0A', delay:'0s',    rise:'-200px', bx: '70px',  by:'-60px',  dur:'0.55s', bdur:'0.85s' },
  { x:'20%', y:'70%', color:'#5E5CE6', delay:'0s',    rise:'-200px', bx:'-30px',  by: '90px',  dur:'0.55s', bdur:'0.85s' },
  { x:'75%', y:'65%', color:'#30D158', delay:'0.15s', rise:'-170px', bx: '80px',  by:'-50px',  dur:'0.6s',  bdur:'0.9s'  },
  { x:'75%', y:'65%', color:'#FF3B30', delay:'0.15s', rise:'-170px', bx:'-90px',  by:'-30px',  dur:'0.6s',  bdur:'0.9s'  },
  { x:'75%', y:'65%', color:'#64D2FF', delay:'0.15s', rise:'-170px', bx: '20px',  by: '80px',  dur:'0.6s',  bdur:'0.9s'  },
  { x:'50%', y:'80%', color:'#FFD60A', delay:'0.35s', rise:'-220px', bx:'-100px', by:'-20px',  dur:'0.5s',  bdur:'0.95s' },
  { x:'50%', y:'80%', color:'#5E5CE6', delay:'0.35s', rise:'-220px', bx: '100px', by:'-20px',  dur:'0.5s',  bdur:'0.95s' },
  { x:'50%', y:'80%', color:'#FF9F0A', delay:'0.35s', rise:'-220px', bx:   '0px', by:'110px',  dur:'0.5s',  bdur:'0.95s' },
  { x:'35%', y:'75%', color:'#30D158', delay:'0.5s',  rise:'-190px', bx:'-70px',  by:'-70px',  dur:'0.58s', bdur:'0.88s' },
  { x:'35%', y:'75%', color:'#FF3B30', delay:'0.5s',  rise:'-190px', bx: '75px',  by:'-55px',  dur:'0.58s', bdur:'0.88s' },
  { x:'65%', y:'72%', color:'#64D2FF', delay:'0.65s', rise:'-210px', bx:'-60px',  by:'100px',  dur:'0.52s', bdur:'0.92s' },
];

export default function Fireworks({ onDismiss }) {
  useEffect(() => {
const id = setTimeout(onDismiss, 2500);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      className="fireworks-overlay"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="New PR celebration"
    >
      <div className="fireworks-canvas" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="fw-particle"
            style={{
              '--x': p.x, '--y': p.y, '--color': p.color, '--delay': p.delay,
              '--rise': p.rise, '--bx': p.bx, '--by': p.by,
              '--dur': p.dur, '--bdur': p.bdur,
            }}
          />
        ))}
      </div>
      <p className="fireworks-label">New PR!</p>
      <p className="fireworks-sub">Tap to dismiss</p>
    </div>
  );
}

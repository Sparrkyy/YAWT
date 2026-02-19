import { useRef, useState, useEffect } from 'react';

export default function SwipeableRow({ children, onDelete }) {
  const wrapRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);

  // Keep a ref so touch handlers always read the latest value without
  // needing to re-register on every state change.
  const offsetRef = useRef(0);
  function applyOffset(val) {
    offsetRef.current = val;
    setOffset(val);
  }

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lockedAxisRef = useRef(null); // 'h' | 'v' | null

  const onDeleteRef = useRef(onDelete);
  useEffect(() => { onDeleteRef.current = onDelete; }, [onDelete]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    function onTouchStart(e) {
      const t = e.touches[0];
      startXRef.current = t.clientX;
      startYRef.current = t.clientY;
      isDraggingRef.current = true;
      lockedAxisRef.current = null;
      setIsSnapping(false);
    }

    function onTouchMove(e) {
      if (!isDraggingRef.current) return;
      const t = e.touches[0];
      const dx = t.clientX - startXRef.current;
      const dy = t.clientY - startYRef.current;

      if (lockedAxisRef.current === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        lockedAxisRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      }

      if (lockedAxisRef.current !== 'h') return;

      e.preventDefault();

      const rowWidth = el.offsetWidth;
      const clamped = Math.max(-rowWidth, Math.min(0, dx));
      applyOffset(clamped);
    }

    function onTouchEnd() {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const rowWidth = wrapRef.current?.offsetWidth ?? 300;
      const cur = offsetRef.current;
      setIsSnapping(true);

      if (cur > -60) {
        applyOffset(0);
      } else if (cur > -rowWidth * 0.5) {
        applyOffset(-80);
      } else {
        applyOffset(-rowWidth);
        setTimeout(() => onDeleteRef.current({
          snapBack: () => { setIsSnapping(true); applyOffset(0); }
        }), 250);
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []); // runs once — all mutable state accessed via refs

  function handleDeleteTap() {
    const rowWidth = wrapRef.current?.offsetWidth ?? 300;
    setIsSnapping(true);
    applyOffset(-rowWidth);
    setTimeout(() => onDeleteRef.current({
      snapBack: () => { setIsSnapping(true); applyOffset(0); }
    }), 250);
  }

  return (
    <div className="swipe-wrap" ref={wrapRef}>
      <div className="swipe-delete-bg">
        <button onClick={handleDeleteTap} aria-label="Delete">Delete</button>
      </div>
      <div
        className="swipe-inner"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSnapping ? 'transform 0.25s ease' : 'none',
        }}
        onTransitionEnd={() => {
          if (offsetRef.current === 0) setIsSnapping(false);
        }}
      >
        {children}
        <button
          className="swipe-hint-btn"
          onClick={handleDeleteTap}
          aria-label="Delete"
          title="Delete"
        >
          ×
        </button>
      </div>
    </div>
  );
}

import { useRef, useState, useEffect } from 'react';

function shouldLock(locked, dx, dy) {
  return locked === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4);
}

function resolveAxis(dx, dy) {
  return Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
}

function clampOffset(dx, rowWidth) {
  return Math.max(-rowWidth, Math.min(0, dx));
}

function getRowWidth(ref) {
  return ref.current?.offsetWidth ?? 300;
}

function resolveSnapOffset(cur, rowWidth) {
  if (cur > -60) return 0;
  if (cur > -rowWidth * 0.5) return -80;
  return -rowWidth;
}

export default function SwipeableRow({ children, onDelete }) {
  const wrapRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);

  const offsetRef = useRef(0);
  function applyOffset(val) {
    offsetRef.current = val;
    setOffset(val);
  }

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lockedAxisRef = useRef(null);

  const onDeleteRef = useRef(onDelete);
  useEffect(() => {
    onDeleteRef.current = onDelete;
  }, [onDelete]);

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

    function updateAxisLock(dx, dy) {
      if (shouldLock(lockedAxisRef.current, dx, dy)) {
        lockedAxisRef.current = resolveAxis(dx, dy);
      }
    }

    function applyHorizontalOffset(e, el) {
      e.preventDefault();
      applyOffset(clampOffset(e.touches[0].clientX - startXRef.current, el.offsetWidth));
    }

    function onTouchMove(e) {
      if (!isDraggingRef.current) return;
      const dx = e.touches[0].clientX - startXRef.current;
      const dy = e.touches[0].clientY - startYRef.current;
      updateAxisLock(dx, dy);
      if (lockedAxisRef.current !== 'h') return;
      applyHorizontalOffset(e, el);
    }

    function onTouchEnd() {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const rowWidth = getRowWidth(wrapRef);
      const snapOffset = resolveSnapOffset(offsetRef.current, rowWidth);
      setIsSnapping(true);
      applyOffset(snapOffset);
      if (snapOffset === -rowWidth) {
        setTimeout(
          () =>
            onDeleteRef.current({
              snapBack: () => {
                setIsSnapping(true);
                applyOffset(0);
              },
            }),
          250
        );
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
  }, []);

  function handleDeleteTap() {
    const rowWidth = getRowWidth(wrapRef);
    setIsSnapping(true);
    applyOffset(-rowWidth);
    setTimeout(
      () =>
        onDeleteRef.current({
          snapBack: () => {
            setIsSnapping(true);
            applyOffset(0);
          },
        }),
      250
    );
  }

  return (
    <div className="swipe-wrap" ref={wrapRef}>
      <div className="swipe-delete-bg">
        <button onClick={handleDeleteTap} aria-label="Delete">
          Delete
        </button>
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

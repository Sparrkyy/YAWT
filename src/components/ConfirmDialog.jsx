export default function ConfirmDialog({
  title = 'Delete set?',
  confirmLabel = 'Delete',
  confirmStyle = 'btn-danger',
  onConfirm,
  onCancel,
}) {
  return (
    <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="sheet confirm-sheet">
        <div className="sheet-header">
          <span className="sheet-title">{title}</span>
          <button className="sheet-close" onClick={onCancel}>✕</button>
        </div>
        <div className="sheet-footer sheet-footer-row">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={confirmStyle} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

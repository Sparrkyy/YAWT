export default function ErrorDialog({ error, onDismiss, onReauth }) {
  if (!error) return null;

  const show401Reauth = error.status === 401 && onReauth;

  return (
    <div className="sheet-overlay" role="alertdialog" onClick={e => { if (e.target === e.currentTarget) onDismiss(); }}>
      <div className="sheet error-sheet">
        <div className="sheet-header">
          <span className="sheet-title">
            {error.operation ? `Error ${error.operation}` : 'Error'}
          </span>
          <button className="sheet-close" onClick={onDismiss}>✕</button>
        </div>
        <div className="sheet-body">
          <p className="error-detail">{error.message}</p>
          {error.status && (
            <p className="error-detail error-status">HTTP status: {error.status}</p>
          )}
          {error.status === 401 && (
            <p className="error-hint">
              {show401Reauth ? 'Your session has expired.' : 'Your session may have expired. Try signing in again.'}
            </p>
          )}
        </div>
        <div className="sheet-footer">
          {show401Reauth ? (
            <div className="sheet-footer-row">
              <button className="btn-secondary" onClick={onDismiss}>Dismiss</button>
              <button className="btn-primary" onClick={onReauth}>Sign back in</button>
            </div>
          ) : (
            <button className="btn-primary" onClick={onDismiss}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
}

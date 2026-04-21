function ErrorHint({ status, show401Reauth }) {
  if (status !== 401) return null;
  return (
    <p className="error-hint">
      {show401Reauth
        ? 'Your session has expired.'
        : 'Your session may have expired. Try signing in again.'}
    </p>
  );
}

function ErrorFooter({ show401Reauth, onDismiss, onReauth }) {
  if (show401Reauth) {
    return (
      <div className="sheet-footer-row">
        <button className="btn-secondary" onClick={onDismiss}>
          Dismiss
        </button>
        <button className="btn-primary" onClick={onReauth}>
          Sign back in
        </button>
      </div>
    );
  }
  return (
    <button className="btn-primary" onClick={onDismiss}>
      OK
    </button>
  );
}

function handleBackdropClick(e, onDismiss) {
  if (e.target === e.currentTarget) onDismiss();
}

export default function ErrorDialog({ error, onDismiss, onReauth }) {
  if (!error) return null;

  const show401Reauth = error.status === 401 && onReauth;

  return (
    <div
      className="sheet-overlay"
      role="alertdialog"
      onClick={(e) => handleBackdropClick(e, onDismiss)}
    >
      <div className="sheet error-sheet">
        <div className="sheet-header">
          <span className="sheet-title">
            {error.operation ? `Error ${error.operation}` : 'Error'}
          </span>
          <button className="sheet-close" onClick={onDismiss}>
            ✕
          </button>
        </div>
        <div className="sheet-body">
          <p className="error-detail">{error.message}</p>
          {error.status && <p className="error-detail error-status">HTTP status: {error.status}</p>}
          <ErrorHint status={error.status} show401Reauth={show401Reauth} />
        </div>
        <div className="sheet-footer">
          <ErrorFooter show401Reauth={show401Reauth} onDismiss={onDismiss} onReauth={onReauth} />
        </div>
      </div>
    </div>
  );
}

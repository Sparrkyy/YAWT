function userBtnClass(activeUser, u) {
  return `user-btn${activeUser === u ? ' active' : ''}`;
}

export default function UserToggle({ users, activeUser, onUserChange }) {
  return (
    <div className="user-toggle">
      {users.map((u) => (
        <button key={u} className={userBtnClass(activeUser, u)} onClick={() => onUserChange(u)}>
          {u}
        </button>
      ))}
    </div>
  );
}

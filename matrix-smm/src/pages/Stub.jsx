export default function Stub({ title, icon }) {
  return (
    <>
      <div className="topbar"><span className="topbar-title">{title}</span></div>
      <div className="page-content">
        <div className="empty-state">
          <div className="icon">{icon}</div>
          <h3>{title}</h3>
          <p>Раздел находится в разработке</p>
        </div>
      </div>
    </>
  );
}

export default function Loading({ label = "Loading your workspace" }) {
  return (
    <div className="loading-state">
      <span className="loader" />
      <p>{label}</p>
    </div>
  );
}

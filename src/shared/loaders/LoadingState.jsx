export default function LoadingState({label='Loading records…'}) { return <div className="loading-state"><span className="spinner" aria-hidden="true"/><span>{label}</span></div>; }

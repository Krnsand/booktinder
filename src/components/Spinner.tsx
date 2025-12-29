interface SpinnerProps {
  label?: string;
}

export default function Spinner({ label }: SpinnerProps) {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <div className="spinner-circle" aria-hidden="true" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}

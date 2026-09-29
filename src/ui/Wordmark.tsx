export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`display leading-none text-navy ${className}`}>
      Class8 <span className="text-purple">Copilot</span>
    </span>
  );
}

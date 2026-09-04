export function BrandLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="6" fill="#0B1F3A" />
      <path d="M50 22 L78 72 L22 72 Z" fill="none" stroke="#C9A24B" strokeWidth="5" strokeLinejoin="round" />
      <line x1="34" y1="56" x2="66" y2="56" stroke="#C9A24B" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="50" cy="38" r="3" fill="#C9A24B" />
    </svg>
  );
}

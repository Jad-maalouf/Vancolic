const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function RefreshIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function DoubleCheckIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2 12l4 4L14 8" />
      <path d="M10 12l4 4L22 8" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v16" />
      <path d="M4 12h16" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function LogoutIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function BackIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function PlayIcon(props) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function CashIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function BottleIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 2h6" />
      <path d="M10 2v4.5L8 9v10.5A2.5 2.5 0 0 0 10.5 22h3a2.5 2.5 0 0 0 2.5-2.5V9l-2-2.5V2" />
      <path d="M8 13h8" />
    </svg>
  );
}

export function GlassIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3h12l-1.6 16a2 2 0 0 1-2 1.8h-4.8a2 2 0 0 1-2-1.8L6 3z" />
      <path d="M7.2 9h9.6" />
    </svg>
  );
}

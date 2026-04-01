interface IconProps {
  active: boolean;
  size?: number;
}

const stroke = (active: boolean) => (active ? "#1D4ED8" : "#9CA3AF");
const base = {
  fill: "none" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.5,
};

export function SmartphoneIcon({ active, size = 28 }: IconProps) {
  const c = stroke(active);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
    >
      <title>Smartphones</title>
      <rect x="5" y="2" width="14" height="20" rx="2" stroke={c} {...base} />
      <line
        x1="9"
        y1="18"
        x2="15"
        y2="18"
        stroke={c}
        strokeLinecap="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function LaptopIcon({ active, size = 28 }: IconProps) {
  const c = stroke(active);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
    >
      <title>Laptops</title>
      <rect x="3" y="4" width="18" height="12" rx="2" stroke={c} {...base} />
      <path d="M2 20h20" stroke={c} strokeLinecap="round" strokeWidth={1.5} />
      <path d="M9 20l1.5-4h3L15 20" stroke={c} {...base} />
    </svg>
  );
}

export function TabletIcon({ active, size = 28 }: IconProps) {
  const c = stroke(active);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
    >
      <title>iPads</title>
      <rect x="4" y="2" width="16" height="20" rx="2" stroke={c} {...base} />
      <line
        x1="12"
        y1="18"
        x2="12"
        y2="18.5"
        stroke={c}
        strokeLinecap="round"
        strokeWidth={2}
      />
    </svg>
  );
}

export function WatchIcon({ active, size = 28 }: IconProps) {
  const c = stroke(active);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
    >
      <title>Watches</title>
      <circle cx="12" cy="12" r="5" stroke={c} {...base} />
      <path d="M9 4h6l1 3H8z" stroke={c} {...base} />
      <path d="M9 20h6l1-3H8z" stroke={c} {...base} />
      <polyline points="12,9 12,12 14,13" stroke={c} {...base} />
    </svg>
  );
}

export function GamingIcon({ active, size = 28 }: IconProps) {
  const c = stroke(active);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
    >
      <title>Gaming Consoles</title>
      <path
        d="M6 12h4m-2-2v4"
        stroke={c}
        strokeLinecap="round"
        strokeWidth={1.5}
      />
      <circle cx="17" cy="11" r="1" fill={c} />
      <circle cx="15" cy="13" r="1" fill={c} />
      <path
        d="M5 8h14a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a2 2 0 0 1 2-2z"
        stroke={c}
        {...base}
      />
    </svg>
  );
}

export function AccessoriesIcon({ active, size = 28 }: IconProps) {
  const c = stroke(active);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
    >
      <title>Accessories</title>
      <path d="M3 12a9 9 0 1 0 18 0" stroke={c} {...base} />
      <path
        d="M3 12c0-1.1.9-2 2-2h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-2z"
        stroke={c}
        {...base}
      />
      <path
        d="M21 12c0-1.1-.9-2-2-2h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-2z"
        stroke={c}
        {...base}
      />
    </svg>
  );
}

export function SparePartsIcon({ active, size = 28 }: IconProps) {
  const c = stroke(active);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
    >
      <title>Spare Parts</title>
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke={c}
        {...base}
      />
    </svg>
  );
}

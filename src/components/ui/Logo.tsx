export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Owl body */}
      <ellipse cx="50" cy="60" rx="30" ry="35" fill="url(#gradient1)" />

      {/* Owl head */}
      <circle cx="50" cy="35" r="28" fill="url(#gradient2)" />

      {/* Left ear/horn */}
      <path
        d="M30 18 L25 8 L35 15 Z"
        fill="#F59E0B"
      />

      {/* Right ear/horn */}
      <path
        d="M70 18 L75 8 L65 15 Z"
        fill="#F59E0B"
      />

      {/* Left eye outer */}
      <circle cx="40" cy="35" r="10" fill="#FBBF24" />

      {/* Right eye outer */}
      <circle cx="60" cy="35" r="10" fill="#FBBF24" />

      {/* Left eye inner */}
      <circle cx="40" cy="35" r="6" fill="#0F172A" />

      {/* Right eye inner */}
      <circle cx="60" cy="35" r="6" fill="#0F172A" />

      {/* Left pupil */}
      <circle cx="42" cy="33" r="2" fill="#F8FAFC" />

      {/* Right pupil */}
      <circle cx="62" cy="33" r="2" fill="#F8FAFC" />

      {/* Beak */}
      <path
        d="M50 40 L45 50 L55 50 Z"
        fill="#FB923C"
      />

      {/* Wings - left */}
      <ellipse
        cx="25"
        cy="65"
        rx="8"
        ry="20"
        fill="#F59E0B"
        opacity="0.8"
      />

      {/* Wings - right */}
      <ellipse
        cx="75"
        cy="65"
        rx="8"
        ry="20"
        fill="#F59E0B"
        opacity="0.8"
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
    </svg>
  )
}

import { useId } from 'react';

export default function BrandLogo({
  variant = 'full',
  className = '',
  title = 'PinkPurple Studio',
}) {
  const uid = useId().replace(/:/g, '');
  const gradId = `ppGrad-${uid}`;
  const maskId = `ppMask-${uid}`;

  const mark = (
    <svg
      className="brand-logo__mark"
      viewBox="0 0 160 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="18" y1="4" x2="148" y2="196" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F43CB0" />
          <stop offset="1" stopColor="#8C3DF5" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect width="160" height="200" fill="#fff" />
          <path
            fill="#000"
            d="M36 132 L78 92 L94 108 L138 48 L152 60 L100 134 L82 116 L48 146 Z"
          />
          <path fill="#000" d="M124 34 L154 42 L132 66 Z" />
        </mask>
      </defs>
      <path
        fill={`url(#${gradId})`}
        fillRule="evenodd"
        mask={`url(#${maskId})`}
        d="M28 18c0-8.837 7.163-16 16-16h44c41.974 0 70 29.028 70 66s-28.026 66-70 66H60v40c0 8.837-7.163 16-16 16s-16-7.163-16-16V18zm32 26v56h28c23.196 0 42-14.327 42-28s-18.804-28-42-28H60z"
      />
    </svg>
  );

  if (variant === 'mark') {
    return (
      <span className={`brand-logo brand-logo--mark ${className}`.trim()} role="img" aria-label={title}>
        {mark}
      </span>
    );
  }

  return (
    <span className={`brand-logo brand-logo--full ${className}`.trim()} role="img" aria-label={title}>
      {mark}
      <span className="brand-logo__text">
        <span className="brand-logo__name">
          <span className="brand-logo__pink">Pink</span>
          <span className="brand-logo__purple">
            <span className="brand-logo__p">P</span>
            urple
          </span>
        </span>
        <span className="brand-logo__seo">Studio</span>
      </span>
    </span>
  );
}

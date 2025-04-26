const KPInputBackground = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 426 52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0"
    preserveAspectRatio="none"
  >
    <g filter="url(#filter0_i_127_502)">
      <path
        d="M10.1713 0.206177H417.624L426 8.71446V42.1344L417.624 51.2062H10.1713L0 42.1344V8.71446L10.1713 0.206177Z"
        fill="#F3E4CE"
      />
    </g>
    <path
      d="M417.415 0.706177L425.5 8.91907V41.9386L417.404 50.7062H10.3613L0.5 41.9093V8.94739L10.3535 0.706177H417.415Z"
      stroke="#44190C"
    />
    <defs>
      <filter
        id="filter0_i_127_502"
        x="0"
        y="0.206177"
        width="426"
        height="51"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.549298 0 0 0 0 0.351955 0 0 0 0 0.043292 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="shape"
          result="effect1_innerShadow_127_502"
        />
      </filter>
    </defs>
  </svg>
);

export default KPInputBackground;

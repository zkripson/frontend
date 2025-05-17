const RadioIcon = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_i_796_2154)">
      <circle cx="6" cy="6" r="6" fill="#C34B4B" />
    </g>
    <circle cx="6" cy="6" r="5.5" stroke="#44190C" />
    <defs>
      <filter
        id="filter0_i_796_2154"
        x="0"
        y="0"
        width={size}
        height={size}
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
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
        <feOffset dy="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.388235 0 0 0 0 0.160784 0 0 0 0 0.0941176 0 0 0 1 0"
        />
        <feBlend
          mode="normal"
          in2="shape"
          result="effect1_innerShadow_796_2154"
        />
      </filter>
    </defs>
  </svg>
);

export default RadioIcon;

const ShareIcon: React.FC<IconProps> = ({ width = 28, height = 26 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 27 29"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] lg:w-[28px] lg:h-[28px] -ml-1"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M3.11735 15.6947V21.7493L9.69603 15.1707V28.64H17.1094V15.1707L23.6854 21.7493V15.6947L13.3507 5.35733L3.11735 15.6947ZM26.4014 10.6827H23.06V5.252C23.06 4.52266 22.4334 3.89467 21.7027 3.89467H5.1027C4.36804 3.89467 3.74404 4.52266 3.74404 5.252V10.6827H0.401367V5.252C0.401367 2.64266 2.4907 0.554665 5.1027 0.554665H21.7027C24.3147 0.554665 26.4014 2.64266 26.4014 5.252V10.6827Z"
      fill="white"
    />
  </svg>
);

export default ShareIcon;

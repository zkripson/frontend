const InfoCircleIcon = ({
  fill = "#632918",
  height = 18,
  width = 18,
}: IconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.99929 16.274C12.9993 16.274 16.272 13.0012 16.272 9.00124C16.272 5.00124 12.9993 1.72852 8.99929 1.72852C4.99929 1.72852 1.72656 5.00124 1.72656 9.00124C1.72656 13.0012 4.99929 16.274 8.99929 16.274Z"
      stroke={fill}
      strokeWidth="1.09091"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 6.0918V9.72816"
      stroke={fill}
      strokeWidth="1.09091"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.99512 11.9102H9.00165"
      stroke={fill}
      strokeWidth="1.45455"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default InfoCircleIcon;

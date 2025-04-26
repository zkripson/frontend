import classNames from "classnames";
import { motion } from "framer-motion";
import KPLoader from "../loader";

const KPButton = ({
  title,
  className,
  disabled,
  fullWidth = false,
  loading,
  onClick,
  type,
  variant = "primary",
  isMachine = false,
}: IKPButton) => {
  const shadowColor = {
    primary: "#632918",
    secondary: "#5D656E",
    tertiary: "#F4F5F6",
  }[variant];

  const innerShadow = `inset 0px 4px 0px 0px ${shadowColor}`;

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.95 }}
      className={classNames(
        `flex justify-center items-center border rounded-[4px]`,
        {
          "w-full": fullWidth,
          "bg-primary-200 border-primary-300": variant === "primary",
          "bg-primary-250 border-primary-350": variant === "secondary",
          "bg-primary-150 border-primary-400": variant === "tertiary",
          "h-[52px]": isMachine,
        },
        className
      )}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      style={{
        boxShadow: innerShadow,
      }}
    >
      {loading && <KPLoader variant="small" />}

      {!loading && (
        <span
          className={classNames(
            "uppercase text-[26px] leading-[100%] tracking-[2%] mt-3",
            {
              "text-white": variant === "primary" || variant === "secondary",
              "text-primary-100": variant === "tertiary",
              "font-MachineStd": isMachine,
              "font-Inter": !isMachine,
            }
          )}
        >
          {title}
        </span>
      )}
    </motion.button>
  );
};

export default KPButton;

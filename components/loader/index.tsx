import { motion } from "framer-motion";

import { LoadingIcon } from "@/public/icons";

const KPLoader = ({ variant = "small", color }: IKPLoader) => {
  let width, height;

  switch (variant) {
    case "small":
      width = 20;
      height = 20;
      break;
    case "medium":
      width = 30;
      height = 30;
      break;
    case "large":
      width = 40;
      height = 40;
      break;
  }

  return (
    <motion.div
      animate={{
        rotate: 360,
        transition: {
          duration: 2,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      }}
    >
      <LoadingIcon fill={color} width={width} height={height} />
    </motion.div>
  );
};

export default KPLoader;

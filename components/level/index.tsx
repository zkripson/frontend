import { usePrivy } from "@privy-io/react-auth";

import { StarIcon } from "@/public/icons";

const KPLevel = () => {
  const { user, ready } = usePrivy();

  if (!ready || !user) {
    return null;
  }

  return (
    <div className="px-2 h-6 bg-primary-50 rounded-full flex items-center gap-1 border border-primary-300">
      <StarIcon />
      <span className="text-[12px] text-primary-300 font-medium -mb-0.5">
        Level 2
      </span>
    </div>
  );
};

export default KPLevel;

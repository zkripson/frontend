import { usePrivy } from "@privy-io/react-auth";

import { ArrowRightAltIcon, StarIcon } from "@/public/icons";
import Link from "next/link";

const KPLevel = () => {
  const { user, ready } = usePrivy();

  if (!ready || !user) {
    return null;
  }

  return (
    <Link
      href="/rewards"
      className="px-2 h-6 bg-primary-50 rounded-full flex items-center gap-1 border border-primary-300"
    >
      <StarIcon fill="#44190C" width={14} height={14} />
      <span className="text-[12px] text-primary-300 font-medium -mb-0.5">
        Level 2
      </span>
      <ArrowRightAltIcon size="16" />
    </Link>
  );
};

export default KPLevel;

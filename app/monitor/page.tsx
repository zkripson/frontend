"use client";

import useAdminActions from "@/store/admin/actions";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useMemo } from "react";

export default function MonitorScreen() {
  const { fetchMetrics, fetchHealth } = useAdminActions();
  const { user } = usePrivy();

  const isAdmin = useMemo(() => {
    if (!user?.id) return false;

    const adminsString = process.env.NEXT_PUBLIC_ADMINS;
    if (!adminsString) return false;

    try {
      // Remove brackets and split by comma, then trim whitespace
      const cleanedString = adminsString.replace(/^\[|\]$/g, "");
      const adminIds = cleanedString.split(",").map((id) => id.trim());

      return adminIds.includes(user.id);
    } catch (error) {
      console.error("Error parsing NEXT_PUBLIC_ADMINS:", error);
      return false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAdmin) {
      fetchMetrics();
      fetchHealth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  return (
    <div>
      <div>{isAdmin ? "fetching admin data" : "access denied"}</div>
    </div>
  );
}

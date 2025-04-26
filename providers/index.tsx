"use client";
// import PrivyWalletProvider from "./PrivyProvider";
import { ReduxProvider } from "./ReduxProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ReduxProvider>{children}</ReduxProvider>;
};

export default Providers;

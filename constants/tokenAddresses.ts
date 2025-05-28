import { isDevEnv } from "@/providers/PrivyProvider";

const usdcBaseSepolia = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const usdcBase = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const shipBaseSepolia = "0x8853F0c059C27527d33D02378E5E4F6d5afB574a";
const shipBase = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02912";
const bettingBaseSepolia = "0x31985259fECd3C35f969FB3AfAcb3f98D2daeef8";
const bettingBase = "0x2b859551fBC83219abf2C4965333013DC972D228";

const TOKEN_ADDRESSES = {
  USDC: isDevEnv ? usdcBaseSepolia : usdcBase,
  SHIP: isDevEnv ? shipBaseSepolia : shipBase,
  BETTING: isDevEnv ? bettingBaseSepolia : bettingBase,
} as const;

export default TOKEN_ADDRESSES;

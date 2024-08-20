import type { AnyJson } from "@polkadot/types/types/codec";
import { InputEditedType, WalletConnectSteps } from "./enum";

export type LpTokenAsset = {
  balance: string;
  extra: string | null;
  reason: string;
  status: string;
};

export type PoolCardProps = {
  name: string;
  lpTokenAsset: LpTokenAsset | null;
  lpTokenId: string | null;
  assetTokenId: string;
  totalTokensLocked: {
    nativeToken: Token;
    assetToken: Token;
  };
};

export type InputEditedProps = {
  inputType: InputEditedType;
};

export type TokenProps = {
  tokenSymbol: string;
  tokenId: string;
  decimals: string;
  tokenBalance: string;
};

export type TokenBalanceData = {
  balance: number;
  ss58Format: AnyJson;
  existentialDeposit: string;
  tokenDecimals: string;
  tokenSymbol: string;
  assets: any;
};

export type UrlParamType = {
  id: string;
};

export type PoolsTokenMetadata = {
  tokenId: string;
  assetTokenMetadata: any;
  tokenAsset: {
    balance: number | undefined;
  };
};

export type ModalStepProps = {
  step: WalletConnectSteps;
};

export type TokenDecimalsErrorProps = {
  tokenSymbol: string;
  decimalsAllowed: number;
  isError: boolean;
};

export type Token = {
  id?: string;
  icon: string;
  value: string;
  decimals: string;
  formattedValue: string;
};

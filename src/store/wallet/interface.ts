import { ApiPromise } from "@polkadot/api";
import { ActionType } from "../../app/types/enum";
import { TokenBalanceData } from "../../app/types";
import type { WalletAccount } from "@talismn/connect-wallets";
import { InjectedExtension } from "@polkadot/extension-inject/types";

export interface WalletState {
  api: ApiPromise | null;
  accounts: WalletAccount[];
  extensions: InjectedExtension[];
  selectedAccount: WalletAccount;
  tokenBalances: TokenBalanceData | null;
  walletConnectLoading: boolean;
  assetLoading: boolean;
  blockHashFinalized: string;
}

export type WalletAction =
  | { type: ActionType.SET_API; payload: ApiPromise }
  | { type: ActionType.SET_ACCOUNTS; payload: WalletAccount[] }
  | { type: ActionType.SET_SELECTED_ACCOUNT; payload: WalletAccount }
  | { type: ActionType.SET_TOKEN_BALANCES; payload: TokenBalanceData }
  | { type: ActionType.SET_WALLET_CONNECT_LOADING; payload: boolean }
  | { type: ActionType.SET_WALLET_EXTENSIONS; payload: InjectedExtension[] }
  | { type: ActionType.SET_ASSET_LOADING; payload: boolean }
  | { type: ActionType.SET_BLOCK_HASH_FINALIZED; payload: string };

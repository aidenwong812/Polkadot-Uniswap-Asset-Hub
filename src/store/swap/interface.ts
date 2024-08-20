import { ActionType } from "../../app/types/enum";

export interface SwapState {
  swapFinalized: boolean;
  swapGasFeesMessage: string;
  swapGasFee: string;
  swapLoading: boolean;
  swapExactInTokenAmount: string;
  swapExactOutTokenAmount: string;
  isTokenCanNotCreateWarningSwap: boolean;
}

export type SwapAction =
  | { type: ActionType.SET_SWAP_FINALIZED; payload: boolean }
  | { type: ActionType.SET_SWAP_GAS_FEES_MESSAGE; payload: string }
  | { type: ActionType.SET_SWAP_GAS_FEE; payload: string }
  | { type: ActionType.SET_SWAP_LOADING; payload: boolean }
  | { type: ActionType.SET_SWAP_EXACT_IN_TOKEN_AMOUNT; payload: string }
  | { type: ActionType.SET_SWAP_EXACT_OUT_TOKEN_AMOUNT; payload: string }
  | { type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_SWAP; payload: boolean };

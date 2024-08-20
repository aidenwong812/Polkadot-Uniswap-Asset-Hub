import { ActionType } from "../../app/types/enum";
import { PoolAction, PoolsState } from "./interface";

export const initialPoolsState: PoolsState = {
  pools: [],
  poolsCards: [],
  successModalOpen: false,
  poolLiquidityAdded: null,
  poolAssetTokenData: { tokenSymbol: "", assetTokenId: "", decimals: "" },
  transferGasFeesMessage: "",
  poolGasFee: "",
  addLiquidityGasFee: "",
  poolCardSelected: null,
  poolsTokenMetadata: [],
  createPoolLoading: false,
  addLiquidityLoading: false,
  withdrawLiquidityLoading: false,
  exactNativeTokenAddLiquidity: "0",
  exactAssetTokenAddLiquidity: "0",
  exactNativeTokenWithdraw: "0",
  exactAssetTokenWithdraw: "0",
  isTokenCanNotCreateWarningPools: false,
};

export const poolsReducer = (state: PoolsState, action: PoolAction): PoolsState => {
  switch (action.type) {
    case ActionType.SET_POOLS:
      return { ...state, pools: action.payload };
    case ActionType.SET_SUCCESS_MODAL_OPEN:
      return { ...state, successModalOpen: action.payload };
    case ActionType.SET_POOL_LIQUIDITY:
      return { ...state, poolLiquidityAdded: action.payload };
    case ActionType.SET_POOL_ASSET_TOKEN_DATA:
      return { ...state, poolAssetTokenData: action.payload };
    case ActionType.SET_TRANSFER_GAS_FEES_MESSAGE:
      return { ...state, transferGasFeesMessage: action.payload };
    case ActionType.SET_POOL_GAS_FEE:
      return { ...state, poolGasFee: action.payload };
    case ActionType.SET_ADD_LIQUIDITY_GAS_FEE:
      return { ...state, addLiquidityGasFee: action.payload };
    case ActionType.SET_POOLS_CARDS:
      return { ...state, poolsCards: action.payload };
    case ActionType.SET_POOL_CARD_SELECTED:
      return { ...state, poolCardSelected: action.payload };
    case ActionType.SET_POOLS_TOKEN_METADATA:
      return { ...state, poolsTokenMetadata: action.payload };
    case ActionType.SET_CREATE_POOL_LOADING:
      return { ...state, createPoolLoading: action.payload };
    case ActionType.SET_ADD_LIQUIDITY_LOADING:
      return { ...state, addLiquidityLoading: action.payload };
    case ActionType.SET_WITHDRAW_LIQUIDITY_LOADING:
      return { ...state, withdrawLiquidityLoading: action.payload };
    case ActionType.SET_EXACT_NATIVE_TOKEN_ADD_LIQUIDITY:
      return { ...state, exactNativeTokenAddLiquidity: action.payload };
    case ActionType.SET_EXACT_ASSET_TOKEN_ADD_LIQUIDITY:
      return { ...state, exactAssetTokenAddLiquidity: action.payload };
    case ActionType.SET_EXACT_NATIVE_TOKEN_WITHDRAW:
      return { ...state, exactNativeTokenWithdraw: action.payload };
    case ActionType.SET_EXACT_ASSET_TOKEN_WITHDRAW:
      return { ...state, exactAssetTokenWithdraw: action.payload };
    case ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_POOLS:
      return { ...state, isTokenCanNotCreateWarningPools: action.payload };
    default:
      return state;
  }
};

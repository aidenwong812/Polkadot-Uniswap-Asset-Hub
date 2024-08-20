import { WalletAction } from "../../store/wallet/interface";
import { PoolAction } from "../../store/pools/interface";
import { useEffect, useReducer } from "react";
import {
  initialPoolsState,
  initialSwapState,
  initialWalletState,
  poolsReducer,
  swapReducer,
  walletReducer,
} from "../../store";
import { setupPolkadotApi } from "../../services/polkadotWalletServices";
import { ActionType } from "../types/enum";
import { getAllPools, getAllLiquidityPoolsTokensMetadata } from "../../services/poolServices";
import dotAcpToast from "../util/toast";
import { SwapAction } from "../../store/swap/interface";

const useStateAndDispatch = () => {
  const [walletState, dispatchWallet] = useReducer(walletReducer, initialWalletState);
  const [poolsState, dispatchPools] = useReducer(poolsReducer, initialPoolsState);
  const [swapState, dispatchSwap] = useReducer(swapReducer, initialSwapState);

  const state = { ...walletState, ...poolsState, ...swapState };

  const dispatch = (action: WalletAction | PoolAction | SwapAction) => {
    dispatchWallet(action as WalletAction);
    dispatchPools(action as PoolAction);
    dispatchSwap(action as SwapAction);
  };

  useEffect(() => {
    const callApiSetup = async () => {
      try {
        const polkaApi = await setupPolkadotApi();
        dispatch({ type: ActionType.SET_API, payload: polkaApi });
        const pools = await getAllPools(polkaApi);
        const poolsTokenMetadata = await getAllLiquidityPoolsTokensMetadata(polkaApi);

        if (pools) {
          dispatch({ type: ActionType.SET_POOLS, payload: pools });
          dispatch({ type: ActionType.SET_POOLS_TOKEN_METADATA, payload: poolsTokenMetadata });
        }
      } catch (error) {
        dotAcpToast.error(`Error setting up Polkadot API: ${error}`);
      }
    };

    callApiSetup().then();
  }, []);

  return { state, dispatch };
};

export default useStateAndDispatch;

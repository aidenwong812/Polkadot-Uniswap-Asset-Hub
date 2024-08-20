import { FC, createContext, Dispatch, useContext, ReactNode } from "react";
import { WalletState, WalletAction } from "../store/wallet/interface";
import { PoolsState, PoolAction } from "../store/pools/interface";
import { SwapAction, SwapState } from "../store/swap/interface";

interface AppContextType {
  state: WalletState & PoolsState & SwapState;
  dispatch: Dispatch<WalletAction | PoolAction | SwapAction>;
}

interface AppStateProviderProps {
  children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppStateProvider: FC<AppStateProviderProps & AppContextType> = (props) => {
  const { children, state, dispatch } = props;

  if (!children) {
    throw new Error("AppStateProvider must have children");
  }

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

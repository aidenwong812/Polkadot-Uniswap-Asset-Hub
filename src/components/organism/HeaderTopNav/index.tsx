import classNames from "classnames";
import { NavLink, useLocation } from "react-router-dom";
import { POOLS_ROUTE, SWAP_ROUTE } from "../../../app/router/routes.ts";
import AccountImage from "../../../assets/img/account-image-icon.svg?react";
import Logo from "../../../assets/img/logo-icon.svg?react";
import { ActionType, ButtonVariants, NetworkKeys, WalletConnectSteps } from "../../../app/types/enum.ts";
import { reduceAddress } from "../../../app/util/helper";
import {
  connectWalletAndFetchBalance,
  getSupportedWallets,
  handleDisconnect,
} from "../../../services/polkadotWalletServices";
import { useAppContext } from "../../../state";
import Button from "../../atom/Button/index.tsx";
import { t } from "i18next";
import { useEffect, useState } from "react";
import WalletConnectModal from "../WalletConnectModal/index.tsx";
import LocalStorage from "../../../app/util/localStorage.ts";
import { ModalStepProps } from "../../../app/types/index.ts";
import type { Timeout } from "react-number-format/types/types";
import type { Wallet, WalletAccount } from "@talismn/connect-wallets";
import dotAcpToast from "../../../app/util/toast.ts";
import { LottieSmall } from "../../../assets/loader/index.tsx";
import NetworkSelector from "../../atom/NetworkSelector/index.tsx";

const HeaderTopNav = () => {
  const { state, dispatch } = useAppContext();
  const { walletConnectLoading, api } = state;
  const location = useLocation();

  const [walletAccount, setWalletAccount] = useState<WalletAccount>({} as WalletAccount);
  const [modalStep, setModalStep] = useState<ModalStepProps>({ step: WalletConnectSteps.stepExtensions });
  const [walletConnectOpen, setWalletConnectOpen] = useState(false);
  const [supportedWallets, setSupportedWallets] = useState<Wallet[]>([] as Wallet[]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const walletConnected = LocalStorage.get("wallet-connected");

  const connectWallet = () => {
    setWalletConnectOpen(true);
  };

  const handleConnect = async (account: WalletAccount) => {
    try {
      setWalletConnectOpen(false);
      await connectWalletAndFetchBalance(dispatch, api, account);
    } catch (error) {
      dotAcpToast.error(`Error connecting: ${error}`);
    }
  };

  const onBack = () => {
    setModalStep({ step: WalletConnectSteps.stepExtensions });
  };

  const disconnectWallet = () => {
    handleDisconnect(dispatch);
    setWalletAccount({} as WalletAccount);
    setModalStep({ step: WalletConnectSteps.stepExtensions });
    dispatch({
      type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
      payload: "",
    });
    dispatch({
      type: ActionType.SET_SWAP_GAS_FEE,
      payload: "",
    });
  };

  useEffect(() => {
    if (walletConnected) {
      setWalletAccount(walletConnected);
    }
  }, [walletConnected?.address]);

  useEffect(() => {
    let timeout: Timeout;
    if (!walletConnectOpen) {
      timeout = setTimeout(() => setModalStep({ step: WalletConnectSteps.stepExtensions }), 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [walletConnectOpen]);

  useEffect(() => {
    const wallets = getSupportedWallets();
    setSupportedWallets(wallets);
  }, []);

  return (
    <>
      <nav className="flex h-[73px] items-center justify-between px-[23px]">
        <div className="w-[400px]">
          <Logo />
        </div>
        <div className="flex gap-16 text-gray-200">
          <NavLink
            to={SWAP_ROUTE}
            className={classNames("font-unbounded-variable tracking-[.96px]", {
              "text-gray-400": location.pathname.includes(SWAP_ROUTE),
            })}
          >
            {t("button.swap")}
          </NavLink>
          <NavLink
            to={POOLS_ROUTE}
            className={classNames("font-unbounded-variable tracking-[.96px]", {
              "text-gray-400": location.pathname.includes(POOLS_ROUTE),
            })}
          >
            {t("button.pool")}
          </NavLink>
        </div>

        <div className="flex w-[400px] items-center gap-8">
          <NetworkSelector
            items={[
              { name: NetworkKeys.Rococo },
              { name: NetworkKeys.Westend },
              { name: NetworkKeys.Kusama },
              { name: NetworkKeys.Polkadot },
            ]}
            networkSelected={window.localStorage.getItem("network") as NetworkKeys}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
          />
          {walletConnected ? (
            <>
              {walletConnectLoading ? (
                <Button
                  onClick={connectWallet}
                  variant={ButtonVariants.btnPrimaryPinkLg}
                  disabled={walletConnectLoading}
                >
                  <LottieSmall />
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-[26px]">
                  <div className="flex flex-col text-gray-300">
                    <div className="font-[500]">{walletAccount?.name || "Account"}</div>
                    <div className="text-small">{reduceAddress(walletAccount?.address, 6, 6)}</div>
                  </div>
                  <div>
                    <button onClick={() => disconnectWallet()}>
                      <AccountImage />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Button onClick={connectWallet} variant={ButtonVariants.btnPrimaryPinkLg} disabled={walletConnectLoading}>
              {walletConnectLoading ? <LottieSmall /> : t("button.connectWallet")}
            </Button>
          )}
        </div>
      </nav>

      <WalletConnectModal
        title="Connect a Wallet"
        open={walletConnectOpen}
        onClose={() => setWalletConnectOpen(false)}
        onBack={modalStep.step === WalletConnectSteps.stepAddresses ? onBack : undefined}
        modalStep={modalStep}
        setModalStep={setModalStep}
        setWalletConnectOpen={setWalletConnectOpen}
        supportedWallets={supportedWallets}
        handleConnect={handleConnect}
      />
    </>
  );
};

export default HeaderTopNav;

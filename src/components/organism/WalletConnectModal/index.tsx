import Button from "../../atom/Button";
import Modal from "../../atom/Modal";
import RandomTokenIcon from "../../../assets/img/random-token-icon.svg?react";
import { useState } from "react";
import { WalletConnectSteps } from "../../../app/types/enum";
import { ModalStepProps } from "../../../app/types";
import type { Wallet, WalletAccount } from "@talismn/connect-wallets";

interface WalletConnectModalProps {
  open: boolean;
  title: string;
  modalStep: ModalStepProps;
  supportedWallets: Wallet[];
  setModalStep: (step: ModalStepProps) => void;
  handleConnect: (account: WalletAccount) => void;
  onClose: () => void;
  setWalletConnectOpen: (isOpen: boolean) => void;
  onBack?: () => void | undefined;
}

const WalletConnectModal = ({
  open,
  title,
  modalStep,
  supportedWallets,
  onClose,
  onBack,
  setModalStep,
  handleConnect,
}: WalletConnectModalProps) => {
  const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>([]);

  const handleContinueClick = (accounts: WalletAccount[]) => {
    setModalStep({ step: WalletConnectSteps.stepAddresses });
    setWalletAccounts(accounts);
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={title} onBack={onBack}>
      <div className="flex min-w-[450px] flex-col gap-5 p-4">
        {modalStep?.step === WalletConnectSteps.stepExtensions
          ? supportedWallets?.map((wallet: Wallet) => {
              return (
                <div key={wallet?.extensionName} className="flex cursor-pointer items-center gap-5">
                  <div className="flex basis-16">
                    <img src={wallet?.logo?.src} alt={wallet?.logo?.alt} width={36} height={36} />
                  </div>
                  <span className="flex basis-full items-center">{wallet?.title}</span>
                  <div className="flex basis-24 items-center">
                    {wallet?.installed ? (
                      <Button
                        className="btn-secondary-white"
                        onClick={async () => {
                          await wallet?.enable("DOT-ACP");
                          const accounts: WalletAccount[] = await wallet?.getAccounts();
                          handleContinueClick(accounts);
                        }}
                      >
                        Continue
                      </Button>
                    ) : (
                      <a href={wallet?.installUrl} target="blank">
                        Install
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          : null}
        {modalStep.step === WalletConnectSteps.stepAddresses
          ? walletAccounts?.map((account: WalletAccount, index: any) => {
              return (
                <div key={index} className="flex cursor-pointer flex-col rounded-lg bg-purple-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <RandomTokenIcon />
                    <button className="flex flex-col items-start" onClick={() => handleConnect(account)}>
                      <div className="text-base font-medium text-gray-300">{account?.name}</div>
                      <div className="text-xs font-normal text-gray-300">{account?.address}</div>
                    </button>
                  </div>
                </div>
              );
            })
          : null}
      </div>
    </Modal>
  );
};

export default WalletConnectModal;

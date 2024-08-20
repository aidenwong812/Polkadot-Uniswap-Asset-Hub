import classNames from "classnames";
import { FC } from "react";
import { TokenProps } from "../../../app/types";
import { formatDecimalsFromToken } from "../../../app/util/helper";
import DotToken from "../../../assets/img/dot-token.svg?react";
import CheckIcon from "../../../assets/img/selected-token-check.svg?react";
import Modal from "../../atom/Modal";

interface SelectTokenPayload {
  id: string;
  assetSymbol: string;
  decimals: string;
  assetTokenBalance: string;
}
interface SwapSelectTokenModalProps {
  open: boolean;
  title: string;
  tokensData: TokenProps[];
  selected: TokenProps;
  onClose: () => void;
  onSelect: (tokenData: TokenProps) => void;
}

const SwapSelectTokenModal: FC<SwapSelectTokenModalProps> = ({
  open,
  title,
  tokensData,
  selected,
  onClose,
  onSelect,
}) => {
  const handleSelectToken = (payload: SelectTokenPayload) => {
    const assetTokenData: TokenProps = {
      tokenSymbol: payload.assetSymbol,
      tokenId: payload.id,
      decimals: payload.decimals,
      tokenBalance: payload.assetTokenBalance,
    };
    onSelect(assetTokenData);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={title}>
      <div className="max-h-[504px] overflow-y-auto">
        {tokensData.length > 0 ? (
          <>
            {tokensData?.map((item: any, index: number) => (
              <div key={index} className="group flex min-w-[498px] flex-col hover:rounded-md hover:bg-purple-800">
                <button
                  className={classNames("flex items-center gap-3 px-4 py-3", {
                    "rounded-md bg-purple-200 hover:bg-purple-800": item.tokenId === selected.tokenId,
                  })}
                  onClick={() =>
                    handleSelectToken({
                      id: item.tokenId,
                      assetSymbol: item.assetTokenMetadata.symbol,
                      decimals: item.assetTokenMetadata.decimals,
                      assetTokenBalance: item.tokenAsset.balance,
                    })
                  }
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex gap-3">
                      <div>
                        <DotToken width={36} height={36} />
                      </div>
                      <div className="flex flex-col items-start">
                        <div
                          className={classNames("text-gray-400 group-hover:text-white", {
                            "text-black": item.tokenId === selected.tokenId,
                          })}
                        >
                          {item.assetTokenMetadata.name}
                        </div>
                        <div
                          className={classNames("text-small text-gray-300 group-hover:text-white", {
                            "text-black": item.tokenId === selected.tokenId,
                          })}
                        >
                          {item.assetTokenMetadata.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="text-[12px] group-hover:text-white">
                        {item.tokenId && item.tokenAsset.balance !== 0
                          ? formatDecimalsFromToken(
                              Number(item.tokenAsset.balance.replace(/[, ]/g, "")),
                              item.assetTokenMetadata.decimals
                            )
                          : item.tokenAsset.balance}
                      </div>
                      {item.tokenId === selected.tokenId ? <CheckIcon /> : null}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </>
        ) : (
          <div className="min-w-[498px] pr-6">
            <div className="flex items-center justify-center gap-3 px-4 py-3">No Asset found in wallet</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SwapSelectTokenModal;

import { FC } from "react";
import classNames from "classnames";
import DotToken from "../../../assets/img/dot-token.svg?react";
import { ActionType } from "../../../app/types/enum";
import { formatDecimalsFromToken } from "../../../app/util/helper";
import { useAppContext } from "../../../state";
import CheckIcon from "../../../assets/img/selected-token-check.svg?react";
import Modal from "../../atom/Modal";

type TokenProps = {
  tokenSymbol: string;
  assetTokenId: string;
  decimals: string;
  assetTokenBalance: string;
};

interface PoolSelectTokenModalProps {
  open: boolean;
  title: string;
  selected?: TokenProps;
  onClose: () => void;
  onSelect: (tokenData: TokenProps) => void;
}

const PoolSelectTokenModal: FC<PoolSelectTokenModalProps> = ({ open, title, selected, onClose, onSelect }) => {
  const { state, dispatch } = useAppContext();
  const { tokenBalances } = state;

  const handlePoolAssetTokeData = (id: string, assetSymbol: string, decimals: string, assetTokenBalance: string) => {
    const assetTokenData = {
      tokenSymbol: assetSymbol,
      assetTokenId: id,
      decimals: decimals,
      assetTokenBalance: assetTokenBalance,
    };
    dispatch({ type: ActionType.SET_POOL_ASSET_TOKEN_DATA, payload: assetTokenData });
    onSelect(assetTokenData);
    onClose();
  };

  return (
    <div>
      <Modal isOpen={open} onClose={onClose} title={title}>
        <div className="max-h-[504px] overflow-y-auto">
          {tokenBalances?.assets && tokenBalances?.assets.length > 0 ? (
            tokenBalances?.assets?.map((item: any, index: number) => (
              <div key={index} className="group flex min-w-[498px] flex-col hover:rounded-md hover:bg-purple-800">
                <button
                  className={classNames("flex items-center gap-3 px-4 py-3", {
                    "rounded-md bg-purple-200 hover:bg-purple-800": item.tokenId === selected?.assetTokenId,
                  })}
                  onClick={() =>
                    handlePoolAssetTokeData(
                      item.tokenId,
                      item.assetTokenMetadata.symbol,
                      item.assetTokenMetadata.decimals,
                      item.tokenAsset.balance
                    )
                  }
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex gap-3">
                      <div>
                        <DotToken width={36} height={36} />
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="text-gray-400 group-hover:text-white">{item.assetTokenMetadata.name}</div>
                        <div className="text-small text-gray-300 group-hover:text-white">
                          {item.assetTokenMetadata.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="text-[12px] group-hover:text-white">
                        {item.tokenId
                          ? formatDecimalsFromToken(
                              Number(item.tokenAsset.balance.replace(/[, ]/g, "")),
                              item.assetTokenMetadata.decimals
                            )
                          : item.tokenAsset.balance}
                      </div>
                      {item.tokenId === selected?.assetTokenId ? <CheckIcon /> : null}
                    </div>
                  </div>
                </button>
              </div>
            ))
          ) : (
            <div className="min-w-[498px] pr-6">
              <div className="flex items-center justify-center gap-3 px-4 py-3">No Asset found in wallet</div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PoolSelectTokenModal;

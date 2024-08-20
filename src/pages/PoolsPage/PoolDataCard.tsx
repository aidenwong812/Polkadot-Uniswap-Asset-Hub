import Button from "../../components/atom/Button";
import { ButtonVariants, LiquidityPageType } from "../../app/types/enum";
import AddIconPink from "../../assets/img/add-icon-pink.svg?react";
import { LpTokenAsset } from "../../app/types";
import { t } from "i18next";
import { useNavigate } from "react-router-dom";
import { ADD_LIQUIDITY_TO_EXISTING, REMOVE_LIQUIDITY_FROM_EXISTING } from "../../app/router/routes";
import { urlTo } from "../../app/util/helper";
import { useAppContext } from "../../state";

type PoolDataCardProps = {
  tokenPair: string;
  nativeTokens: string;
  nativeTokenIcon: string;
  assetTokens: string;
  assetTokenIcon: string;
  lpTokenAsset: LpTokenAsset | null;
  assetTokenId: string;
  lpTokenId: string | null;
};

const PoolDataCard = ({
  tokenPair,
  nativeTokens,
  assetTokens,
  lpTokenAsset,
  nativeTokenIcon,
  assetTokenIcon,
  assetTokenId,
  lpTokenId,
}: PoolDataCardProps) => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { tokenBalances, selectedAccount } = state;

  const onDepositClick = () => {
    navigate(urlTo(ADD_LIQUIDITY_TO_EXISTING, { id: assetTokenId }), {
      state: { pageType: LiquidityPageType.addLiquidity },
    });
  };

  const onWithdrawClick = () => {
    navigate(urlTo(REMOVE_LIQUIDITY_FROM_EXISTING, { id: assetTokenId }), {
      state: { pageType: LiquidityPageType.removeLiquidity, lpTokenId: lpTokenId },
    });
  };

  const checkIfDepositDisabled = () => {
    return !tokenBalances?.assets?.find((token: any) => token.tokenId === assetTokenId);
  };

  const checkIfWithdrawDisabled = () => {
    if (lpTokenAsset) {
      if (parseInt(lpTokenAsset?.balance) > 0 && tokenBalances?.balance) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-6">
      <div className="flex gap-2">
        <div className="relative flex basis-2/5 flex-col font-unbounded-variable">
          <div className="relative flex">
            <span className="">
              <img src={nativeTokenIcon} alt="native icon" width={32} height={32} />
            </span>
            <span className="relative right-2">
              <img src={assetTokenIcon} alt="asset icon" width={32} height={32} />
            </span>
          </div>
          {tokenPair}
        </div>
        <div className="flex basis-3/5 flex-col items-end justify-end gap-2">
          <Button
            onClick={() => onDepositClick()}
            variant={ButtonVariants.btnPrimaryGhostSm}
            icon={<AddIconPink width={14} height={14} />}
            disabled={checkIfDepositDisabled()}
            className="group relative"
          >
            {t("button.deposit")}
            {checkIfDepositDisabled() && (
              <div className="invisible absolute bottom-full left-1/2 mb-[10px] w-full -translate-x-1/2 transform rounded-md bg-warning px-2 py-1 font-inter text-medium text-gray-400 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                {tokenBalances?.balance && selectedAccount.address
                  ? t("poolsPage.doNotHaveLiquidityPair")
                  : !tokenBalances?.balance && selectedAccount.address
                    ? t("poolsPage.assetsWait")
                    : t("poolsPage.connectWallet")}
              </div>
            )}
          </Button>
          <Button
            onClick={() => onWithdrawClick()}
            variant={ButtonVariants.btnSecondaryGray}
            disabled={checkIfWithdrawDisabled()}
            className="group relative"
          >
            {t("button.withdraw")}
            {checkIfWithdrawDisabled() && (
              <div className="invisible absolute bottom-full left-1/2 mb-[10px] w-full -translate-x-1/2 transform rounded-md bg-warning px-2 py-1 font-inter text-medium text-gray-400 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                {tokenBalances?.balance && selectedAccount.address
                  ? t("poolsPage.doNotHaveLiquidityPair")
                  : !tokenBalances?.balance && selectedAccount.address
                    ? t("poolsPage.assetsWait")
                    : t("poolsPage.connectWallet")}
              </div>
            )}
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex basis-1/2 flex-col items-center justify-end">
          <div className="flex flex-col items-start">
            <span className="flex gap-1 text-large font-medium">
              <img src={nativeTokenIcon} alt="assetToken" width={16} height={16} />
              {nativeTokens}
            </span>
            <span className="flex gap-1 text-large font-medium">
              <img src={assetTokenIcon} alt="assetToken" width={16} height={16} />
              {assetTokens}
            </span>
          </div>
          <p className="text-small font-medium uppercase text-gray-200">{t("poolDataCard.totalTokensLocked")}</p>
        </div>
        <div className="flex basis-1/2 flex-col items-center justify-end text-large font-medium">
          <span>{lpTokenAsset?.balance ? lpTokenAsset.balance?.replace(/[, ]/g, "") : 0}</span>
          <p className="text-small font-medium uppercase text-gray-200">{t("poolDataCard.lpTokens")}</p>
        </div>
      </div>
    </div>
  );
};

export default PoolDataCard;

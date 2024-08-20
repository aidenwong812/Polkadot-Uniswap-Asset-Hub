import { t } from "i18next";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { POOLS_ADD_LIQUIDITY } from "../../app/router/routes";
import { PoolCardProps } from "../../app/types";
import { ButtonVariants } from "../../app/types/enum";
import TokenIcon from "../../assets/img/token-icon.svg?react";
import { LottieLarge } from "../../assets/loader";
import Button from "../../components/atom/Button";
import { useAppContext } from "../../state";
import PoolDataCard from "./PoolDataCard";

const PoolsPage = () => {
  const { state } = useAppContext();
  const { selectedAccount, pools, poolsCards, tokenBalances } = state;

  const [isPoolsLoading, setPoolsIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (pools.length > 0 && poolsCards.length > 0) {
      setPoolsIsLoading(false);
    }
  }, [pools, poolsCards]);

  const navigateToAddLiquidity = () => {
    navigate(POOLS_ADD_LIQUIDITY);
  };

  return (
    <div className="flex items-center justify-center px-28 pb-16">
      <div className="flex w-full max-w-[1280px] flex-col">
        <div className="flex items-center justify-between px-6 py-8">
          <div className="flex flex-col  gap-[4px] leading-[120%]">
            <div className="font-unbounded-variable text-heading-5 font-[700] tracking-[.046px] text-gray-400">
              {t("poolsPage.pools")}
            </div>
            <div className="tracking-[.2px] text-gray-300">{t("poolsPage.earnFeesByProvidingLiquidity")}</div>
          </div>
          <div>
            {selectedAccount && Object.keys(selectedAccount).length > 0 ? (
              <Button
                onClick={navigateToAddLiquidity}
                variant={ButtonVariants.btnPrimaryPinkLg}
                disabled={selectedAccount && tokenBalances ? false : true}
              >
                {t("button.newPosition")}
              </Button>
            ) : null}
          </div>
        </div>
        {isPoolsLoading ? (
          <div className="mt-60 flex items-center justify-center">
            <LottieLarge />
          </div>
        ) : pools.length > 0 && poolsCards.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {poolsCards.map((item: PoolCardProps, index: number) => {
              return (
                <div key={index}>
                  <PoolDataCard
                    tokenPair={item.name}
                    nativeTokens={item.totalTokensLocked.nativeToken.formattedValue}
                    assetTokens={item.totalTokensLocked.assetToken.formattedValue}
                    lpTokenAsset={item.lpTokenAsset}
                    assetTokenIcon={item.totalTokensLocked.assetToken.icon}
                    nativeTokenIcon={item.totalTokensLocked.nativeToken.icon}
                    assetTokenId={item.assetTokenId}
                    lpTokenId={item.lpTokenId}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-[664px] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6">
            <TokenIcon />
            <div className="text-center text-gray-300">
              {selectedAccount ? t("poolsPage.noActiveLiquidityPositions") : t("poolsPage.connectWalletToView")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PoolsPage;

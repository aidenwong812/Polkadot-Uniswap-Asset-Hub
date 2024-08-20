import classNames from "classnames";
import Decimal from "decimal.js";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useGetNetwork from "../../../app/hooks/useGetNetwork";
import { POOLS_PAGE } from "../../../app/router/routes";
import { LpTokenAsset } from "../../../app/types";
import {
  ActionType,
  ButtonVariants,
  InputEditedType,
  LiquidityPageType,
  TransactionTypes,
} from "../../../app/types/enum";
import {
  calculateSlippageReduce,
  formatDecimalsFromToken,
  formatInputTokenValue,
  truncateDecimalNumber,
} from "../../../app/util/helper";
import dotAcpToast from "../../../app/util/toast";
import BackArrow from "../../../assets/img/back-arrow.svg?react";
import DotToken from "../../../assets/img/dot-token.svg?react";
import AssetTokenIcon from "../../../assets/img/test-token.svg?react";
import { LottieMedium } from "../../../assets/loader";
import { assetTokenData, setTokenBalanceUpdate } from "../../../services/polkadotWalletServices";
import { checkWithdrawPoolLiquidityGasFee, getPoolReserves, removeLiquidity } from "../../../services/poolServices";
import { useAppContext } from "../../../state";
import Button from "../../atom/Button";
import WarningMessage from "../../atom/WarningMessage";
import AmountPercentage from "../../molecule/AmountPercentage";
import TokenAmountInput from "../../molecule/TokenAmountInput";
import PoolSelectTokenModal from "../PoolSelectTokenModal";
import SwapAndPoolSuccessModal from "../SwapAndPoolSuccessModal";
import ReviewTransactionModal from "../ReviewTransactionModal";

type AssetTokenProps = {
  tokenSymbol: string;
  assetTokenId: string;
  decimals: string;
  assetTokenBalance: string;
};
type NativeTokenProps = {
  nativeTokenSymbol: any; //to do
  nativeTokenDecimals: any; //to do
};
type TokenValueProps = {
  tokenValue: string;
};

const WithdrawPoolLiquidity = () => {
  const { state, dispatch } = useAppContext();
  const { assethubSubscanUrl } = useGetNetwork();

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const {
    tokenBalances,
    api,
    selectedAccount,
    pools,
    transferGasFeesMessage,
    successModalOpen,
    withdrawLiquidityLoading,
    exactNativeTokenWithdraw,
    exactAssetTokenWithdraw,
    assetLoading,
    isTokenCanNotCreateWarningPools,
  } = state;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTokenA, setSelectedTokenA] = useState<NativeTokenProps>({
    nativeTokenSymbol: "",
    nativeTokenDecimals: "",
  });
  const [selectedTokenB, setSelectedTokenB] = useState<AssetTokenProps>({
    tokenSymbol: "",
    assetTokenId: "",
    decimals: "",
    assetTokenBalance: "",
  });
  const [selectedTokenNativeValue, setSelectedTokenNativeValue] = useState<TokenValueProps>();
  const [selectedTokenAssetValue, setSelectedTokenAssetValue] = useState<TokenValueProps>();
  const [nativeTokenWithSlippage, setNativeTokenWithSlippage] = useState<TokenValueProps>({ tokenValue: "" });
  const [assetTokenWithSlippage, setAssetTokenWithSlippage] = useState<TokenValueProps>({ tokenValue: "" });
  const [slippageAuto, setSlippageAuto] = useState<boolean>(true);
  const [slippageValue, setSlippageValue] = useState<number | undefined>(15);
  const [lpTokensAmountToBurn, setLpTokensAmountToBurn] = useState<string>("");
  const [minimumTokenAmountExceeded, setMinimumTokenAmountExceeded] = useState<boolean>(false);
  const [withdrawAmountPercentage, setWithdrawAmountPercentage] = useState<number>(100);
  const [maxPercentage, setMaxPercentage] = useState<number>(100);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [isTransactionTimeout, setIsTransactionTimeout] = useState<boolean>(false);
  const [waitingForTransaction, setWaitingForTransaction] = useState<NodeJS.Timeout>();
  const [assetBPriceOfOneAssetA, setAssetBPriceOfOneAssetA] = useState<string>("");
  const [priceImpact, setPriceImpact] = useState<string>("");

  const navigateToPools = () => {
    navigate(POOLS_PAGE);
  };

  const populateAssetToken = () => {
    pools?.forEach(async (pool: any) => {
      if (pool?.[0]?.[1]?.interior?.X2) {
        if (pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "").toString() === params?.id) {
          if (params?.id) {
            if (api) {
              const tokenAlreadySelected: any = await assetTokenData(params?.id, api);
              if (tokenAlreadySelected) {
                setSelectedTokenB({
                  tokenSymbol: tokenAlreadySelected?.assetTokenMetadata?.symbol,
                  assetTokenId: params?.id,
                  decimals: tokenAlreadySelected?.assetTokenMetadata?.decimals,
                  assetTokenBalance: "0",
                });
              }
            }
          }
        }
      }
    });
  };

  const handlePool = async () => {
    setReviewModalOpen(false);
    const lpToken = Math.floor(Number(lpTokensAmountToBurn) * (withdrawAmountPercentage / 100)).toString();
    if (waitingForTransaction) {
      clearTimeout(waitingForTransaction);
    }
    setIsTransactionTimeout(false);

    try {
      if (api) {
        await removeLiquidity(
          api,
          selectedTokenB.assetTokenId,
          selectedAccount,
          lpToken,
          nativeTokenWithSlippage.tokenValue.toString(),
          assetTokenWithSlippage.tokenValue.toString(),
          selectedTokenA.nativeTokenDecimals,
          selectedTokenB.decimals,
          dispatch
        );
      }
    } catch (error) {
      dotAcpToast.error(`Error: ${error}`);
    }
  };

  const handleWithdrawPoolLiquidityGasFee = async () => {
    if (api)
      await checkWithdrawPoolLiquidityGasFee(
        api,
        selectedTokenB.assetTokenId,
        selectedAccount,
        lpTokensAmountToBurn,
        nativeTokenWithSlippage.tokenValue.toString(),
        assetTokenWithSlippage.tokenValue.toString(),
        dispatch
      );
  };

  const closeSuccessModal = async () => {
    dispatch({ type: ActionType.SET_SUCCESS_MODAL_OPEN, payload: false });
    navigateToPools();
    if (api) {
      const walletAssets: any = await setTokenBalanceUpdate(
        api,
        selectedAccount.address,
        selectedTokenB.assetTokenId,
        tokenBalances
      );
      dispatch({ type: ActionType.SET_TOKEN_BALANCES, payload: walletAssets });
    }
  };

  useEffect(() => {
    if (Object.keys(selectedAccount).length === 0) {
      navigateToPools();
    }
  }, [selectedAccount]);

  useEffect(() => {
    dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_POOLS, payload: false });
  }, [selectedTokenB.assetTokenId, selectedTokenNativeValue, selectedTokenAssetValue]);

  const getWithdrawButtonProperties = useMemo(() => {
    if (tokenBalances?.assets) {
      if (selectedTokenA && selectedTokenB) {
        if (minimumTokenAmountExceeded) {
          return { label: t("button.minimumTokenAmountExceeded"), disabled: true };
        } else {
          return { label: t("button.withdraw"), disabled: false };
        }
      }
    } else {
      return { label: t("button.connectWallet"), disabled: true };
    }

    return { label: "", disabled: true };
  }, [selectedTokenA.nativeTokenDecimals, selectedTokenB.decimals, minimumTokenAmountExceeded]);

  const getNativeAndAssetTokensFromPool = async () => {
    if (api) {
      const res: any = await getPoolReserves(api, selectedTokenB.assetTokenId);

      const assetTokenInfo: any = await api.query.assets.asset(selectedTokenB.assetTokenId);
      const assetTokenInfoMinBalance = assetTokenInfo?.toHuman()?.minBalance?.replace(/[, ]/g, "");
      const nativeTokenExistentialDeposit = tokenBalances?.existentialDeposit.replace(/[, ]/g, "");
      const lpTokenTotalAsset: any = await api.query.poolAssets.asset(location?.state?.lpTokenId);

      const lpTotalAssetSupply = lpTokenTotalAsset.toHuman()?.supply?.replace(/[, ]/g, "");

      const lpTokenUserAccount = await api.query.poolAssets.account(
        location?.state?.lpTokenId,
        selectedAccount?.address
      );

      const lpTokenUserAsset = lpTokenUserAccount.toHuman() as LpTokenAsset;
      const lpTokenUserAssetBalance = parseInt(lpTokenUserAsset?.balance?.replace(/[, ]/g, ""));

      setLpTokensAmountToBurn(lpTokenUserAssetBalance.toFixed(0));

      if (res && slippageValue) {
        const nativeTokenInPool = new Decimal(res[0]?.replace(/[, ]/g, ""));
        const nativeTokenOut = nativeTokenInPool
          .mul(new Decimal(lpTokenUserAssetBalance).toNumber())
          .dividedBy(new Decimal(lpTotalAssetSupply).toNumber())
          .floor();

        const assetInPool = new Decimal(res[1]?.replace(/[, ]/g, ""));
        const assetOut = assetInPool
          .mul(new Decimal(lpTokenUserAssetBalance).toNumber())
          .dividedBy(new Decimal(lpTotalAssetSupply).toNumber())
          .floor();

        const nativeTokenOutFormatted = new Decimal(
          formatDecimalsFromToken(nativeTokenOut, selectedTokenA?.nativeTokenDecimals)
        )
          .mul(withdrawAmountPercentage)
          .div(100);
        const assetOutFormatted = new Decimal(formatDecimalsFromToken(assetOut, selectedTokenB?.decimals))
          .mul(withdrawAmountPercentage)
          .div(100);

        const nativeTokenOutSlippage = calculateSlippageReduce(nativeTokenOutFormatted, slippageValue);
        const nativeTokenOutSlippageFormatted = formatInputTokenValue(
          nativeTokenOutSlippage,
          selectedTokenA?.nativeTokenDecimals
        );

        const assetOutSlippage = calculateSlippageReduce(assetOutFormatted, slippageValue);
        const assetOutSlippageFormatted = formatInputTokenValue(assetOutSlippage, selectedTokenB?.decimals);

        const minimumTokenAmountExceededCheck =
          assetInPool.sub(assetOut.mul(withdrawAmountPercentage).div(100)).lte(assetTokenInfoMinBalance) ||
          nativeTokenInPool
            .sub(nativeTokenOut.mul(withdrawAmountPercentage).div(100))
            .lte(nativeTokenExistentialDeposit || 0);
        const nativeMinimumTokenAmountExceededCheck =
          assetInPool.sub(assetOut).lessThanOrEqualTo(assetTokenInfoMinBalance) ||
          nativeTokenInPool.sub(nativeTokenOut).lessThanOrEqualTo(nativeTokenExistentialDeposit || 0);

        setMinimumTokenAmountExceeded(minimumTokenAmountExceededCheck);

        setSelectedTokenNativeValue({
          tokenValue: formatDecimalsFromToken(nativeTokenOut, selectedTokenA?.nativeTokenDecimals),
        });

        setNativeTokenWithSlippage({ tokenValue: nativeTokenOutSlippageFormatted });

        setSelectedTokenAssetValue({
          tokenValue: formatDecimalsFromToken(assetOut, selectedTokenB?.decimals),
        });
        setAssetTokenWithSlippage({ tokenValue: assetOutSlippageFormatted });

        const max = calculateMaxPercent(
          selectedTokenNativeValue?.tokenValue || "0",
          selectedTokenAssetValue?.tokenValue || "0",
          selectedTokenA.nativeTokenDecimals,
          selectedTokenB.decimals,
          nativeTokenExistentialDeposit || "0",
          assetTokenInfoMinBalance || "0"
        );
        setMaxPercentage(nativeMinimumTokenAmountExceededCheck ? truncateDecimalNumber(max) : 100);
      }
    }
  };

  const calculatePercentage = (value: string, baseValue: string) => {
    const valueMinusBaseValue = new Decimal(value).minus(baseValue);
    return valueMinusBaseValue.dividedBy(value).mul(100);
  };

  const calculateMaxPercent = (
    selectedTokenNativeValue: string,
    selectedTokenAssetValue: string,
    selectedTokenA: string,
    selectedTokenB: string,
    nativeTokenExistentialDeposit: string,
    assetTokenInfoMinBalance: string
  ) => {
    const selectedTokenAPow = formatInputTokenValue(selectedTokenNativeValue, selectedTokenA);
    const selectedTokenBPow = formatInputTokenValue(selectedTokenAssetValue, selectedTokenB);

    const percentA = calculatePercentage(selectedTokenAPow, nativeTokenExistentialDeposit);
    const percentB = calculatePercentage(selectedTokenBPow, assetTokenInfoMinBalance);

    return percentA.lt(percentB) ? percentA.toFixed() : percentB.toFixed();
  };

  const formattedTokenBValue = () => {
    let value = new Decimal(0);

    if (new Decimal(selectedTokenB?.decimals || 0).gt(0)) {
      value = selectedTokenAssetValue?.tokenValue
        ? new Decimal(selectedTokenAssetValue?.tokenValue).mul(withdrawAmountPercentage).div(100)
        : value;
    } else {
      const percentValue = new Decimal(selectedTokenAssetValue?.tokenValue || 0).mul(withdrawAmountPercentage).div(100);
      value = percentValue.lt(1) ? Decimal.ceil(percentValue) : Decimal.floor(percentValue);
    }

    return value.toFixed();
  };

  const calculatePriceImpact = async () => {
    if (api) {
      if (selectedTokenNativeValue?.tokenValue !== "" && selectedTokenAssetValue?.tokenValue !== "") {
        const poolSelected: any = pools?.find(
          (pool: any) =>
            pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "") === selectedTokenB.assetTokenId
        );
        if (poolSelected && selectedTokenNativeValue?.tokenValue && selectedTokenAssetValue?.tokenValue) {
          const poolReserve: any = await getPoolReserves(
            api,
            poolSelected?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "")
          );

          const assetTokenReserve = formatDecimalsFromToken(
            poolReserve?.[1]?.replace(/[, ]/g, ""),
            selectedTokenB.decimals
          );

          const nativeTokenReserve = formatDecimalsFromToken(
            poolReserve?.[0]?.replace(/[, ]/g, ""),
            selectedTokenA.nativeTokenDecimals
          );

          const priceBeforeSwap = new Decimal(nativeTokenReserve).div(assetTokenReserve);

          const priceOfAssetBForOneAssetA = new Decimal(assetTokenReserve).div(nativeTokenReserve);
          setAssetBPriceOfOneAssetA(priceOfAssetBForOneAssetA.toFixed(5));

          const valueA = new Decimal(selectedTokenNativeValue?.tokenValue).add(nativeTokenReserve);
          const valueB = new Decimal(assetTokenReserve).minus(formattedTokenBValue());

          const priceAfterSwap = valueA.div(valueB);

          const priceImpact = new Decimal(1).minus(priceBeforeSwap.div(priceAfterSwap));

          setPriceImpact(priceImpact.mul(100).toFixed(2));
        }
      }
    }
  };

  useEffect(() => {
    calculatePriceImpact();
  }, [
    selectedTokenA.nativeTokenSymbol,
    selectedTokenB.tokenSymbol,
    selectedTokenNativeValue?.tokenValue,
    selectedTokenAssetValue?.tokenValue,
    withdrawAmountPercentage,
  ]);

  useEffect(() => {
    if (tokenBalances) {
      setSelectedTokenA({
        nativeTokenSymbol: tokenBalances?.tokenSymbol,
        nativeTokenDecimals: tokenBalances?.tokenDecimals,
      });
    }
  }, [tokenBalances]);

  useEffect(() => {
    if (selectedTokenNativeValue && selectedTokenAssetValue) {
      const nativeTokenValue = formatInputTokenValue(
        Number(selectedTokenNativeValue.tokenValue),
        selectedTokenA?.nativeTokenDecimals
      )
        .toLocaleString()
        ?.replace(/[, ]/g, "");

      const assetTokenValue = formatInputTokenValue(Number(selectedTokenAssetValue.tokenValue), selectedTokenB.decimals)
        .toLocaleString()
        ?.replace(/[, ]/g, "");

      if (nativeTokenValue && assetTokenValue) {
        handleWithdrawPoolLiquidityGasFee();
      }
    }
  }, [selectedTokenNativeValue, selectedTokenAssetValue]);

  useEffect(() => {
    dispatch({ type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE, payload: "" });
  }, []);

  useEffect(() => {
    if (params?.id) {
      populateAssetToken();
    }
  }, [params?.id]);

  useEffect(() => {
    getNativeAndAssetTokensFromPool();
  }, [slippageValue, selectedTokenB.assetTokenId, selectedTokenNativeValue?.tokenValue, withdrawAmountPercentage]);

  useEffect(() => {
    if (withdrawLiquidityLoading) {
      setWaitingForTransaction(
        setTimeout(() => {
          if (withdrawLiquidityLoading) {
            setIsTransactionTimeout(true);
            dispatch({ type: ActionType.SET_WITHDRAW_LIQUIDITY_LOADING, payload: false });
          }
        }, 180000)
      ); // 3 minutes 180000
    } else {
      if (waitingForTransaction) {
        clearTimeout(waitingForTransaction);
      }
    }
  }, [withdrawLiquidityLoading]);

  return (
    <div className="flex w-full max-w-[460px] flex-col gap-4">
      <div className="relative flex w-full flex-col items-center gap-1.5 rounded-2xl bg-white p-5">
        <button className="absolute left-[18px] top-[18px]" onClick={navigateToPools}>
          <BackArrow width={24} height={24} />
        </button>
        <h3 className="heading-6 font-unbounded-variable font-normal">
          {location?.state?.pageType === LiquidityPageType.removeLiquidity
            ? t("poolsPage.removeLiquidity")
            : t("poolsPage.addLiquidity")}
        </h3>
        <hr className="mb-0.5 mt-1 w-full border-[0.7px] border-gray-50" />
        <TokenAmountInput
          tokenText={selectedTokenA?.nativeTokenSymbol}
          labelText={t("poolsPage.withdrawalAmount")}
          tokenIcon={<DotToken />}
          tokenValue={
            selectedTokenNativeValue?.tokenValue
              ? new Decimal(selectedTokenNativeValue?.tokenValue).mul(withdrawAmountPercentage).div(100).toFixed()
              : ""
          }
          onClick={() => null}
          onSetTokenValue={() => null}
          selectDisabled={true}
          disabled={true}
          assetLoading={assetLoading}
          withdrawAmountPercentage={withdrawAmountPercentage}
        />
        <TokenAmountInput
          tokenText={selectedTokenB?.tokenSymbol}
          labelText={t("poolsPage.withdrawalAmount")}
          tokenIcon={<DotToken />}
          tokenValue={formattedTokenBValue()}
          onClick={() => setIsModalOpen(true)}
          onSetTokenValue={() => null}
          selectDisabled={true}
          disabled={true}
          assetLoading={assetLoading}
          withdrawAmountPercentage={withdrawAmountPercentage}
        />

        <AmountPercentage
          maxValue={maxPercentage}
          onChange={(value) => setWithdrawAmountPercentage(value)}
          disabled={withdrawLiquidityLoading}
        />

        <div className="mt-1 text-small">{transferGasFeesMessage}</div>
        <div className="flex w-full flex-col gap-2 rounded-lg bg-purple-50 px-4 py-6">
          <div className="flex w-full justify-between text-medium font-normal text-gray-200">
            <div className="flex">{t("tokenAmountInput.slippageTolerance")}</div>
            <span>{slippageValue}%</span>
          </div>
          <div className="flex w-full gap-2">
            <div className="flex w-full basis-8/12 rounded-xl bg-white p-1 text-large font-normal text-gray-400">
              <button
                className={classNames("flex basis-1/2 justify-center rounded-lg px-4 py-3", {
                  "bg-white": !slippageAuto,
                  "bg-purple-100": slippageAuto,
                })}
                onClick={() => {
                  setSlippageAuto(true);
                  setSlippageValue(15);
                }}
                disabled={assetLoading || !selectedAccount.address}
              >
                {t("tokenAmountInput.auto")}
              </button>
              <button
                className={classNames("flex basis-1/2 justify-center rounded-lg px-4 py-3", {
                  "bg-white": slippageAuto,
                  "bg-purple-100": !slippageAuto,
                })}
                onClick={() => setSlippageAuto(false)}
                disabled={assetLoading || !selectedAccount.address}
              >
                {t("tokenAmountInput.custom")}
              </button>
            </div>
            <div className="flex basis-1/3">
              <div className="relative flex">
                <NumericFormat
                  value={slippageValue}
                  isAllowed={(values) => {
                    const { formattedValue, floatValue } = values;
                    return formattedValue === "" || (floatValue !== undefined && floatValue <= 99);
                  }}
                  onValueChange={({ value }) => {
                    setSlippageValue(parseInt(value) >= 0 ? parseInt(value) : 0);
                  }}
                  fixedDecimalScale={true}
                  thousandSeparator={false}
                  allowNegative={false}
                  className="w-full rounded-lg bg-purple-100 p-2 text-large  text-gray-200 outline-none"
                  disabled={slippageAuto || withdrawLiquidityLoading || assetLoading || !selectedAccount.address}
                />
                <span className="absolute bottom-1/3 right-2 text-medium text-gray-100">%</span>
              </div>
            </div>
          </div>
        </div>
        {selectedTokenNativeValue?.tokenValue !== "" && selectedTokenAssetValue?.tokenValue !== "" && (
          <>
            {" "}
            <div className="flex w-full flex-col gap-2 rounded-lg bg-purple-50 px-2 py-4">
              <div className="flex w-full flex-row text-medium font-normal text-gray-200">
                <span>
                  1 {selectedTokenA.nativeTokenSymbol} = {assetBPriceOfOneAssetA} {selectedTokenB.tokenSymbol}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 rounded-lg bg-purple-50 px-4 py-6">
              <div className="flex w-full flex-row justify-between text-medium font-normal text-gray-200">
                <div className="flex">Price impact</div>
                <span>~ {priceImpact}%</span>
              </div>

              <div className="flex w-full flex-row justify-between text-medium font-normal text-gray-200">
                <div className="flex">Expected output</div>
                <span>
                  {selectedTokenNativeValue?.tokenValue &&
                    new Decimal(selectedTokenNativeValue?.tokenValue).times(withdrawAmountPercentage / 100).toString() +
                      " " +
                      selectedTokenA.nativeTokenSymbol}
                </span>
              </div>
              <div className="flex w-full flex-row justify-between text-medium font-normal text-gray-200">
                <div className="flex">Minimum output</div>
                <span>
                  {formatDecimalsFromToken(nativeTokenWithSlippage?.tokenValue, selectedTokenA.nativeTokenDecimals) +
                    " " +
                    selectedTokenA.nativeTokenSymbol}
                </span>
              </div>
              <div className="flex w-full flex-row justify-between text-medium font-normal text-gray-200">
                <div className="flex">Expected output</div>
                <span>
                  {selectedTokenAssetValue?.tokenValue &&
                    new Decimal(selectedTokenAssetValue?.tokenValue).times(withdrawAmountPercentage / 100).toString() +
                      " " +
                      selectedTokenB.tokenSymbol}
                </span>
              </div>
              <div className="flex w-full flex-row justify-between text-medium font-normal text-gray-200">
                <div className="flex">Minimum output</div>

                <span>
                  {formatDecimalsFromToken(assetTokenWithSlippage.tokenValue, selectedTokenB.decimals) +
                    " " +
                    selectedTokenB.tokenSymbol}
                </span>
              </div>
            </div>
          </>
        )}
        <Button
          onClick={() => (getWithdrawButtonProperties.disabled ? null : setReviewModalOpen(true))}
          variant={ButtonVariants.btnInteractivePink}
          disabled={getWithdrawButtonProperties.disabled || withdrawLiquidityLoading}
        >
          {withdrawLiquidityLoading ? <LottieMedium /> : getWithdrawButtonProperties.label}
        </Button>
        <PoolSelectTokenModal
          onSelect={setSelectedTokenB}
          onClose={() => setIsModalOpen(false)}
          open={isModalOpen}
          title={t("button.selectToken")}
        />
        <ReviewTransactionModal
          open={reviewModalOpen}
          showAll={true}
          transactionType={TransactionTypes.withdraw}
          title="Review remove liquidity"
          priceImpact={priceImpact}
          inputValueA={
            selectedTokenNativeValue?.tokenValue
              ? new Decimal(selectedTokenNativeValue?.tokenValue).mul(withdrawAmountPercentage).div(100).toFixed()
              : ""
          }
          inputValueB={formattedTokenBValue()}
          tokenValueA={
            selectedTokenNativeValue?.tokenValue &&
            new Decimal(selectedTokenNativeValue?.tokenValue).times(withdrawAmountPercentage / 100).toString()
          }
          tokenValueASecond={
            selectedTokenAssetValue?.tokenValue &&
            new Decimal(selectedTokenAssetValue?.tokenValue).times(withdrawAmountPercentage / 100).toString()
          }
          tokenValueB={formatDecimalsFromToken(nativeTokenWithSlippage.tokenValue, selectedTokenA.nativeTokenDecimals)}
          tokenValueBSecond={formatDecimalsFromToken(assetTokenWithSlippage.tokenValue, selectedTokenB.decimals)}
          tokenSymbolA={selectedTokenA.nativeTokenSymbol}
          tokenSymbolB={selectedTokenB.tokenSymbol}
          onClose={() => {
            setReviewModalOpen(false);
          }}
          inputType={InputEditedType.exactIn}
          onConfirmTransaction={() => {
            handlePool();
          }}
        />
        <SwapAndPoolSuccessModal
          open={successModalOpen}
          onClose={closeSuccessModal}
          contentTitle={t("modal.removeFromPool.successfulWithdrawal")}
          actionLabel={t("modal.removeFromPool.withdrawal")}
          tokenA={{
            value: exactNativeTokenWithdraw,
            symbol: selectedTokenA.nativeTokenSymbol,
            icon: <DotToken />,
          }}
          tokenB={{
            value: exactAssetTokenWithdraw,
            symbol: selectedTokenB.tokenSymbol,
            icon: <AssetTokenIcon width={24} height={24} />,
          }}
        />
      </div>
      <WarningMessage show={minimumTokenAmountExceeded} message={t("poolsPage.minimumAmountExceeded")} />
      <WarningMessage show={isTokenCanNotCreateWarningPools} message={t("pageError.tokenCanNotCreateWarning")} />
      <WarningMessage
        show={isTransactionTimeout}
        message={t("pageError.transactionTimeout", { url: `${assethubSubscanUrl}/account/${selectedAccount.address}` })}
      />
    </div>
  );
};

export default WithdrawPoolLiquidity;

import classNames from "classnames";
import Decimal from "decimal.js";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { useNavigate } from "react-router-dom";
import useGetNetwork from "../../../app/hooks/useGetNetwork";
import { POOLS_PAGE } from "../../../app/router/routes";
import { TokenDecimalsErrorProps } from "../../../app/types";
import { ActionType, ButtonVariants, TransactionTypes } from "../../../app/types/enum";
import {
  calculateSlippageReduce,
  checkIfPoolAlreadyExists,
  convertToBaseUnit,
  formatDecimalsFromToken,
  formatInputTokenValue,
} from "../../../app/util/helper";
import dotAcpToast from "../../../app/util/toast";
import BackArrow from "../../../assets/img/back-arrow.svg?react";
import DotToken from "../../../assets/img/dot-token.svg?react";
import AssetTokenIcon from "../../../assets/img/test-token.svg?react";
import { LottieMedium } from "../../../assets/loader";
import { setTokenBalanceUpdate } from "../../../services/polkadotWalletServices";
import { checkCreatePoolGasFee, createPool, getAllLiquidityPoolsTokensMetadata } from "../../../services/poolServices";
import { useAppContext } from "../../../state";
import Button from "../../atom/Button";
import WarningMessage from "../../atom/WarningMessage";
import TokenAmountInput from "../../molecule/TokenAmountInput";
import AddPoolLiquidity from "../AddPoolLiquidity";
import PoolSelectTokenModal from "../PoolSelectTokenModal";
import ReviewTransactionModal from "../ReviewTransactionModal";
import SwapAndPoolSuccessModal from "../SwapAndPoolSuccessModal";

type AssetTokenProps = {
  tokenSymbol: string;
  assetTokenId: string;
  decimals: string;
  assetTokenBalance: string;
};

type NativeTokenProps = {
  nativeTokenSymbol: any;
  nativeTokenDecimals: any;
  tokenId: string;
  tokenBalance: string;
};

type TokenValueProps = {
  tokenValue: string;
};

type CreatePoolProps = {
  tokenBSelected?: AssetTokenProps;
};

const CreatePool = ({ tokenBSelected }: CreatePoolProps) => {
  const { state, dispatch } = useAppContext();
  const { assethubSubscanUrl } = useGetNetwork();

  const navigate = useNavigate();

  const {
    tokenBalances,
    api,
    selectedAccount,
    pools,
    transferGasFeesMessage,
    poolGasFee,
    successModalOpen,
    createPoolLoading,
    addLiquidityLoading,
    assetLoading,
    isTokenCanNotCreateWarningPools,
  } = state;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTokenA, setSelectedTokenA] = useState<NativeTokenProps>({
    nativeTokenSymbol: "",
    nativeTokenDecimals: "",
    tokenId: "",
    tokenBalance: "",
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
  const [poolExists, setPoolExists] = useState<boolean>(false);
  const [assetTokenMinValueExceeded, setAssetTokenMinValueExceeded] = useState<boolean>(false);
  const [assetTokenMinValue, setAssetTokenMinValue] = useState<string>("");
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [tooManyDecimalsError, setTooManyDecimalsError] = useState<TokenDecimalsErrorProps>({
    tokenSymbol: "",
    isError: false,
    decimalsAllowed: 0,
  });

  const [isTransactionTimeout, setIsTransactionTimeout] = useState<boolean>(false);
  const [waitingForTransaction, setWaitingForTransaction] = useState<NodeJS.Timeout>();

  const selectedNativeTokenNumber = new Decimal(selectedTokenNativeValue?.tokenValue || 0);
  const selectedAssetTokenNumber = new Decimal(selectedTokenAssetValue?.tokenValue || 0);

  const navigateToPools = () => {
    navigate(POOLS_PAGE);
  };

  const handlePool = async () => {
    if (waitingForTransaction) {
      clearTimeout(waitingForTransaction);
    }
    setIsTransactionTimeout(false);
    if (api && selectedTokenAssetValue && selectedTokenNativeValue) {
      const nativeTokenValue = formatInputTokenValue(selectedNativeTokenNumber, selectedTokenA?.nativeTokenDecimals)
        .toLocaleString()
        ?.replace(/[, ]/g, "");

      const assetTokenValue = formatInputTokenValue(selectedAssetTokenNumber, selectedTokenB.decimals)
        .toLocaleString()
        ?.replace(/[, ]/g, "");

      try {
        await createPool(
          api,
          selectedTokenB.assetTokenId,
          selectedAccount,
          nativeTokenValue,
          assetTokenValue,
          nativeTokenWithSlippage.tokenValue,
          assetTokenWithSlippage.tokenValue,
          selectedTokenA.nativeTokenDecimals,
          selectedTokenB.decimals,
          dispatch
        );
      } catch (error) {
        dotAcpToast.error(`Error: ${error}`);
      }
    }
  };

  const handlePoolGasFee = async () => {
    if (api) await checkCreatePoolGasFee(api, selectedTokenB.assetTokenId, selectedAccount, dispatch);
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
      const poolsTokenMetadata = await getAllLiquidityPoolsTokensMetadata(api);
      dispatch({ type: ActionType.SET_POOLS_TOKEN_METADATA, payload: poolsTokenMetadata });
    }
  };

  const setSelectedTokenAValue = (value: string) => {
    if (value) {
      value = new Decimal(value).toFixed();
      if (slippageValue) {
        if (value.includes(".")) {
          if (value.split(".")[1].length > parseInt(selectedTokenA.nativeTokenDecimals)) {
            setTooManyDecimalsError({
              tokenSymbol: selectedTokenA.nativeTokenSymbol,
              isError: true,
              decimalsAllowed: parseInt(selectedTokenA.nativeTokenDecimals),
            });
            return;
          }
        }

        setTooManyDecimalsError({
          tokenSymbol: "",
          isError: false,
          decimalsAllowed: 0,
        });

        const nativeTokenSlippageValue = calculateSlippageReduce(value, slippageValue);
        const tokenWithSlippageFormatted = formatInputTokenValue(nativeTokenSlippageValue, selectedTokenB?.decimals);

        setSelectedTokenNativeValue({ tokenValue: value });
        setNativeTokenWithSlippage({ tokenValue: tokenWithSlippageFormatted });
      }
    } else {
      setSelectedTokenNativeValue({ tokenValue: "" });
    }
  };

  const setSelectedTokenBValue = (value: string) => {
    if (value) {
      value = new Decimal(value).toFixed();
      if (slippageValue) {
        if (value.includes(".")) {
          if (value.split(".")[1].length > parseInt(selectedTokenB.decimals)) {
            setTooManyDecimalsError({
              tokenSymbol: selectedTokenB.tokenSymbol,
              isError: true,
              decimalsAllowed: parseInt(selectedTokenB.decimals),
            });
            return;
          }
        }

        setTooManyDecimalsError({
          tokenSymbol: "",
          isError: false,
          decimalsAllowed: 0,
        });

        const assetTokenSlippageValue = calculateSlippageReduce(value, slippageValue);
        const tokenWithSlippageFormatted = formatInputTokenValue(assetTokenSlippageValue, selectedTokenB?.decimals);
        setSelectedTokenAssetValue({ tokenValue: value });
        setAssetTokenWithSlippage({ tokenValue: tokenWithSlippageFormatted });
      }
    } else {
      setSelectedTokenAssetValue({ tokenValue: "" });
    }
  };

  const checkAssetTokenMinAmount = async () => {
    if (selectedTokenAssetValue && api && selectedTokenB.assetTokenId) {
      const assetTokenInfo: any = await api.query.assets.asset(selectedTokenB.assetTokenId);
      const assetTokenMinBalance = assetTokenInfo.toHuman()?.minBalance;
      if (!assetTokenMinBalance) return;
      const formattedMinTokenAmount = assetTokenMinBalance.replace(/[, ]/g, "");
      const assetTokenMinBalanceFormatted = formatDecimalsFromToken(formattedMinTokenAmount, selectedTokenB.decimals);

      if (new Decimal(selectedTokenAssetValue.tokenValue || 0).gte(assetTokenMinBalanceFormatted || 0)) {
        setAssetTokenMinValueExceeded(false);
      } else {
        setAssetTokenMinValue(assetTokenMinBalanceFormatted);
        setAssetTokenMinValueExceeded(true);
      }
    }
  };

  const getButtonProperties = useMemo(() => {
    if (tokenBalances?.assets) {
      if (selectedTokenB.tokenSymbol === "" || selectedTokenB.assetTokenId === "") {
        return { label: t("button.selectToken"), disabled: true };
      }
      if (
        selectedNativeTokenNumber.lte(0) ||
        selectedAssetTokenNumber.lte(0) ||
        selectedTokenNativeValue?.tokenValue === "" ||
        selectedTokenAssetValue?.tokenValue === ""
      ) {
        return { label: t("button.enterAmount"), disabled: true };
      }

      if (selectedNativeTokenNumber.gt(tokenBalances.balance)) {
        return {
          label: t("button.insufficientTokenAmount", { token: selectedTokenA.nativeTokenSymbol }),
          disabled: true,
        };
      }

      const fee = convertToBaseUnit(poolGasFee);
      if (selectedNativeTokenNumber.plus(fee).gt(tokenBalances.balance)) {
        return {
          label: t("button.insufficientTokenAmount", { token: selectedTokenA.nativeTokenSymbol }),
          disabled: true,
        };
      }

      if (
        selectedAssetTokenNumber.gt(
          formatDecimalsFromToken(selectedTokenB.assetTokenBalance?.replace(/[, ]/g, ""), selectedTokenB.decimals)
        )
      ) {
        return {
          label: t("button.insufficientTokenAmount", { token: selectedTokenB.tokenSymbol }),
          disabled: true,
        };
      }

      if (selectedNativeTokenNumber.gt(0) && selectedAssetTokenNumber.gt(0) && assetTokenMinValueExceeded) {
        return { label: t("button.minimumTokenAmountExceeded"), disabled: true };
      }

      if (
        selectedNativeTokenNumber.gt(0) &&
        selectedAssetTokenNumber.gt(0) &&
        !assetTokenMinValueExceeded &&
        !tooManyDecimalsError.isError
      ) {
        return { label: t("button.deposit"), disabled: false };
      }

      if (
        selectedNativeTokenNumber.gt(0) &&
        selectedAssetTokenNumber.gt(0) &&
        !assetTokenMinValueExceeded &&
        tooManyDecimalsError.isError
      ) {
        return { label: t("button.deposit"), disabled: true };
      }
    } else {
      return { label: t("button.connectWallet"), disabled: true };
    }

    return { label: t("button.selectToken"), disabled: true };
  }, [
    selectedTokenB.assetTokenId,
    selectedTokenB.tokenSymbol,
    selectedTokenA.nativeTokenDecimals,
    selectedTokenB.decimals,
    selectedTokenB.assetTokenBalance,
    selectedTokenNativeValue?.tokenValue,
    selectedTokenAssetValue?.tokenValue,
    assetTokenMinValueExceeded,
    tooManyDecimalsError.isError,
  ]);

  useEffect(() => {
    if (tokenBalances?.assets) {
      setSelectedTokenA({
        nativeTokenSymbol: tokenBalances?.tokenSymbol,
        nativeTokenDecimals: tokenBalances?.tokenDecimals,
        tokenId: "",
        tokenBalance: tokenBalances.balance.toString(),
      });
    }
  }, [tokenBalances?.assets]);

  useEffect(() => {
    const poolExists = checkIfPoolAlreadyExists(selectedTokenB.assetTokenId, pools);
    setPoolExists(poolExists);
  }, [selectedTokenB.assetTokenId]);

  useEffect(() => {
    if (selectedTokenB.assetTokenId) {
      handlePoolGasFee();
    }
  }, [selectedTokenB.assetTokenId]);

  useEffect(() => {
    dispatch({ type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE, payload: "" });
  }, []);

  useEffect(() => {
    checkAssetTokenMinAmount();
  }, [selectedTokenAssetValue?.tokenValue]);

  useEffect(() => {
    if (
      selectedTokenNativeValue &&
      selectedTokenAssetValue &&
      selectedAssetTokenNumber.gt(0) &&
      selectedNativeTokenNumber.gt(0)
    ) {
      setSelectedTokenAValue(selectedTokenNativeValue.tokenValue);
      setSelectedTokenBValue(selectedTokenAssetValue.tokenValue);
    }
  }, [slippageValue]);

  useEffect(() => {
    if (tokenBSelected) {
      setSelectedTokenB(tokenBSelected);
    }
  }, [tokenBSelected]);

  useEffect(() => {
    if (Object.keys(selectedAccount).length === 0) {
      navigateToPools();
    }
  }, [selectedAccount]);

  useEffect(() => {
    dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_POOLS, payload: false });
  }, [selectedTokenB.assetTokenId, selectedTokenNativeValue, selectedTokenAssetValue]);

  useEffect(() => {
    if (createPoolLoading) {
      setWaitingForTransaction(
        setTimeout(() => {
          if (createPoolLoading) {
            setIsTransactionTimeout(true);
            dispatch({ type: ActionType.SET_CREATE_POOL_LOADING, payload: false });
          }
        }, 180000)
      ); // 3 minutes 180000
    } else {
      if (waitingForTransaction) {
        clearTimeout(waitingForTransaction);
      }
    }
  }, [createPoolLoading]);

  return (
    <>
      {poolExists ? (
        <AddPoolLiquidity tokenBId={{ id: selectedTokenB.assetTokenId }} />
      ) : (
        <div className="flex max-w-[460px] flex-col gap-4">
          <div className="relative flex w-full flex-col items-center gap-1.5 rounded-2xl bg-white p-5">
            <button className="absolute left-[18px] top-[18px]" onClick={navigateToPools}>
              <BackArrow width={24} height={24} />
            </button>
            <h3 className="heading-6 font-unbounded-variable font-normal">{t("poolsPage.newPosition")}</h3>
            <hr className="mb-0.5 mt-1 w-full border-[0.7px] border-gray-50" />
            <TokenAmountInput
              tokenText={selectedTokenA?.nativeTokenSymbol}
              labelText={t("tokenAmountInput.youPay")}
              tokenIcon={<DotToken />}
              tokenBalance={selectedTokenA.tokenBalance}
              tokenId={selectedTokenA.tokenId}
              tokenDecimals={selectedTokenA.nativeTokenDecimals}
              tokenValue={selectedTokenNativeValue?.tokenValue}
              onClick={() => null}
              onSetTokenValue={(value) => setSelectedTokenAValue(value)}
              selectDisabled={true}
              disabled={createPoolLoading || !selectedAccount || !tokenBalances?.assets}
              assetLoading={assetLoading}
            />
            <TokenAmountInput
              tokenText={selectedTokenB?.tokenSymbol}
              labelText={t("tokenAmountInput.youPay")}
              tokenIcon={<DotToken />}
              tokenBalance={selectedTokenB.assetTokenBalance}
              tokenId={selectedTokenB.assetTokenId}
              tokenDecimals={selectedTokenB.decimals}
              tokenValue={selectedTokenAssetValue?.tokenValue}
              onClick={() => setIsModalOpen(true)}
              onSetTokenValue={(value) => setSelectedTokenBValue(value)}
              disabled={createPoolLoading || !selectedAccount || !tokenBalances?.assets}
              selectDisabled={createPoolLoading || !selectedAccount}
              assetLoading={assetLoading}
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
                      disabled={slippageAuto || createPoolLoading || assetLoading || !selectedAccount.address}
                    />
                    <span className="absolute bottom-1/3 right-2 text-medium text-gray-100">%</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => (getButtonProperties.disabled ? null : setReviewModalOpen(true))}
              variant={ButtonVariants.btnInteractivePink}
              disabled={getButtonProperties.disabled || createPoolLoading || addLiquidityLoading}
            >
              {createPoolLoading || addLiquidityLoading ? <LottieMedium /> : getButtonProperties.label}
            </Button>
            <ReviewTransactionModal
              open={reviewModalOpen}
              title="Review create pool"
              transactionType={TransactionTypes.createPool}
              inputValueA={selectedTokenNativeValue ? selectedTokenNativeValue.tokenValue : ""}
              tokenValueA={selectedTokenA.nativeTokenSymbol}
              inputValueB={selectedTokenAssetValue ? selectedTokenAssetValue.tokenValue : ""}
              tokenValueB={selectedTokenB.tokenSymbol}
              onClose={() => {
                setReviewModalOpen(false);
              }}
              onConfirmTransaction={() => {
                handlePool();
              }}
            />
            <PoolSelectTokenModal
              onSelect={setSelectedTokenB}
              onClose={() => setIsModalOpen(false)}
              open={isModalOpen}
              title={t("button.selectToken")}
              selected={selectedTokenB}
            />

            <SwapAndPoolSuccessModal
              open={successModalOpen}
              onClose={closeSuccessModal}
              contentTitle={t("modal.createPool.poolSuccessfullyCreated")}
              tokenA={{
                value: selectedTokenNativeValue?.tokenValue,
                symbol: selectedTokenA.nativeTokenSymbol,
                icon: <DotToken />,
              }}
              tokenB={{
                value: selectedTokenAssetValue?.tokenValue,
                symbol: selectedTokenB.tokenSymbol,
                icon: <AssetTokenIcon width={24} height={24} />,
              }}
              actionLabel={t("modal.added")}
            />
          </div>
          <WarningMessage
            show={assetTokenMinValueExceeded}
            message={t("pageError.minimalAmountRequirement", {
              token: selectedTokenB.tokenSymbol,
              value: assetTokenMinValue,
            })}
          />
          <WarningMessage
            show={tooManyDecimalsError.isError}
            message={t("pageError.tooManyDecimals", {
              token: tooManyDecimalsError.tokenSymbol,
              decimals: tooManyDecimalsError.decimalsAllowed,
            })}
          />
          <WarningMessage show={isTokenCanNotCreateWarningPools} message={t("pageError.tokenCanNotCreateWarning")} />
          <WarningMessage
            show={isTransactionTimeout}
            message={t("pageError.transactionTimeout", {
              url: `${assethubSubscanUrl}/account/${selectedAccount.address}`,
            })}
          />
        </div>
      )}
    </>
  );
};

export default CreatePool;

import { ApiPromise } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import { getWalletBySource, type WalletAccount } from "@talismn/connect-wallets";
import Decimal from "decimal.js";
import { t } from "i18next";
import { Dispatch } from "react";
import useGetNetwork from "../../app/hooks/useGetNetwork";
import { LpTokenAsset, PoolCardProps } from "../../app/types";
import { ActionType, ServiceResponseStatus } from "../../app/types/enum";
import { formatDecimalsFromToken } from "../../app/util/helper";
import dotAcpToast from "../../app/util/toast";
import NativeTokenIcon from "../../assets/img/dot-token.svg";
import AssetTokenIcon from "../../assets/img/test-token.svg";
import { PoolAction } from "../../store/pools/interface";
import { WalletAction } from "../../store/wallet/interface";

const { parents, nativeTokenSymbol } = useGetNetwork();

const exactAddedLiquidityInPool = (
  itemEvents: any,
  nativeTokenDecimals: string,
  assetTokenDecimals: string,
  dispatch: Dispatch<PoolAction>
) => {
  const liquidityAddedEvent = itemEvents.events.filter((item: any) => item.event.method === "LiquidityAdded");

  const nativeTokenIn = formatDecimalsFromToken(
    parseFloat(liquidityAddedEvent[0].event.data.amount1Provided.replace(/[, ]/g, "")),
    nativeTokenDecimals
  );
  const assetTokenIn = formatDecimalsFromToken(
    parseFloat(liquidityAddedEvent[0].event.data.amount2Provided.replace(/[, ]/g, "")),
    assetTokenDecimals
  );

  dispatch({ type: ActionType.SET_EXACT_NATIVE_TOKEN_ADD_LIQUIDITY, payload: nativeTokenIn });
  dispatch({ type: ActionType.SET_EXACT_ASSET_TOKEN_ADD_LIQUIDITY, payload: assetTokenIn });

  return liquidityAddedEvent;
};

const exactWithdrawnLiquidityFromPool = (
  itemEvents: any,
  nativeTokenDecimals: string,
  assetTokenDecimals: string,
  dispatch: Dispatch<PoolAction>
) => {
  const liquidityRemovedEvent = itemEvents.events.filter((item: any) => item.event.method === "LiquidityRemoved");

  const nativeTokenOut = formatDecimalsFromToken(
    parseFloat(liquidityRemovedEvent[0].event.data.amount1.replace(/[, ]/g, "")),
    nativeTokenDecimals
  );
  const assetTokenOut = formatDecimalsFromToken(
    parseFloat(liquidityRemovedEvent[0].event.data.amount2.replace(/[, ]/g, "")),
    assetTokenDecimals
  );

  dispatch({ type: ActionType.SET_EXACT_NATIVE_TOKEN_WITHDRAW, payload: nativeTokenOut });
  dispatch({ type: ActionType.SET_EXACT_ASSET_TOKEN_WITHDRAW, payload: assetTokenOut });

  return liquidityRemovedEvent;
};

export const getAllPools = async (api: ApiPromise) => {
  try {
    const pools = await api.query.assetConversion.pools.entries();

    return pools.map(([key, value]) => [key.args?.[0].toHuman(), value.toHuman()]);
  } catch (error) {
    dotAcpToast.error(`Error getting pools: ${error}`);
  }
};

export const getPoolReserves = async (api: ApiPromise, assetTokenId: string) => {
  const multiLocation2 = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const multiLocation = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        X2: [{ PalletInstance: 50 }, { GeneralIndex: assetTokenId }],
      },
    })
    .toU8a();

  const encodedInput = new Uint8Array(multiLocation.length + multiLocation2.length);
  encodedInput.set(multiLocation2, 0);
  encodedInput.set(multiLocation, multiLocation2.length);

  const encodedInputHex = u8aToHex(encodedInput);

  const reservers = await api.rpc.state.call("AssetConversionApi_get_reserves", encodedInputHex);

  const decoded = api.createType("Option<(u128, u128)>", reservers);

  return decoded.toHuman();
};

export const createPool = async (
  api: ApiPromise,
  assetTokenId: string,
  account: WalletAccount,
  nativeTokenValue: string,
  assetTokenValue: string,
  minNativeTokenValue: string,
  minAssetTokenValue: string,
  nativeTokenDecimals: string,
  assetTokenDecimals: string,
  dispatch: Dispatch<PoolAction | WalletAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenId }],
      },
    })
    .toU8a();

  dispatch({ type: ActionType.SET_CREATE_POOL_LOADING, payload: true });

  const result = api.tx.assetConversion.createPool(firstArg, secondArg);

  const wallet = getWalletBySource(account.wallet?.extensionName);

  result
    .signAndSend(account.address, { signer: wallet?.signer }, (response) => {
      if (response.status.type === ServiceResponseStatus.Finalized) {
        addLiquidity(
          api,
          assetTokenId,
          account,
          nativeTokenValue,
          assetTokenValue,
          minNativeTokenValue,
          minAssetTokenValue,
          nativeTokenDecimals,
          assetTokenDecimals,
          dispatch
        );
      }

      if (response.status.isInBlock) {
        dotAcpToast.success(`Completed at block hash #${response.status.asInBlock.toString()}`, {
          style: {
            maxWidth: "750px",
          },
        });
      } else {
        if (response.status.type === ServiceResponseStatus.Finalized && response.dispatchError) {
          if (response.dispatchError.isModule) {
            const decoded = api.registry.findMetaError(response.dispatchError.asModule);
            const { docs } = decoded;
            dotAcpToast.error(`${docs.join(" ")}`);
            dispatch({ type: ActionType.SET_CREATE_POOL_LOADING, payload: false });
          } else {
            dotAcpToast.error(response.dispatchError.toString());
            dispatch({ type: ActionType.SET_CREATE_POOL_LOADING, payload: false });
          }
        } else {
          dotAcpToast.success(`Current status: ${response.status.type}`);
        }
        if (response.status.type === ServiceResponseStatus.Finalized && !response.dispatchError) {
          dispatch({ type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE, payload: "" });
          dispatch({ type: ActionType.SET_CREATE_POOL_LOADING, payload: false });
        }
      }
    })
    .catch((error: any) => {
      dotAcpToast.error(`Transaction failed ${error}`);
      dispatch({ type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE, payload: "" });
      dispatch({ type: ActionType.SET_CREATE_POOL_LOADING, payload: false });
    });
};

export const addLiquidity = async (
  api: ApiPromise,
  assetTokenId: string,
  account: WalletAccount,
  nativeTokenValue: string,
  assetTokenValue: string,
  minNativeTokenValue: string,
  minAssetTokenValue: string,
  nativeTokenDecimals: string,
  assetTokenDecimals: string,
  dispatch: Dispatch<PoolAction | WalletAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenId }],
      },
    })
    .toU8a();

  dispatch({ type: ActionType.SET_ADD_LIQUIDITY_LOADING, payload: true });

  const result = api.tx.assetConversion.addLiquidity(
    firstArg,
    secondArg,
    nativeTokenValue,
    assetTokenValue,
    minNativeTokenValue,
    minAssetTokenValue,
    account.address
  );

  const { partialFee } = await result.paymentInfo(account.address);

  dispatch({
    type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE,
    payload: `transaction will have a weight of ${partialFee.toHuman()} fees`,
  });

  const wallet = getWalletBySource(account.wallet?.extensionName);

  result
    .signAndSend(account.address, { signer: wallet?.signer }, async (response) => {
      if (response.status.isInBlock) {
        dotAcpToast.success(`Completed at block hash #${response.status.asInBlock.toString()}`, {
          style: {
            maxWidth: "750px",
          },
        });
      } else {
        if (response.status.type === ServiceResponseStatus.Finalized && response.dispatchError) {
          if (response.dispatchError.isModule) {
            const decoded = api.registry.findMetaError(response.dispatchError.asModule);
            const { docs } = decoded;
            dotAcpToast.error(`${docs.join(" ")}`);
            dispatch({ type: ActionType.SET_ADD_LIQUIDITY_LOADING, payload: false });
          } else {
            if (response.dispatchError.toString() === t("pageError.tokenCanNotCreate")) {
              dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_POOLS, payload: true });
            }
            dotAcpToast.error(response.dispatchError.toString());
            dispatch({ type: ActionType.SET_ADD_LIQUIDITY_LOADING, payload: false });
          }
        } else {
          dotAcpToast.success(`Current status: ${response.status.type}`);
        }
        if (response.status.type === ServiceResponseStatus.Finalized) {
          dispatch({ type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE, payload: "" });
        }
        if (response.status.type === ServiceResponseStatus.Finalized && !response.dispatchError) {
          exactAddedLiquidityInPool(response.toHuman(), nativeTokenDecimals, assetTokenDecimals, dispatch);

          dispatch({
            type: ActionType.SET_BLOCK_HASH_FINALIZED,
            payload: response.status.asFinalized.toString(),
          });
          dispatch({ type: ActionType.SET_SUCCESS_MODAL_OPEN, payload: true });
          dispatch({ type: ActionType.SET_ADD_LIQUIDITY_LOADING, payload: false });
          const allPools = await getAllPools(api);
          if (allPools) {
            dispatch({ type: ActionType.SET_POOLS, payload: allPools });
            await createPoolCardsArray(api, dispatch, allPools, account);
          }
        }
      }
    })
    .catch((error: any) => {
      dotAcpToast.error(`Transaction failed ${error}`);
      dispatch({ type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE, payload: "" });
      dispatch({ type: ActionType.SET_ADD_LIQUIDITY_LOADING, payload: false });
    });
};

export const removeLiquidity = async (
  api: ApiPromise,
  assetTokenId: string,
  account: WalletAccount,
  lpTokensAmountToBurn: string,
  minNativeTokenValue: string,
  minAssetTokenValue: string,
  nativeTokenDecimals: string,
  assetTokenDecimals: string,
  dispatch: Dispatch<PoolAction | WalletAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenId }],
      },
    })
    .toU8a();

  dispatch({ type: ActionType.SET_WITHDRAW_LIQUIDITY_LOADING, payload: true });

  const result = api.tx.assetConversion.removeLiquidity(
    firstArg,
    secondArg,
    lpTokensAmountToBurn,
    minNativeTokenValue,
    minAssetTokenValue,
    account.address
  );

  const wallet = getWalletBySource(account.wallet?.extensionName);

  result
    .signAndSend(account.address, { signer: wallet?.signer }, async (response) => {
      if (response.status.isInBlock) {
        dotAcpToast.success(`Completed at block hash #${response.status.asInBlock.toString()}`, {
          style: {
            maxWidth: "750px",
          },
        });
      } else {
        if (response.status.type === ServiceResponseStatus.Finalized && response.dispatchError) {
          if (response.dispatchError.isModule) {
            const decoded = api.registry.findMetaError(response.dispatchError.asModule);
            const { docs } = decoded;
            dotAcpToast.error(`${docs.join(" ")}`);
            dispatch({ type: ActionType.SET_WITHDRAW_LIQUIDITY_LOADING, payload: false });
          } else {
            if (response.dispatchError.toString() === t("pageError.tokenCanNotCreate")) {
              dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_POOLS, payload: true });
            }
            dotAcpToast.error(response.dispatchError.toString());
            dispatch({ type: ActionType.SET_WITHDRAW_LIQUIDITY_LOADING, payload: false });
          }
        } else {
          dotAcpToast.success(`Current status: ${response.status.type}`);
        }
        if (response.status.type === ServiceResponseStatus.Finalized) {
          dispatch({ type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE, payload: "" });
        }
        if (response.status.type === ServiceResponseStatus.Finalized && !response.dispatchError) {
          exactWithdrawnLiquidityFromPool(response.toHuman(), nativeTokenDecimals, assetTokenDecimals, dispatch);

          dispatch({
            type: ActionType.SET_BLOCK_HASH_FINALIZED,
            payload: response.status.asFinalized.toString(),
          });
          dispatch({ type: ActionType.SET_SUCCESS_MODAL_OPEN, payload: true });
          dispatch({ type: ActionType.SET_WITHDRAW_LIQUIDITY_LOADING, payload: false });
          const allPools = await getAllPools(api);
          if (allPools) {
            dispatch({ type: ActionType.SET_POOLS, payload: allPools });
            await createPoolCardsArray(api, dispatch, allPools, account);
          }
        }
      }
    })
    .catch((error: any) => {
      dotAcpToast.error(`Transaction failed ${error}`);
      dispatch({ type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE, payload: "" });
      dispatch({ type: ActionType.SET_WITHDRAW_LIQUIDITY_LOADING, payload: false });
    });
};

export const checkCreatePoolGasFee = async (
  api: ApiPromise,
  assetTokenId: string,
  account: any,
  dispatch: Dispatch<PoolAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenId }],
      },
    })
    .toU8a();

  const result = api.tx.assetConversion.createPool(firstArg, secondArg);
  const { partialFee } = await result.paymentInfo(account.address);

  dispatch({
    type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE,
    payload: `transaction will have a weight of ${partialFee.toHuman()} fees`,
  });
  dispatch({
    type: ActionType.SET_POOL_GAS_FEE,
    payload: partialFee.toHuman(),
  });
};

export const checkAddPoolLiquidityGasFee = async (
  api: ApiPromise,
  assetTokenId: string,
  account: any,
  nativeTokenValue: string,
  assetTokenValue: string,
  minNativeTokenValue: string,
  minAssetTokenValue: string,
  dispatch: Dispatch<PoolAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenId }],
      },
    })
    .toU8a();

  const result = api.tx.assetConversion.addLiquidity(
    firstArg,
    secondArg,
    nativeTokenValue,
    assetTokenValue,
    minNativeTokenValue,
    minAssetTokenValue,
    account.address
  );
  const { partialFee } = await result.paymentInfo(account.address);
  dispatch({
    type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE,
    payload: `transaction will have a weight of ${partialFee.toHuman()} fees`,
  });
  dispatch({
    type: ActionType.SET_ADD_LIQUIDITY_GAS_FEE,
    payload: partialFee.toHuman(),
  });
};

export const getAllLiquidityPoolsTokensMetadata = async (api: ApiPromise) => {
  const poolsTokenData = [];
  const pools = await getAllPools(api);

  if (pools) {
    const poolsAssetTokenIds = pools?.map((pool: any) => {
      if (pool?.[0]?.[1].interior?.X2?.[1]?.GeneralIndex) {
        return pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex.replace(/[, ]/g, "").toString();
      }
    });

    for (const item of poolsAssetTokenIds) {
      if (item) {
        const poolReserves: any = await getPoolReserves(api, item);
        if (poolReserves?.length > 0) {
          const poolsTokenMetadata = await api.query.assets.metadata(item);
          const resultObject = {
            tokenId: item,
            assetTokenMetadata: poolsTokenMetadata.toHuman(),
            tokenAsset: {
              balance: 0,
            },
          };
          poolsTokenData.push(resultObject);
        }
      }
    }
  }
  return poolsTokenData;
};

export const checkWithdrawPoolLiquidityGasFee = async (
  api: ApiPromise,
  assetTokenId: string,
  account: any,
  lpTokensAmountToBurn: string,
  minNativeTokenValue: string,
  minAssetTokenValue: string,
  dispatch: Dispatch<PoolAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenId }],
      },
    })
    .toU8a();

  const result = api.tx.assetConversion.removeLiquidity(
    firstArg,
    secondArg,
    lpTokensAmountToBurn,
    minNativeTokenValue,
    minAssetTokenValue,
    account.address
  );

  const { partialFee } = await result.paymentInfo(account.address);
  dispatch({
    type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE,
    payload: `transaction will have a weight of ${partialFee.toHuman()} fees`,
  });
  dispatch({
    type: ActionType.SET_ADD_LIQUIDITY_GAS_FEE,
    payload: partialFee.toHuman(),
  });
};

export const createPoolCardsArray = async (
  api: ApiPromise,
  dispatch: Dispatch<PoolAction>,
  pools: any,
  selectedAccount?: WalletAccount
) => {
  const apiPool = api as ApiPromise;
  try {
    const poolCardsArray: PoolCardProps[] = [];

    const tokenMetadata = api.registry.getChainProperties();
    const nativeTokenDecimals = tokenMetadata?.tokenDecimals.toHuman()?.toString().replace(/[, ]/g, "");

    await Promise.all(
      pools.map(async (pool: any) => {
        const lpTokenId = pool?.[1]?.lpToken;

        let lpToken = null;
        if (selectedAccount?.address) {
          const lpTokenAsset = await apiPool.query.poolAssets.account(lpTokenId, selectedAccount?.address);
          lpToken = lpTokenAsset.toHuman() as LpTokenAsset;
        }

        if (pool?.[0]?.[1]?.interior?.X2) {
          const poolReserve: any = await getPoolReserves(
            apiPool,
            pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "")
          );

          if (poolReserve?.length > 0) {
            const assetTokenMetadata: any = await apiPool.query.assets.metadata(
              pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "")
            );

            const assetToken = poolReserve?.[1]?.replace(/[, ]/g, "");
            let assetTokenFormated = formatDecimalsFromToken(assetToken, assetTokenMetadata.toHuman()?.decimals);
            if (new Decimal(assetTokenFormated).gte(1)) {
              assetTokenFormated = new Decimal(assetTokenFormated).toFixed(4);
            }
            const assetTokenDecimals = assetTokenMetadata.toHuman()?.decimals;
            const assetTokenFormattedWithDecimals = formatDecimalsFromToken(
              poolReserve?.[1]?.replace(/[, ]/g, ""),
              assetTokenDecimals
            );
            if (new Decimal(assetToken).gte(1)) {
              assetTokenFormated = new Decimal(assetTokenFormattedWithDecimals).toFixed(4);
            }

            const nativeToken = poolReserve?.[0]?.replace(/[, ]/g, "");
            let nativeTokenFormatted = formatDecimalsFromToken(nativeToken, nativeTokenDecimals || "0");
            if (new Decimal(nativeTokenFormatted).gte(1)) {
              nativeTokenFormatted = new Decimal(nativeTokenFormatted).toFixed(4);
            }

            poolCardsArray.push({
              name: `${nativeTokenSymbol}–${assetTokenMetadata.toHuman()?.symbol}`,
              lpTokenAsset: lpToken ? lpToken : null,
              lpTokenId: lpTokenId,
              assetTokenId: pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, ""),
              totalTokensLocked: {
                nativeToken: {
                  decimals: nativeTokenDecimals || "0",
                  icon: NativeTokenIcon,
                  formattedValue: nativeTokenFormatted,
                  value: nativeToken,
                },
                assetToken: {
                  decimals: assetTokenDecimals,
                  icon: AssetTokenIcon,
                  formattedValue: assetTokenFormated,
                  value: assetToken,
                },
              },
            });
          }
        }
      })
    );

    poolCardsArray.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    poolCardsArray.sort((a, b) => {
      if (a.lpTokenAsset === null) return 1;
      if (b.lpTokenAsset === null) return -1;
      return parseInt(a?.lpTokenAsset?.balance) - parseInt(b?.lpTokenAsset?.balance);
    });

    dispatch({ type: ActionType.SET_POOLS_CARDS, payload: poolCardsArray });
  } catch (error) {
    dotAcpToast.error(t("poolsPage.errorFetchingPools", { error: error }));
  }
};

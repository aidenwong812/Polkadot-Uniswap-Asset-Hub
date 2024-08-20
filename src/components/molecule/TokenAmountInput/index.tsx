import classNames from "classnames";
import { t } from "i18next";
import React, { useRef, useState } from "react";
import { NumericFormat } from "react-number-format";
import useClickOutside from "../../../app/hooks/useClickOutside";
import { ButtonVariants } from "../../../app/types/enum";
import { formatDecimalsFromToken } from "../../../app/util/helper";
import { LottieSmall } from "../../../assets/loader";
import Button from "../../atom/Button";

type TokenAmountInputProps = {
  tokenText: string;
  tokenBalance?: string;
  tokenId?: string;
  tokenDecimals?: string | undefined;
  disabled?: boolean;
  className?: string;
  tokenIcon?: React.ReactNode;
  tokenValue?: string;
  labelText?: string;
  selectDisabled?: boolean;
  assetLoading?: boolean;
  withdrawAmountPercentage?: number;
  onClick: () => void;
  onSetTokenValue: (value: string) => void;
  onMaxClick?: () => void;
};

const TokenAmountInput = ({
  tokenIcon,
  tokenText,
  tokenBalance,
  tokenId,
  tokenDecimals,
  disabled,
  tokenValue,
  labelText,
  selectDisabled,
  assetLoading,
  withdrawAmountPercentage,
  onSetTokenValue,
  onClick,
  onMaxClick,
}: TokenAmountInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useClickOutside(wrapperRef, () => {
    setIsFocused(false);
  });

  return (
    <div
      ref={wrapperRef}
      className={classNames(
        "relative flex flex-col items-center justify-start gap-2 rounded-lg border bg-purple-100 px-4 py-6",
        {
          "border-pink": isFocused,
          "border-transparent": !isFocused,
        }
      )}
    >
      <div className="flex">
        <label htmlFor="token-amount" className="absolute top-4 text-small font-normal text-gray-200">
          {labelText}
        </label>
        <NumericFormat
          id="token-amount"
          getInputRef={inputRef}
          allowNegative={false}
          fixedDecimalScale
          displayType={"input"}
          disabled={disabled}
          placeholder={"0"}
          className="w-full basis-auto bg-transparent font-unbounded-variable text-heading-4 font-bold text-gray-300 outline-none placeholder:text-gray-200"
          onFocus={() => setIsFocused(true)}
          value={tokenValue}
          isAllowed={({ floatValue }) => {
            if (floatValue) {
              return floatValue?.toString()?.length <= 15;
            } else {
              return true;
            }
          }}
          onValueChange={({ floatValue }) => {
            onSetTokenValue(floatValue?.toString() || "");
          }}
        />

        {tokenText ? (
          <Button
            icon={tokenIcon}
            type="button"
            onClick={() => onClick()}
            variant={ButtonVariants.btnSelectGray}
            disabled={disabled || selectDisabled}
            className="basis-2/5 disabled:basis-[23%]"
          >
            {tokenText}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => onClick()}
            variant={ButtonVariants.btnSelectPink}
            className="basis-[57%]"
            disabled={disabled}
          >
            {disabled && assetLoading ? <LottieSmall /> : t("button.selectToken")}
          </Button>
        )}
      </div>
      <div className="flex w-full justify-between">
        {withdrawAmountPercentage ? (
          <span className="text-[13px] tracking-[0.2px] text-black text-opacity-50">({withdrawAmountPercentage}%)</span>
        ) : null}
        <div className="flex w-full justify-end pr-1 text-medium text-gray-200">
          Balance:{" "}
          {tokenId && tokenText && Number(tokenBalance) !== 0
            ? formatDecimalsFromToken(Number(tokenBalance?.replace(/[, ]/g, "")), tokenDecimals as string)
            : tokenBalance || 0}
          {tokenText &&
            onMaxClick &&
            process.env.VITE_ENABLE_EXPERIMENTAL_MAX_TOKENS_SWAP &&
            process.env.VITE_ENABLE_EXPERIMENTAL_MAX_TOKENS_SWAP == "true" && (
              <button
                className="inline-flex h-5 w-11 flex-col items-start justify-start gap-2 px-1.5 text-pink"
                onClick={onMaxClick}
              >
                MAX
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default TokenAmountInput;

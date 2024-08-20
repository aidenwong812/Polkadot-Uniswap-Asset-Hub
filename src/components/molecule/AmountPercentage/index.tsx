import { FC, useState } from "react";
import { NumericFormat } from "react-number-format";

interface AmountPercentageProps {
  maxValue: number;
  disabled: boolean;
  onChange: (value: number) => void;
}

const AmountPercentage: FC<AmountPercentageProps> = ({ maxValue, onChange, disabled }) => {
  const [value, setValue] = useState<number>(100);

  const handleClick = (value: number) => {
    setValue(value);
    onChange(value);
  };

  return (
    <div className="py-5">
      <h6 className="mb-2 text-center text-[13px]">Amount percentage</h6>
      <div className="flex items-center gap-[6px]">
        <div className="relative w-[75px]">
          <NumericFormat
            value={value}
            isAllowed={(values) => {
              const { formattedValue, floatValue } = values;
              return formattedValue === "" || (floatValue !== undefined && floatValue <= 100);
            }}
            onValueChange={({ value }) => {
              onChange(Number(value));
            }}
            fixedDecimalScale={true}
            thousandSeparator={false}
            allowNegative={false}
            className="w-full rounded-lg bg-purple-100 p-2 text-large  text-gray-200 outline-none"
            disabled={disabled}
          />
          <span className="absolute right-2 top-[10px] text-medium text-gray-100">%</span>
        </div>
        <button
          className="flex h-[37px] w-[65px] items-center justify-center rounded-[100px] bg-pink bg-opacity-10 text-[11px] tracking-[.66px] text-pink"
          onClick={() => handleClick(25)}
          disabled={disabled}
        >
          25%
        </button>
        <button
          className="flex h-[37px] w-[65px] items-center justify-center rounded-[100px] bg-pink bg-opacity-10 text-[11px] tracking-[.66px] text-pink"
          onClick={() => handleClick(50)}
          disabled={disabled}
        >
          50%
        </button>
        <button
          className="flex h-[37px] w-[65px] items-center justify-center rounded-[100px] bg-pink bg-opacity-10 text-[11px] tracking-[.66px] text-pink"
          onClick={() => handleClick(75)}
          disabled={disabled}
        >
          75%
        </button>
        <button
          className="flex h-[37px] w-[65px] items-center justify-center rounded-[100px] bg-pink bg-opacity-10 text-[11px] tracking-[.66px] text-pink"
          onClick={() => handleClick(maxValue)}
          disabled={disabled}
        >
          Max
        </button>
      </div>
    </div>
  );
};

export default AmountPercentage;

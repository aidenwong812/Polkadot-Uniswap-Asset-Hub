import {
  calculateSlippageAdd,
  calculateSlippageReduce,
  formatDecimalsFromToken,
  formatInputTokenValue,
  toFixedNumber,
} from "../../app/util/helper";

describe("formatInputTokenValue", () => {
  it("formats input correctly", () => {
    const base = 123.456;
    const decimals = "2";

    const result = formatInputTokenValue(base, decimals);

    expect(result).toEqual("12345");
  });

  it("handles different inputs", () => {
    const base = 0.001;
    const decimals = "4";

    const result = formatInputTokenValue(base, decimals);

    expect(result).toEqual("10");
  });

  it("handles negative base", () => {
    const base = -500.789;
    const decimals = "3";

    const result = formatInputTokenValue(base, decimals);

    expect(result).toEqual("-500789");
  });
});

describe("formatDecimalsFromToken", () => {
  it("correctly formats decimals from a token", () => {
    expect(formatDecimalsFromToken(123456, "2")).toBe("1234.56");
    expect(formatDecimalsFromToken(1000000, "6")).toBe("1");
  });

  it("handles edge cases", () => {
    expect(formatDecimalsFromToken(0, "4")).toBe("0");
    expect(formatDecimalsFromToken(-500000, "3")).toBe("-500");
  });
});

describe("calculateSlippageAdd", () => {
  it("should return the correct result with a positive token value and slippage", () => {
    expect(calculateSlippageAdd(100, 5)).toBe("105");
  });

  it("should return the correct result with a positive token value and zero slippage", () => {
    expect(calculateSlippageAdd(100, 0)).toBe("100");
  });

  it("should return the correct result with a negative token value and slippage", () => {
    expect(calculateSlippageAdd(-50, 10)).toBe("-55");
  });

  it("should return the correct result with a zero token value and slippage", () => {
    expect(calculateSlippageAdd(0, 2)).toBe("0");
  });

  it("should return the correct result with a decimal token value and slippage", () => {
    expect(calculateSlippageAdd(10.5, 3)).toBe("10.815");
  });

  it("should return the correct result with a large token value and slippage", () => {
    expect(calculateSlippageAdd(1000000, 1)).toBe("1010000");
  });

  it("should return the correct result with a decimal slippage", () => {
    expect(calculateSlippageAdd(50, 1.5)).toBe("50.75");
  });
});

describe("calculateSlippageReduce", () => {
  it("should return the correct result with a positive token value and slippage", () => {
    expect(calculateSlippageReduce(100, 5)).toBe("95");
  });

  it("should return the correct result with a positive token value and zero slippage", () => {
    expect(calculateSlippageReduce(100, 0)).toBe("100");
  });

  it("should return the correct result with a negative token value and slippage", () => {
    expect(calculateSlippageReduce(-50, 10)).toBe("-45");
  });

  it("should return the correct result with a zero token value and slippage", () => {
    expect(calculateSlippageReduce(0, 2)).toBe("0");
  });

  it("should return the correct result with a decimal token value and slippage", () => {
    expect(calculateSlippageReduce(10.5, 3)).toBe("10.185");
  });

  it("should return the correct result with a large token value and slippage", () => {
    expect(calculateSlippageReduce(1000000, 1)).toBe("990000");
  });

  it("should return the correct result with a decimal slippage", () => {
    expect(calculateSlippageReduce(50, 1.5)).toBe("49.25");
  });
});

describe("toFixedNumber", () => {
  it("formats number correctly", () => {
    const result = toFixedNumber(Number("1e+23"));
    expect(result).toEqual(100000000000000000000);
  });

  it("formats number correctly", () => {
    const result = toFixedNumber(Number("2e-4"));
    expect(result).toEqual(0.0002);
  });

  it("formats number correctly", () => {
    const result = toFixedNumber(Number("1e21"));
    expect(result).toEqual(100000000000000000000);
  });
});

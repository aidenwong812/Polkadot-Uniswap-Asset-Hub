# Working with asset Conversion pallet.

We can use polkadot js library (specifically @polkadot/api) to communicate with asset conversion pallet

## Useful links

Rust [docs](https://paritytech.github.io/substrate/master/pallet_asset_conversion/index.html) of the pallet
Try it out in [UI](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-asset-hub-rpc.polkadot.io#/extrinsics)
Asset Conversion Pallet [repo](https://github.com/paritytech/polkadot-sdk/tree/6b27dad359793a873c91d09cd3f6267d66ff543e/substrate/frame/asset-conversion)

## Polkadot.js installation and initialisation

### Installation:

`yarn add @polkadot/api`

### Initialisation

```
  import { ApiPromise, WsProvider } from '@polkadot/api';

  const wsProvider = new WsProvider('wss://westend-asset-hub-rpc.polkadot.io'); // Connect to 3rd Party RPC (OnFinality)
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;

```

## Usage

### Pool

#### Get list of all the pools:

```
  const pools = await api.query.assetConversion.pools.entries();
  console.log(pools.map(([key, value]) => [key.args[0].toString(), value.toString()]));

  // Log output:
  `[
      [
        // [Asset1 (native), Asset2] MultiLocation
        '[{"parents":0,"interior":{"here":null}},{"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":2511}]}}]',
        '{"lpToken":4}'
      ],
      [
        '[{"parents":0,"interior":{"here":null}},{"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":1977}]}}]',
        '{"lpToken":0}'
      ],
```

#### Create a new Pool

We can only create Native Coin -> Asset pools, not Asset1 -> Asset2

```
  const result = await api.tx.assetConversion.createPool(
      {"parents":0,"interior":{"here":null}}, // Native Coin MultiLocation
      {"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":420420}]}} // Asset in Assethub MultiLocation
  ).signAndSend(wallet);
```

#### Add Liquidity to Pool

```
  const result = await api.tx.assetConversion.addLiquidity(
      {"parents":0,"interior":{"here":null}},
      {"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":420420}]}},
      10000, // desired amount of token1 to provide as liquidity (calculations happen when tx in executed)
      10000, // desired amount of token2 to provide as liquidity
      100, // minimum amount of token1 to provide as liquidity
      100, // minimum amount of token2 to provide as liquidity
      "5ERLqAatjG1r5YyotuZevxC59hNNrb81soVKnd5BXLRwiUDb", // address to mint LP tokens
  ).signAndSend(wallet);
```

#### Remove Liquidity from Pool

```
  const result = await api.tx.assetConversion.removeLiquidity(
      {"parents":0,"interior":{"here":null}},
      {"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":420420}]}},
      100, // amount of Lp token to burn
      1000, // minimum amount of token1 to provide as liquidity
      124444, // minimum amount of token2 to provide as liquidity
      "5ERLqAatjG1r5YyotuZevxC59hNNrb81soVKnd5BXLRwiUDb", // token withdrawal address
  ).signAndSend(wallet);
```

#### Get pool reserves

```
  import { u8aToHex } from '@polkadot/util';

  // get input parameters as encoded SCALE Uint8Array
  const multiLocation = api.createType('MultiLocation', {
      parents: 0,
      interior: {
        X2: [
          { PalletInstance: 50 },
          { GeneralIndex: 30 }
        ]
      }
  }).toU8a();
  const multiLocation2 = api.createType('MultiLocation', {
    parents: 0,
    interior: {
      here: null
    }
  }).toU8a();
  const amount = api.createType('u128', 2).toU8a();
  const bool = api.createType('bool', false).toU8a();

  // concatenate  Uint8Arrays of input parameters
  const encodedInput = new Uint8Array(multiLocation.length + multiLocation2.length);
  encodedInput.set(multiLocation, 0); // Set array1 starting from index 0
  encodedInput.set(multiLocation2, multiLocation.length); // Set array2 starting from the end of array1

  // create Hex from concatenated u8a
  const encodedInputHex = u8aToHex(encodedInput);

  // call rpc state call where first parameter is method to be called and second one is Hex representation of encoded input parameters
  const reservers = await api.rpc.state.call('AssetConversionApi_get_reserves', encodedInputHex)

  // decode response
  const decoded = api.createType('Option<(u128, u128)', reservers);
  console.log(decoded.toHuman());
```

### Swap

#### Swap exact tokens to tokens

Useful when user wants to swap exact amount of input token (wants to exchange 100USD for however he gets of other token (with min defined))

1. Swap Native Coin for Asset in Asset Hub

```
  const result = await api.tx.assetConversion.swapExactTokensForTokens(
      [
          {"parents":0,"interior":{"here":null}},
          {"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":4200}]}}
      ], // path array
      12, // amount of tokens to swap
      150, // minimum amount of token2 user wants to receive
      "5ERLqAatjG1r5YyotuZevxC59hNNrb81soVKnd5BXLRwiUDb", // address to receive swapped tokens
      false // Keep alive parameter
  ).signAndSend(wallet);
```

2. Swap Asset(ID: 32) -> Asset(ID: 4200) from Asset Hub

```
  const result = await api.tx.assetConversion.swapExactTokensForTokens(
      [
          {"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":32}]}}
          {"parents":0,"interior":{"here":null}},
          {"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":4200}]}}
      ], // path array (path includes middle Native Coin Multilocation)
      12, // amount of tokens to swap
      150, // minimum amount of token2 user wants to receive
      "5ERLqAatjG1r5YyotuZevxC59hNNrb81soVKnd5BXLRwiUDb", // address to receive swapped tokens
      false // Keep alive parameter
  ).signAndSend(wallet);
```

#### Swap tokens to exact tokens

Useful when user wants get exact amount of output token (wants to get exactly 1 BTC for some amount of token2 (with max defined))

1. Swap Native Coin for Asset in Asset Hub

```
  const result = await api.tx.assetConversion.swapTokensForExactTokens(
      [
          {"parents":0,"interior":{"here":null}},
          {"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":4200}]}}
      ], // path array
      12, // amount of tokens to get
      150, // maximum amount of tokens to spend
      "5ERLqAatjG1r5YyotuZevxC59hNNrb81soVKnd5BXLRwiUDb", // address to receive swapped tokens
      false // Keep alive parameter
  ).signAndSend(wallet);
```

2. Swap Asset(ID: 32) -> Asset(ID: 4200) from Asset Hub

```
  const result = await api.tx.assetConversion.swapTokensForExactTokens(
      [
          {"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":32}]}}
          {"parents":0,"interior":{"here":null}},
          {"parents":0,"interior":{"x2":[{"palletInstance":50},{"generalIndex":4200}]}}
      ], // path array (path includes middle Native Coin Multilocation)
      12, // amount of tokens to get
      150, // maximum amount of tokens to spend
      "5ERLqAatjG1r5YyotuZevxC59hNNrb81soVKnd5BXLRwiUDb", // address to receive swapped tokens
      false // Keep alive parameter
  ).signAndSend(wallet);
```

## Prices

We can fetch token amounts required for specific swap (exact input or exact output).  
Always take into account possible slippage
Currently we can only get amount of tokens for Native Coin -> Asset and Asset -> Native Coin swaps, but not for Asset -> Asset

_**Note**_:

One solution to get Asset1 -> Asset2 swaps prices is quoting first Asset1 -> Native Coin and puting its output as input amount for second quote price call Native Coin -> Asset2. But there we run into non-consistency with actual amout of tokens user gets afrer swap (15+%, more than expected slippage)

```
Diff between quote price and actual amount received after swap between 2 different Assets(~20%)
9 -> 6
565 -> 482
814 -> 674
1,777 -> 1580
There is a difference of 1 Token when trying to swap for same asset [Asset1 -> DOT -> Asset1]
1000 -> 999
100 -> 99
10 -> 9
```

### Between Native Coin and Asset (Token)

#### Exact Input

Get amount of token2 you should get if you swap specified amount of token1

```
  import { u8aToHex } from '@polkadot/util';

  // get input parameters as encoded SCALE Uint8Array
  const multiLocation = api.createType('MultiLocation', {
      parents: 0,
      interior: {
        X2: [
          { PalletInstance: 50 },
          { GeneralIndex: 30 }
        ]
      }
  }).toU8a();
  const multiLocation2 = api.createType('MultiLocation', {
    parents: 0,
    interior: {
      here: null
    }
  }).toU8a();
  const amount = api.createType('u128', 2).toU8a();
  const bool = api.createType('bool', false).toU8a();

  // concatenate  Uint8Arrays of input parameters
  const encodedInput = new Uint8Array(multiLocation.length + multiLocation2.length + amount.length + bool.length);
  encodedInput.set(multiLocation, 0); // Set array1 starting from index 0
  encodedInput.set(multiLocation2, multiLocation.length); // Set array2 starting from the end of array1
  encodedInput.set(amount, multiLocation.length + multiLocation2.length); // Set array3 starting from the end of array1 + array2
  encodedInput.set(bool, multiLocation.length + multiLocation2.length + amount.length); // Set array3 starting from the end of array1 + array2

  // create Hex from concatenated u8a
  const encodedInputHex = u8aToHex(encodedInput);

  // call rpc state call where first parameter is method to be called and second one is Hex representation of encoded input parameters
  const response = await api.rpc.state.call('AssetConversionApi_quote_price_exact_tokens_for_tokens', encodedInputHex)

  // decode response
  const decodedprice = api.createType('Option<u128>', response);
  console.log(decodedprice.toHuman());
```

#### Exact output

Get amount of token1 you should put in if you want to get specified amount of token2 after the swap

```
   import { u8aToHex } from '@polkadot/util';

  // get input parameters as encoded SCALE Uint8Array
  const multiLocation = api.createType('MultiLocation', {
      parents: 0,
      interior: {
        X2: [
          { PalletInstance: 50 },
          { GeneralIndex: 30 }
        ]
      }
  }).toU8a();
  const multiLocation2 = api.createType('MultiLocation', {
    parents: 0,
    interior: {
      here: null
    }
  }).toU8a();
  const amount = api.createType('u128', 2).toU8a();
  const bool = api.createType('bool', false).toU8a();

  // concatenate  Uint8Arrays of input parameters
  const encodedInput = new Uint8Array(multiLocation.length + multiLocation2.length + amount.length + bool.length);
  encodedInput.set(multiLocation, 0); // Set array1 starting from index 0
  encodedInput.set(multiLocation2, multiLocation.length); // Set array2 starting from the end of array1
  encodedInput.set(amount, multiLocation.length + multiLocation2.length); // Set array3 starting from the end of array1 + array2
  encodedInput.set(bool, multiLocation.length + multiLocation2.length + amount.length); // Set array3 starting from the end of array1 + array2

  // create Hex from concatenated u8a
  const encodedInputHex = u8aToHex(encodedInput);

  // call rpc state call where first parameter is method to be called and second one is Hex representation of encoded input parameters
  const response = await api.rpc.state.call('AssetConversionApi_quote_price_tokens_for_exact_tokens', encodedInputHex)

  // decode response
  const decodedprice = api.createType('Option<u128>', response);
  console.log(decodedprice.toHuman());
```

### Between 2 Assets (Tokens) simplified

Exact Input (Token1 -> Token2):

- Quote exact tokens for tokens (token1 -> native), decode
- Quote exact tokens for tokens (decoded native -> token2)

Exact Output (Token1 -> Token2):

- Quote tokens for exact tokens (token2 -> native), decode
- Quote tokens for exact tokens (decoded native -> token1)

#### Exact Output

Get amount of token1 you should put in if you want to get specified amount of token2 after the swap

```
   import { u8aToHex } from '@polkadot/util';

  // get input parameters as encoded SCALE Uint8Array
  const multiLocation1 = api.createType('MultiLocation', {
      parents: 0,
      interior: {
        X2: [
          { PalletInstance: 50 },
          { GeneralIndex: 30 }
        ]
      }
  }).toU8a();
  const nativeTokenMultiLocation = api.createType('MultiLocation', {
    parents: 0,
    interior: {
      here: null
    }
  }).toU8a();
  const multiLocation2 = api.createType('MultiLocation', {
      parents: 0,
      interior: {
        X2: [
          { PalletInstance: 50 },
          { GeneralIndex: 32 }
        ]
      }
  }).toU8a();
  const token2Amount = api.createType('u128', token2Amount).toU8a(); // user's input: _token2Amount_ (amount of token2 he wants to get after swap)
  const bool = api.createType('bool', false).toU8a();

  // this is u8a concatenation and hex encoding similar to one in get pool reserves calls, just with 4 parameters instead of 2
  // this logic was shown more simply (moved into a function) so there wouldn't be too much repetition in examples
  const encodedInputHex = concatAndHexEncodeU8A(nativeTokenMultiLocation, multiLocation2, token2Amount, bool);

  // call rpc state call where first parameter is method to be called and second one is Hex representation of encoded input parameters
  const response = await api.rpc.state.call('AssetConversionApi_quote_price_tokens_for_exact_tokens', encodedInputHex)

  // decode response
  const decodedAmount = api.createType('Option<u128>', response);
  // get amount for second rpc call
  const amountOfNativetTokens = api.createType('u128', BigInt(decodedAmount.toString())).toU8a();

  const encodedInputHex2 = concatAndHexEncodeU8A(multiLocation1, nativeTokenMultiLocation, amountOfNativetTokens, bool);

  const response2 = await api.rpc.state.call('AssetConversionApi_quote_price_tokens_for_exact_tokens', encodedInputHex2)
  const decodedAmount2 = api.createType('Option<u128>', response3);
  console.log(decodedAmount2.toHuman()); // This is the amount of token1 user should spend to get token2Amount after the swap
```

#### Exact Input

Get amount of token2 you should get for specified amount of token1 after the swap

```
   import { u8aToHex } from '@polkadot/util';

  // get input parameters as encoded SCALE Uint8Array
  const multiLocation1 = api.createType('MultiLocation', {
      parents: 0,
      interior: {
        X2: [
          { PalletInstance: 50 },
          { GeneralIndex: 30 }
        ]
      }
  }).toU8a();
  const nativeTokenMultiLocation = api.createType('MultiLocation', {
    parents: 0,
    interior: {
      here: null
    }
  }).toU8a();
  const multiLocation2 = api.createType('MultiLocation', {
      parents: 0,
      interior: {
        X2: [
          { PalletInstance: 50 },
          { GeneralIndex: 32 }
        ]
      }
  }).toU8a();
  const token1Amount = api.createType('u128', token1Amount).toU8a(); // user's input: _token1Amount_ (amount of token1 he wants to spend in swap)
  const bool = api.createType('bool', false).toU8a();

  // this is u8a concatenation and hex encoding similar to one in get pool reserves calls, just with 4 parameters instead of 2
  // this logic was shown more simply (moved into a function) so there wouldn't be too much repetition in examples
  const encodedInputHex = concatAndHexEncodeU8A(multiLocation1, nativeTokenMultiLocation, token1Amount, bool);

  // call rpc state call where first parameter is method to be called and second one is Hex representation of encoded input parameters
  const response = await api.rpc.state.call('AssetConversionApi_quote_price_exact_tokens_for_tokens', encodedInputHex)

  // decode response
  const decodedAmount = api.createType('Option<u128>', response);
  // get amount for second rpc call
  const amountOfNativetTokens = api.createType('u128', BigInt(decodedAmount.toString())).toU8a();

  const encodedInputHex2 = concatAndHexEncodeU8A(nativeTokenMultiLocation, multiLocation2, amountOfNativetTokens, bool);

  const response2 = await api.rpc.state.call('AssetConversionApi_quote_price_exact_tokens_for_tokens', encodedInputHex2)
  const decodedAmount2 = api.createType('Option<u128>', response3);
  console.log(decodedAmount2.toHuman()); // This is the amount of token2 user should get after swap for token1Amount
```

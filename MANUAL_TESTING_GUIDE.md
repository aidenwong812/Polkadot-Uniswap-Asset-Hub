# dotACP: Manual testing guide

Want to test and break dotACP? Awesome! Follow the instructions below to manually test this feature. dotACP is supported on Westend and Rococo, and the steps are identical unless explicitely stated otherwise. 
- [Westend staging](https://dot-acp-westmint.mvpworkshop.co/)
- [Rococo staging](https://dot-acp-rococo.mvpworkshop.co/)

## Install some Polkadot browser extension wallet

To test the staging environment, you'll need to have the Polkadot wallet browser extension installed. We've successfully tested it with three wallet options: polkadot.js, Subwallet, and Talisman. These wallets are fully supported.

## Get tokens

For testing on Westend (WND Token) or Rococo (ROC Token) testnet you will need some test tokens. There is a daily limit of 10 WNDs and 100 ROCs that can be issued to one wallet.

- [Westend faucet](https://paritytech.github.io/polkadot-testnet-faucet/westend)
- [Rococo faucet](https://paritytech.github.io/polkadot-testnet-faucet/)

Once you have tokens on the Westend/Rococo parachains, teleport them to the Asset Hub parachain
- Sign in / Create your [polkadot.js account](https://polkadot.js.org/)
- Open the Polkadot substrate portal [account page](https://polkadot.js.org/apps/#/accounts).
- In the top bar select Accounts / Teleport
- Transfer your WND/ROC tokens to Asset Hub. Teleport requires some gas fees.
- In the top left dropdown select TEST WESTEND/ROCOCO & PARACHAINS > AssetHub > Switch to confirm that the tokens are transferred and ready for testing

## Swap your WNDs/ROCs for other tokens

With your WNDs/ROCs, you can cover the gas fees and you can swap your WNDs or ROCs to some of the other tokens we support in dotACP.

## Create your own tokens to test

You can also create your own tokens and import them into dotACP. To do this, you'll need to utilize the Asset Hub. Below, you'll find the steps for creating tokens, and a short video tutorial on how you can create it on Rococo - [here](https://www.loom.com/share/5ddad5dbe2f140debb1f336e02de69d0?sid=d3a0b4b0-519f-4423-9647-ff57020dc9af) (for Westend [here](https://www.loom.com/share/e6bfb71ae193442da01d9f7444294ad9?sid=066baf57-5714-4172-a06f-b33f6b9c32d4)).

- Sign in / Create your [polkadot.js account](https://polkadot.js.org/)
- Open the Polkadot substrate portal [app](https://polkadot.js.org/apps/#/explorer).
- For adding assets on <b>Westend choose Westend, Asset Hub</b> as your network. For adding assets on <b>Rococo, choose Rococo, Asset Hub</b> as your network.
- In the <b>Network</b> dropdown click on <b>Assets</b>. Then click on the <b>top right plus button</b> to create a new asset. Those will be your tokens. <b>(We do not recommend putting high values on a minimal amount field when creating a new asset, 1 will do).</b>
- Once the asset is created, you need to find it in the <b>Asset list</b> and click on the <b>plus button - mint</b>. Then you set how much you want to mint to your wallet for testing.
- Once you have your asset, you can check its balance by <b>switching from overview to balance</b>. Then you find your asset to query by the name or ID and check if you have the desired balance.

## Test dotACP with your own tokens

Once you have your own tokens, those will appear in the <b>dotACP interface under the list of tokens</b> you possess and can swap or make liquidity pairs.

Test, play around, and get back to us with comments! 🚀

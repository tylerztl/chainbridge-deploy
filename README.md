# BNB <=> JAZ ChainBridge Deploy

## Prerequisites
- Go 1.15+ installation or later
- nodejs 14.17.x
- npm 6.14.x
- Docker
- docker-compose

## Token list
### RACA
#### ResourceID
```
// utf-8 encoding of "bnb.jaz.raca"
0x00000000000000000000000000000000000000626e622e6a617a2e7261636100
```
#### SRC_TOKEN
```
0x55076D7b0977b4623F81d0f97940797424cA83FA
```
#### DST_TOKEN
```
0x49311f0355e83213553fe21eC6592B2CdA874857
```
### WBNB
#### ResourceID
```
// utf-8 encoding of "bnb.jaz.wbnb"
0x00000000000000000000000000000000000000626e622e6a617a2e77626e6200
```
#### SRC_TOKEN
```
0x55076D7b0977b4623F81d0f97940797424cA83FA
```
#### DST_TOKEN
```
0x0000000000000000000000000000000000000804
```

## Tooling
### cb-sol-cli
We will be using the ChainBridge contract CLI to deploy and interact with the contracts. Grab and install the CLI by running:
```
git clone -b v1.0.0 --depth 1 https://github.com/ChainSafe/chainbridge-deploy \
&& cd chainbridge-deploy/cb-sol-cli \
&& npm install \
&& make install
```

## Getting started

### Generate ethereum account key-pairs
You can generate it in a way you think is safe, and then save the private key and mnemonic by yourself.
Testing accounts are provided in the `wallet`.

Replace the generated relayer accounts into `config.json`.

The tools provided by ChainBridge are an alternative, see the [keystore](https://chainbridge.chainsafe.io/configuration/#keystore).

### Set chainbridge vars
To avoid duplication in the subsequent commands set the following env vars in your shell:
```
SRC_GATEWAY=https://bsc-testnet.public.blastapi.io/
DST_GATEWAY=https://rpc1.jaz.network/

SRC_ADDR="<relayers public key on BNB Chain>"
SRC_PK="<deployer private key on BNB Chain>"
DST_ADDR="<relayers public key on JAZ Chain>"
DST_PK="<deployer private key on JAZ Chain>"

SRC_TOKEN="0x0000000000000000000000000000000000000804"
RESOURCE_ID="0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
```
You could also write the above to a file (e.g. `chainbridge-vars`) and load it into your shell by running `set -a; source ./chainbridge-vars; set +a`.

### Deploy bridge contracts
Please follow the guide: [Deploying a Live EVM->EVM Token Bridge](https://chainbridge.chainsafe.io/live-evm-bridge/).

#### Steps
1. Deploy contracts on Source
The following command will deploy the bridge contract and ERC20 handler contract on the source.

> Note:
> 
> BNB mainnet min gasPrice is 1 Gwei
> 
> BNB testnet min gasPrice is 10 Gwei
>
> JAZ network min gasPrice is 0.1 Gwei

```
cb-sol-cli --url $SRC_GATEWAY --privateKey $SRC_PK --gasPrice 10000000000 deploy \
    --bridge --erc20Handler \
    --relayers $SRC_ADDR \
    --relayerThreshold 2\
    --expiry 500 \
    --chainId 0
```
output:
```
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed

================================================================
Url:        https://bsc-testnet.public.blastapi.io/
Deployer:   0x758a5D7F2934Ce3136dF30C1180B446Aa5506bEE
Gas Limit:   8000000
Gas Price:   10000000000
Deploy Cost: 0.03710507

Options
=======
Chain Id:    0
Threshold:   2
Relayers:    0x2bAe5160A67FFE0d2dD9114c521dd51689FDB549,0x994354275A3512fc3C54543E1b400ea9dA1d3A0f,0xdfAE3230656b0AfBBdc5f4F16F49eEF9398fB51f
Bridge Fee:  0
Expiry:      500

Contract Addresses
================================================================
Bridge:             0x90636562b1f8CF3Fc7bE309742CD6AB0D4d5d417
----------------------------------------------------------------
Erc20 Handler:      0x1aa360D6e6Ba0320C767B361438FD81E92060480
----------------------------------------------------------------
Erc721 Handler:     Not Deployed
----------------------------------------------------------------
Generic Handler:    Not Deployed
----------------------------------------------------------------
Erc20:              Not Deployed
----------------------------------------------------------------
Erc721:             Not Deployed
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
================================================================
```
Take note of the output of the above command and assign the following variables to `chainbridge-vars`.
```
SRC_BRIDGE="<resulting bridge contract address>"
SRC_HANDLER="<resulting erc20 handler contract address>"
```

2. Configure contracts on Source
The following registers the ERC20 token as a resource with a bridge contract and configures which handler to use.
```
cb-sol-cli --url $SRC_GATEWAY --privateKey $SRC_PK --gasPrice 10000000000 bridge register-resource \
    --bridge $SRC_BRIDGE \
    --handler $SRC_HANDLER \
    --resourceId $RESOURCE_ID \
    --targetContract $SRC_TOKEN
```
output:
```
[bridge/register-resource] Registering contract 0x55076D7b0977b4623F81d0f97940797424cA83FA with resource ID 0x00000000000000000000000000000000000000626e622e6a617a2e7261636100 on handler 0x1aa360D6e6Ba0320C767B361438FD81E92060480
Waiting for tx: 0x6e38393979f77f3b348e7f0172f269a5807a8fe7f75469a15ef31b202eea2bf7...
```

3. Deploy contracts on Destination

The following command deploys the bridge contract, handler and a new ERC20 contract on the destination chain.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 100000000 deploy \
    --bridge --erc20Handler \
    --relayers $DST_ADDR \
    --relayerThreshold 2 \
    --chainId 1
```
output:
```
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed

================================================================
Url:        https://rpc1.jaz.network/
Deployer:   0x758a5D7F2934Ce3136dF30C1180B446Aa5506bEE
Gas Limit:   8000000
Gas Price:   100000000
Deploy Cost: 0.0003716607

Options
=======
Chain Id:    1
Threshold:   2
Relayers:    0x2bAe5160A67FFE0d2dD9114c521dd51689FDB549,0x994354275A3512fc3C54543E1b400ea9dA1d3A0f,0xdfAE3230656b0AfBBdc5f4F16F49eEF9398fB51f
Bridge Fee:  0
Expiry:      100

Contract Addresses
================================================================
Bridge:             0x37Df589AC6Ccc6DbD367153DbfC6803008eD5773
----------------------------------------------------------------
Erc20 Handler:      0x6999b59C240068CaEFA25597c7cF174500025669
----------------------------------------------------------------
Erc721 Handler:     Not Deployed
----------------------------------------------------------------
Generic Handler:    Not Deployed
----------------------------------------------------------------
Erc20:              Not Deployed
----------------------------------------------------------------
Erc721:             Not Deployed
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
================================================================
```
Again, assign the following env variables to `chainbridge-vars`.
```
DST_BRIDGE="<resulting bridge contract address>"
DST_HANDLER="<resulting erc20 handler contract address>"
DST_TOKEN="<resulting erc20 token address>"
```

4. Configure contracts on Destination
The following registers the new ERC20 token as a resource on the bridge similar to the above.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 100000000 bridge register-resource \
    --bridge $DST_BRIDGE \
    --handler $DST_HANDLER \
    --resourceId $RESOURCE_ID \
    --targetContract $DST_TOKEN
```
The following registers the token as mintable/burnable on the bridge.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 100000000 bridge set-burn \
    --bridge $DST_BRIDGE \
    --handler $DST_HANDLER \
    --tokenContract $DST_TOKEN
```
The following gives permission for the handler to mint new ERC20 tokens.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 100000000 erc20 add-minter \
    --minter $DST_HANDLER \
    --erc20Address $DST_TOKEN
```

## Build configs
*Note: if the contract address is modified, don't forget to update the contract address in `config.json`*

[cfgBuilder](https://github.com/ChainSafe/chainbridge-deploy/tree/main/cfgBuilder) is a simple CLI tool to help automate deployment of new relayers.

### Usage
```
cfgBuilder config.json config
```

## Set up keys
The relayer maintains its own keystore.
```
chainbridge accounts import --privateKey $RELAYER_PK
```

## Lets test our bridge!
### Start relayers
```
docker-compose up -d 
```

### Deposit token
#### BNB => JAZ
Approve the handler to spend tokens on our behalf (to transfer them to the token safe).

```
cb-sol-cli --url $SRC_GATEWAY --privateKey $SRC_PK --gasPrice 10000000000 erc20 approve \
    --amount 100 \
    --erc20Address $SRC_TOKEN \
    --recipient $SRC_HANDLER
```
Note: Most ERC20 contracts use 18 decimal places. The amount specified will be encoded with the necessary decimal places. This can be configured with --decimals on the erc20 command.

##### Execute a deposit.
```
cb-sol-cli --url $SRC_GATEWAY --privateKey $SRC_PK --gasPrice 10000000000 erc20 deposit \
    --amount 10 \
    --dest 1 \
    --bridge $SRC_BRIDGE \
    --recipient 0x5849771139978fe0B3D52303d71D222a347e7CaB \
    --resourceId $RESOURCE_ID
```
The relayer will wait 3 block confirmations before submitting a request which may take a few minutes on the test network. Keep an eye on the target=XXXX output in the chainbridge relayer window. 
The transfer will occur when this reaches the block height of the deposit transaction.

#### JAZ => BNB

Approve the handler on the destination chain to move tokens on our behalf (to burn them).
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 10000000000 erc20 approve \
    --amount 10 \
    --erc20Address $DST_TOKEN \
    --recipient $DST_HANDLER
```
Transfer the wrapped tokens back to the bridge. This should result in the locked tokens being freed on the source chain and returned to your account.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 10000000000 erc20 deposit \
    --amount 1 \
    --dest 0 \
    --bridge $DST_BRIDGE \
    --recipient 0x91388a75f30065f6F1D679541C6aDc2c3ade08A8 \
    --resourceId $RESOURCE_ID
```

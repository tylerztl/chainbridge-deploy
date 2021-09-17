# Findora <=> Ethereum ChainBridge Deploy

## Prerequisites
- Go 1.15+ installation or later
- Docker
- docker-compose

## Getting started

### Generate ethereum account key-pairs
You can generate it in a way you think is safe, and then save the private key and mnemonic by yourself.
Testing accounts are provided in the `wallet`.

Replace the generated relayer accounts into `config.json`.

The tools provided by ChainBridge are an alternative, see the [keystore](https://chainbridge.chainsafe.io/configuration/#keystore).

### Deploy bridge contracts
Please follow the guide: [Deploying a Live EVM->EVM Token Bridge](https://chainbridge.chainsafe.io/live-evm-bridge/).

chainbridge-vars
```
SRC_GATEWAY=https://goerli-light.eth.linkpool.io/
DST_GATEWAY=https://dev-evm.dev.findora.org:8545/

SRC_ADDR="0x2bae5160a67ffe0d2dd9114c521dd51689fdb549","0x994354275a3512fc3c54543e1b400ea9da1d3a0f","0xdfae3230656b0afbbdc5f4f16f49eef9398fb51f"
SRC_PK="1d3cb5dada1ea8d4453e9e10749a6a608ee0d89a4ad9f9e0241f40346e0f0957"
DST_ADDR="0x2bae5160a67ffe0d2dd9114c521dd51689fdb549","0x994354275a3512fc3c54543e1b400ea9da1d3a0f","0xdfae3230656b0afbbdc5f4f16f49eef9398fb51f"
DST_PK="59a6e32ed4240917b1ebe7de6fd5c3b672376badca34828b642837e9395980e1"

SRC_TOKEN="0xaFF4481D10270F50f203E0763e2597776068CBc5"
RESOURCE_ID="0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"

SRC_BRIDGE="0x4D20F35DfF614394514742f91D81B5524Ad18B9b"
SRC_HANDLER="0xDe1cd474Bd884B818fb2D4fad7e7E6c4114bcCbF"

DST_BRIDGE="0x26925046a09d9AEfe6903eae0aD090be06186Bd9"
DST_HANDLER="0xE75Fb7714B5098E20A2D224693A1c210ad0c1A42"
DST_TOKEN="0xA22D8D5479abb04571Fb747ec94B598244e69EcB"
```
load it into your shell by running `set -a; source ./chainbridge-vars; set +a`.

#### Steps
1. Deploy contracts on Source (Görli)
The following command will deploy the bridge contract and ERC20 handler contract on the source.
```
cb-sol-cli --url $SRC_GATEWAY --privateKey $SRC_PK --gasPrice 10000000000 deploy \
    --bridge --erc20Handler \
    --relayers $SRC_ADDR \
    --relayerThreshold 3\
    --chainId 0
```
output:
```
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed

================================================================
Url:        https://goerli-light.eth.linkpool.io/
Deployer:   0x5849771139978fe0B3D52303d71D222a347e7CaB
Gas Limit:   8000000
Gas Price:   10000000000
Deploy Cost: 0.0594445

Options
=======
Chain Id:    0
Threshold:   3
Relayers:    0x2bae5160a67ffe0d2dd9114c521dd51689fdb549,0x994354275a3512fc3c54543e1b400ea9da1d3a0f,0xdfae3230656b0afbbdc5f4f16f49eef9398fb51f
Bridge Fee:  0
Expiry:      100

Contract Addresses
================================================================
Bridge:             0x4D20F35DfF614394514742f91D81B5524Ad18B9b
----------------------------------------------------------------
Erc20 Handler:      0xDe1cd474Bd884B818fb2D4fad7e7E6c4114bcCbF
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
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```
Take note of the output of the above command and assign the following variables.
```
SRC_BRIDGE="<resulting bridge contract address>"
SRC_HANDLER="<resulting erc20 handler contract address>"
```

2. Configure contracts on Source
The following registers the WEENUS token as a resource with a bridge contract and configures which handler to use.
```
cb-sol-cli --url $SRC_GATEWAY --privateKey $SRC_PK --gasPrice 10000000000 bridge register-resource \
    --bridge $SRC_BRIDGE \
    --handler $SRC_HANDLER \
    --resourceId $RESOURCE_ID \
    --targetContract $SRC_TOKEN
```
output:
```
[bridge/register-resource] Registering contract 0xaFF4481D10270F50f203E0763e2597776068CBc5 with resource ID 0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00 on handler 0xDe1cd474Bd884B818fb2D4fad7e7E6c4114bcCbF
Waiting for tx: 0xb0f97d4b2a1dc8cbc6586a5c9c79d146ce2933a93af4213e3fe630a079b9d4a8...
```

3. Deploy contracts on Destination (Findora)

*Note: Findora network min gas price is 100 Gwei*

The following command deploys the bridge contract, handler and a new ERC20 contract (wWEENUS) on the destination chain. It also configures your account as a verified relayer.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 1000000000000 deploy\
    --bridge --erc20 --erc20Handler \
    --relayers $DST_ADDR \
    --relayerThreshold 3 \
    --chainId 1
```
output:
```
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed
✓ ERC20 contract deployed

================================================================
Url:        https://dev-evm.dev.findora.org:8545/
Deployer:   0x91388a75f30065f6F1D679541C6aDc2c3ade08A8
Gas Limit:   8000000
Gas Price:   1000000000000
Deploy Cost: 7.606548

Options
=======
Chain Id:    1
Threshold:   3
Relayers:    0x2bae5160a67ffe0d2dd9114c521dd51689fdb549,0x994354275a3512fc3c54543e1b400ea9da1d3a0f,0xdfae3230656b0afbbdc5f4f16f49eef9398fb51f
Bridge Fee:  0
Expiry:      100

Contract Addresses
================================================================
Bridge:             0x26925046a09d9AEfe6903eae0aD090be06186Bd9
----------------------------------------------------------------
Erc20 Handler:      0xE75Fb7714B5098E20A2D224693A1c210ad0c1A42
----------------------------------------------------------------
Erc721 Handler:     Not Deployed
----------------------------------------------------------------
Generic Handler:    Not Deployed
----------------------------------------------------------------
Erc20:              0xA22D8D5479abb04571Fb747ec94B598244e69EcB
----------------------------------------------------------------
Erc721:             Not Deployed
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```
Again, assign the following env variables.
```
DST_BRIDGE="<resulting bridge contract address>"
DST_HANDLER="<resulting erc20 handler contract address>"
DST_TOKEN="<resulting erc20 token address>"
```

4. Configure contracts on Destination
The following registers the new token (wWEENUS) as a resource on the bridge similar to the above.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 1000000000000 bridge register-resource \
    --bridge $DST_BRIDGE \
    --handler $DST_HANDLER \
    --resourceId $RESOURCE_ID \
    --targetContract $DST_TOKEN
```
The following registers the token as mintable/burnable on the bridge.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 1000000000000 bridge set-burn \
    --bridge $DST_BRIDGE \
    --handler $DST_HANDLER \
    --tokenContract $DST_TOKEN
```
The following gives permission for the handler to mint new wWEENUS tokens.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 1000000000000 erc20 add-minter \
    --minter $DST_HANDLER \
    --erc20Address $DST_TOKEN
```

## Build configs
*Note: if the contract address is modified, don't forget to update the contract address in `config.json`*

[cfgBuilder](https://github.com/ChainSafe/chainbridge-deploy/tree/main/cfgBuilder) is a simple CLI tool to help automate deployment of new relayers.

### Usage
```
$ cfgBuilder config.json config
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

### Approve token
Approve the handler to spend tokens on our behalf (to transfer them to the token safe).
```
cb-sol-cli --url $SRC_GATEWAY --privateKey $SRC_PK --gasPrice 10000000000 erc20 approve \
    --amount 100000000000000000000 \
    --erc20Address $SRC_TOKEN \
    --recipient $SRC_HANDLER
```
Note: Most ERC20 contracts use 18 decimal places. The amount specified will be encoded with the necessary decimal places. This can be configured with --decimals on the erc20 command.

### Execute a deposit.
```
cb-sol-cli --url $SRC_GATEWAY --privateKey $SRC_PK --gasPrice 10000000000 erc20 deposit \
    --amount 100000000000000000000 \
    --dest 1 \
    --bridge $SRC_BRIDGE \
    --recipient 0x91388a75f30065f6f1d679541c6adc2c3ade08a8 \
    --resourceId $RESOURCE_ID
```
The relayer will wait 10 block confirmations before submitting a request which may take a few minutes on the test network. Keep an eye on the target=XXXX output in the chainbridge relayer window. 
The transfer will occur when this reaches the block height of the deposit transaction.
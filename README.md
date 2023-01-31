# JAZ <=> BNB ChainBridge Deploy

## Prerequisites
- Go 1.15+ installation or later
- nodejs 14.17.x
- npm 6.14.x
- Docker
- docker-compose

## ResourceID
```
// utf-8 encoding of "bnb.jaz.raca"
0x00000000000000000000000000000000000000626e622e6a617a2e7261636100
// utf-8 encoding of "bnb.jaz.bnb"
0x0000000000000000000000000000000000000000626e622e6a617a2e626e6200
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
Url:        https://rpc1.jaz.network/
Deployer:   0x91388a75f30065f6F1D679541C6aDc2c3ade08A8
Gas Limit:   8000000
Gas Price:   1000000000
Deploy Cost: 0.005944438

Options
=======
Chain Id:    0
Threshold:   3
Relayers:    0x2bAe5160A67FFE0d2dD9114c521dd51689FDB549,0x994354275A3512fc3C54543E1b400ea9dA1d3A0f,0xdfAE3230656b0AfBBdc5f4F16F49eEF9398fB51f
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
[bridge/register-resource] Registering contract 0x0000000000000000000000000000000000000804 with resource ID 0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00 on handler 0xE75Fb7714B5098E20A2D224693A1c210ad0c1A42
Waiting for tx: 0x8062c60f0989dd6d818e687e48b87d709231f1bb032f1f68364e51e66c108db6...
```

3. Deploy contracts on Destination

The following command deploys the bridge contract, handler and a new ERC20 contract on the destination chain.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 10000000000 deploy \
    --bridge --erc20 --erc20Handler \
    --relayers $DST_ADDR \
    --relayerThreshold 2 \
    --chainId 1
```
output:
```
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed
✓ ERC20 contract deployed

================================================================
Url:        https://restless-serene-meme.bsc-testnet.discover.quiknode.pro/cf291d33c518e9d10239620138cbc3a974712449/
Deployer:   0x5849771139978fe0B3D52303d71D222a347e7CaB
Gas Limit:   8000000
Gas Price:   10000000000
Deploy Cost: 0.08403418

Options
=======
Chain Id:    1
Threshold:   3
Relayers:    0x2bAe5160A67FFE0d2dD9114c521dd51689FDB549,0x994354275A3512fc3C54543E1b400ea9dA1d3A0f,0xdfAE3230656b0AfBBdc5f4F16F49eEF9398fB51f
Bridge Fee:  0
Expiry:      100

Contract Addresses
================================================================
Bridge:             0x3ab80A5896554B08aA75Ee89cff53ae348DF041d
----------------------------------------------------------------
Erc20 Handler:      0x9A2B7aF4a1016378a3A1766B442883EF582cfc6A
----------------------------------------------------------------
Erc721 Handler:     Not Deployed
----------------------------------------------------------------
Generic Handler:    Not Deployed
----------------------------------------------------------------
Erc20:              0xDDdC03B47c198c7b24BFF83F7cA13F14628Ab110
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

Final chainbridge-vars
```
SRC_GATEWAY=https://rpc1.jaz.network/
DST_GATEWAY=https://restless-serene-meme.bsc-testnet.discover.quiknode.pro/cf291d33c518e9d10239620138cbc3a974712449/

SRC_ADDR="0x2bAe5160A67FFE0d2dD9114c521dd51689FDB549","0x994354275A3512fc3C54543E1b400ea9dA1d3A0f","0xdfAE3230656b0AfBBdc5f4F16F49eEF9398fB51f"
SRC_PK="59a6e32ed4240917b1ebe7de6fd5c3b672376badca34828b642837e9395980e1"
DST_ADDR="0x2bAe5160A67FFE0d2dD9114c521dd51689FDB549","0x994354275A3512fc3C54543E1b400ea9dA1d3A0f","0xdfAE3230656b0AfBBdc5f4F16F49eEF9398fB51f"
DST_PK="1d3cb5dada1ea8d4453e9e10749a6a608ee0d89a4ad9f9e0241f40346e0f0957"

SRC_TOKEN="0x0000000000000000000000000000000000000804"
RESOURCE_ID="0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"

SRC_BRIDGE="0x26925046a09d9AEfe6903eae0aD090be06186Bd9"
SRC_HANDLER="0xE75Fb7714B5098E20A2D224693A1c210ad0c1A42"

DST_BRIDGE="0x3ab80A5896554B08aA75Ee89cff53ae348DF041d"
DST_HANDLER="0x9A2B7aF4a1016378a3A1766B442883EF582cfc6A"
DST_TOKEN="0xDDdC03B47c198c7b24BFF83F7cA13F14628Ab110"
```

4. Configure contracts on Destination
The following registers the new ERC20 token as a resource on the bridge similar to the above.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 10000000000 bridge register-resource \
    --bridge $DST_BRIDGE \
    --handler $DST_HANDLER \
    --resourceId $RESOURCE_ID \
    --targetContract $DST_TOKEN
```
The following registers the token as mintable/burnable on the bridge.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 10000000000 bridge set-burn \
    --bridge $DST_BRIDGE \
    --handler $DST_HANDLER \
    --tokenContract $DST_TOKEN
```
The following gives permission for the handler to mint new ERC20 tokens.
```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 10000000000 erc20 add-minter \
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

const Web3 = require('web3')
const HDWalletProvider = require("truffle-hdwallet-provider");

const wfraABI = require('../build/contracts/wfra.json');
const findoraNetwork = "https://dev-evm.dev.findora.org:8545/";
// const findoraNetwork = "http://127.0.0.1:8545/";

// findora deployer
const mnemonic = "weather confirm sphere snack grab vessel void aspect day art jewel bamboo";
const caller = '0x91388a75f30065f6F1D679541C6aDc2c3ade08A8';
const contractAddress = '0x6E381B17fA5748a4263E2C404E98974200728DE2';

async function main() {
    const provider = new HDWalletProvider(mnemonic, findoraNetwork);
    const web3 = new Web3(provider);

    const erc20Instance = new web3.eth.Contract(
        wfraABI.abi,
        contractAddress,
        {gasLimit: "5000000"}
    );

    console.log("query WFRA balance: ", await erc20Instance.methods.balanceOf(caller).call());

    console.log("deposit 1000 FRA result: ", await erc20Instance.methods.deposit().send({
        from: caller,
        value: "1000000000000000000000"
    }));

    console.log("query WFRA balance: ", await erc20Instance.methods.balanceOf(caller).call());

    console.log("withdraw 10 WFRA result: ", await erc20Instance.methods.withdraw("10000000000000000000").send({from: caller}));

    console.log("query WFRA balance: ", await erc20Instance.methods.balanceOf(caller).call());
}

main();

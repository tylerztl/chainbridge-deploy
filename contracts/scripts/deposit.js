const Web3 = require('web3')
const HDWalletProvider = require("truffle-hdwallet-provider");

const wfraABI = require('../build/contracts/wfra.json');
const findoraNetwork = "https://dev-evm.dev.findora.org:8545/";
// const findoraNetwork = "http://127.0.0.1:8545/";

const mnemonic = "citizen hint animal brain label grab hurt prison myth stem load wait";
const caller = '0xA5225cBEE5052100Ec2D2D94aA6d258558073757';
const contractAddress = '0xE98C358718d9D7916371a824C04d5eC5db5aBf6e';

async function main() {
    const provider = new HDWalletProvider(mnemonic, findoraNetwork);
    const web3 = new Web3(provider);

    const erc20Instance = new web3.eth.Contract(
        wfraABI.abi,
        contractAddress,
        {gasLimit: "5000000"}
    );

    console.log("query WFRA balance: ", await erc20Instance.methods.balanceOf(caller).call());

    console.log("deposit 100 FRA result: ", await erc20Instance.methods.deposit().send({
        from: caller,
        value: 100 * 1000000000000000000
    }));

    console.log("query WFRA balance: ", await erc20Instance.methods.balanceOf(caller).call());

    console.log("withdraw 10 WFRA result: ", await erc20Instance.methods.withdraw("10000000000000000000").send({from: caller}));

    console.log("query WFRA balance: ", await erc20Instance.methods.balanceOf(caller).call());
}

main();

const HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonic = "citizen hint animal brain label grab hurt prison myth stem load wait";

module.exports = {
    networks: {
        findora: {
            provider: () => new HDWalletProvider(mnemonic,
                'https://dev-evm.dev.findora.org:8545/'
            ),
            network_id: '523',
            gas: 5000000,
            gasPrice: 100000000000, // 100 gwei
        },
        development: {
            provider: () => new HDWalletProvider(mnemonic,
                'http://127.0.0.1:8545/'
            ),
            network_id: '*',
            gas: 5000000,
            gasPrice: 100000000000, // 100 gwei
        },
    },

    // Configure your compilers
    compilers: {
        solc: {
            version: "^0.4.18",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                evmVersion: "byzantium"
            }
        }
    }
};

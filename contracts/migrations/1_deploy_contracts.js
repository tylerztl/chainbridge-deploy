const WFRA = artifacts.require("WFRA.sol");

module.exports = async (deployer) => {
    await deployer.deploy(WFRA);
};

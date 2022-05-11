
const MarketplaceMigrations = artifacts.require("BookMarketplace");

module.exports = function (deployer) {
  deployer.deploy(MarketplaceMigrations);
};
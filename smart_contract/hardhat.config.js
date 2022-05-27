// https://eth-ropsten.alchemyapi.io/v2/tehFAhiuz6sE1LXv5aeApArXxQNaN4lK

require ("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/tehFAhiuz6sE1LXv5aeApArXxQNaN4lK",

      accounts: ['79d99e77724cdbc0e41c46f5a4e62ece4cd0d97e0b184370fa7dfc347920019e']
    }
  }
}
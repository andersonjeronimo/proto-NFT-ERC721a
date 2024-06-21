import { HardhatUserConfig } from "hardhat/config";
import dotenv from 'dotenv';
import "@nomicfoundation/hardhat-toolbox";
/* import "@nomiclabs/hardhat-verify"; */

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  etherscan: {
    apiKey: {
      snowtrace: "snowtrace", // apiKey is not required, just set a placeholder
    },
    customChains: [
      {
        network: "snowtrace",
        chainId: 43113,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan",
          browserURL: "https://avalanche.testnet.localhost:8080",
          /* browserURL: "https://testnet.snowtrace.io" */
        }
      }
    ]
  },
  networks: {
    avaxtest: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    /* snowtrace: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      accounts: [process.env.PRIVATE_KEY]
    }, */
  },
  sourcify: {
    enabled: false
  }
};

export default config;

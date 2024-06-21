import { ethers } from "hardhat";

async function main() {
    const ProtoNFT = await ethers.getContractFactory("ProtoNFT");
    const contract = await ProtoNFT.deploy();

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log(`Contract deployed at ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

/**
 * Deploy address @ Avax testet (21/06/2024)
 * 0x6694C29581fb542724F9fA7766b112070ec02A95
 */
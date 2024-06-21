import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ProtoNFTModule = buildModule("ProtoNFTModule", (m) => {
    const protoNft = m.contract("ProtoNFT");
    return { protoNft };
});

export default ProtoNFTModule;
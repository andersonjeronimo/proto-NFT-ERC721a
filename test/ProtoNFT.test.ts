import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProtoNFT", function () {
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, otherAccount2] = await ethers.getSigners();
    const ProtoNFT = await ethers.getContractFactory("ProtoNFT");
    const contract = await ProtoNFT.deploy();
    return { contract, owner, otherAccount, otherAccount2 };
  }

  it("Should has name", async function () {
    const { contract } = await loadFixture(deployFixture);
    expect(await contract.name()).to.equal("ProtoNFT");
  });

  it("Should has symbol", async function () {
    const { contract } = await loadFixture(deployFixture);
    expect(await contract.symbol()).to.equal("PNFT");
  });

  it("Should mint", async function () {
    const { contract, owner } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const balance = await contract.balanceOf(owner.address);
    const tokenId = 0;
    const ownerOf = await contract.ownerOf(tokenId);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(1, "Can't mint");
    expect(ownerOf).to.equal(owner.address, "Can't mint");
    expect(totalSupply).to.equal(1, "Can't mint");
  });

  it("Should burn", async function () {
    const { contract, owner } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    await contract.burn(tokenId);

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(0, "Can't burn");
    expect(totalSupply).to.equal(0, "Can't burn");
  });

  it("Should burn (approved)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    await contract.approve(otherAccount.address, tokenId);
    const approved = await contract.getApproved(tokenId);

    const instance = contract.connect(otherAccount);
    await instance.burn(tokenId);

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(0, "Can't approve burn");
    expect(totalSupply).to.equal(0, "Can't approve burn");
    expect(approved).to.equal(otherAccount.address);
  });

  it("Should burn (approved for all)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    await contract.setApprovalForAll(otherAccount.address, true);
    const approvedForAll = await contract.isApprovedForAll(owner.address, otherAccount.address);

    const instance = contract.connect(otherAccount);
    await instance.burn(tokenId);

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(0, "Can't approve burn for all");
    expect(totalSupply).to.equal(0, "Can't approve burn for all");
    expect(approvedForAll).to.equal(true, "Can't approve burn for all");
  });

  it("Should NOT burn (not exists)", async function () {
    const { contract } = await loadFixture(deployFixture);
    await expect(contract.burn(1)).to.be.revertedWithCustomError(contract, "OwnerQueryForNonexistentToken");
  });

  it("Should NOT burn (permission)", async function () {
    const { contract, otherAccount } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    //await contract.approve(otherAccount.address, tokenId);
    const instance = contract.connect(otherAccount);
    await expect(instance.burn(tokenId)).to.be.revertedWithCustomError(contract, "TransferCallerNotOwnerNorApproved");
  });

  it("Should has URI metadata", async function () {
    const { contract } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    expect(await contract.tokenURI(tokenId)).to.equal("https://www.protonft.com/0.json", "Can't get URI metadata");
  });

  it("Should NOT has URI metadata (token not exists)", async function () {
    const { contract } = await loadFixture(deployFixture);
    await expect(contract.tokenURI(1)).to.be.revertedWithCustomError(contract, "URIQueryForNonexistentToken");
  });

  it("Should transfer", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    await contract.transferFrom(owner.address, otherAccount.address, tokenId);

    const balanceFrom = await contract.balanceOf(owner.address);
    const balanceTo = await contract.balanceOf(otherAccount.address);

    const ownerOf = await contract.ownerOf(tokenId);

    expect(balanceFrom).to.equal(0, "Can't transfer");
    expect(balanceTo).to.equal(1, "Can't transfer");
    expect(ownerOf).to.equal(otherAccount.address);
  });

  it("Should emit transfer", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    await expect(contract.transferFrom(owner.address, otherAccount.address, tokenId))
      .to.emit(contract, "Transfer")
      .withArgs(owner.address, otherAccount.address, tokenId);
  });

  it("Should transfer (approved))", async function () {
    const { contract, owner, otherAccount, otherAccount2 } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    await contract.approve(otherAccount.address, tokenId);
    const approved = await contract.getApproved(tokenId);//otherAccount.addess

    const instance = contract.connect(otherAccount);
    await instance.transferFrom(owner, otherAccount2, tokenId);

    const balanceFrom = await contract.balanceOf(owner.address);//0

    const balanceTo = await contract.balanceOf(otherAccount2.address);//1

    const ownerOf = await contract.ownerOf(tokenId);//otherAccount2.addess    

    expect(balanceFrom).to.equal(0);
    expect(balanceTo).to.equal(1);
    expect(ownerOf).to.equal(otherAccount2.address);
    expect(approved).to.equal(otherAccount.address);
  });

  it("Should emit approval", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    await expect(contract.approve(otherAccount.address, tokenId))
      .to.emit(contract, "Approval")
      .withArgs(owner.address, otherAccount.address, tokenId);
  });

  it("Should clear approvals)", async function () {
    const { contract, owner, otherAccount, otherAccount2 } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    await contract.approve(otherAccount.address, tokenId);

    const instance = contract.connect(otherAccount);
    await instance.transferFrom(owner, otherAccount2, tokenId);

    const approved = await contract.getApproved(tokenId);

    expect(approved).to.equal(ethers.ZeroAddress);
  });

  it("Should NOT transfer (token not exists)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);
    //await contract.mint();
    const tokenId = 1;
    await expect(contract.transferFrom(owner.address, otherAccount.address, tokenId))
      .to.be.revertedWithCustomError(contract, "OwnerQueryForNonexistentToken");
  });

  it("Should supports interface", async function () {
    const { contract } = await loadFixture(deployFixture);
    expect(await contract.supportsInterface("0x80ac58cd")).to.equal(true, "Can't support ERC721 interface");
  });

  it.only("Should withdraw", async function () {
    const { contract, owner } = await loadFixture(deployFixture);
    await contract.mint(1, { value: ethers.parseEther("0.01") });
    await contract.withdraw();
    //const balance = await contract.balanceOf(owner.address);
    //const ownerBalance = await ethers.provider.getBalance(owner.address);
    const contractBalance = await ethers.provider.getBalance(contract.getAddress());    

    //expect(ownerBalance).to.equal(ethers.parseEther("0.01"), "Can't withdraw");
    expect(contractBalance).to.equal(0, "Can't withdraw");
  });

});

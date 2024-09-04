const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  let buyer, seller;
  let realEstate, escrow;

  beforeEach(async () => {
    // setup accounts
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    // deploy real estate
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    await realEstate.deployed();
    console.log(realEstate.address);

    // mint
    let transaction = await realEstate
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodywmPekYgbnXGo4DFubJiLc2EB/1.json"
      );
    await transaction.wait();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      realEstate.address,
      seller.address,
      inspector.address,
      lender.address
    );
  });

  describe("Deployment", async () => {

    it("Returns NFT address", async () => {
      const result = await escrow.nftAddress();
      expect(result).to.be.equal(realEstate.address);
    });

    it("Returns seller", async () => {
      const result = await escrow.seller();
      expect(result).to.be.equal(seller.address);
    });

    it("Returns inspector", async () => {
        const result = await escrow.inspector();
        expect(result).to.be.equal(inspector.address)
    });

    it("Returns render", async () => {
        const result = await escrow.lender();
        expect(result).to.be.equal(lender.address)
    });
  });

});

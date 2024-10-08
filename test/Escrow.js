const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  let buyer, seller, inspector, lender;
  let realEstate, escrow;

  beforeEach(async () => {
    // Setup accounts
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    // Deploy RealEstate contract
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    await realEstate.deployed();

    // Mint NFT
    let transaction = await realEstate
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodywmPekYgbnXGo4DFubJiLc2EB/1.json"
      );
    await transaction.wait();

    // Deploy Escrow contract
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      realEstate.address,     // NFT contract address
      seller.address,         // Seller address
      inspector.address,      // Inspector address
      lender.address          // Lender address
    );
    await escrow.deployed();

    // Approve property
    transaction = await realEstate.connect(seller).approve(escrow.address, 1);
    await transaction.wait();

    // List property
    transaction = await escrow.connect(seller).list(
      1,                   // NFT ID
      tokens(10),          // Purchase price (e.g., 10 ETH)
      tokens(5),           // Escrow amount (e.g., 5 ETH)
      buyer.address        // Buyer's address
    );
    await transaction.wait();
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
      expect(result).to.be.equal(inspector.address);
    });

    it("Returns lender", async () => {
      const result = await escrow.lender();
      expect(result).to.be.equal(lender.address);
    });
  });

  describe("Listing", () => {
    it("Updates as listed", async () => {
      const result = await escrow.isListed(1);
      expect(result).to.be.equal(true);
    });

    it("Updates ownership", async () => {
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
    });

    it("Returns buyer", async () => {
      const result = await escrow.buyer(1);
      expect(result).to.be.equal(buyer.address);
    });

    it("Returns purchase price", async () => {
      const result = await escrow.purchasePrice(1);
      expect(result).to.be.equal(tokens(10));
    });

    it("Returns escrow amount", async () => {
      const result = await escrow.escrowAmount(1);
      expect(result).to.be.equal(tokens(5));
    });
  });

  describe('Deposits', () => {
    it('Updates contract balance', async() => {
      const transaction = await escrow.connect(buyer).depositEarnest(1, {value: tokens(5)})
      await transaction.wait();
      const result = await escrow.getBalance();
      expect(result).to.be.equal(tokens(5));
    })
  })

  describe('Inspection', () => {
    it('Updates inspection status', async() => {
      const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
      await transaction.wait()
      const result = await escrow.inspectionPassed(1);
      expect(result).to.be.equal(true)
    })
  })

  describe('Approval', () => {
    it('Updates approval status', async() => {
      let transaction = await escrow.connect(buyer).approveSale(1);
      await transaction.wait()

      transaction = await escrow
    })
  })
});
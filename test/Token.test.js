const Web3 = require('web3');
const { BN, constants, balance, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

const Token =  artifacts.require('../contracts/Token.sol');

function getEncodedCall(instance, method, params = []) {
  const contract = new web3.eth.Contract(instance.abi)
  return contract.methods[method](...params).encodeABI()
}

contract('Token', function (accounts) {
    let token;
    let addrZero = constants.ZERO_ADDRESS;
    let owner = accounts[0];
    let owner2 = accounts[1];
    let owner3 = accounts[2];
    let user1 = accounts[3];
    let user2 = accounts[4];

    describe("Ownable", function () {
    
        it("Should deployed contract successfully with rates 1 Wei = 2 Token", async function () {
            token = await Token.new(owner2, owner3, 2, { from: owner});
            const rates = await token.tokenRates();
            assert.equal(rates, 2);
        });

        it("Should contract owner, owner2, owner3 is accounts[0], accounts[1], accounts[2]", async function () {
            const contractOwner = await token.owner();
            const contractOwner2 = await token.owner2();
            const contractOwner3 = await token.owner3();
            assert.equal(contractOwner, owner);
            assert.equal(contractOwner2, owner2);
            assert.equal(contractOwner3, owner3);
        });

        it("Should contract owner, owner2, owner3 is accounts[0], accounts[1], accounts[2]", async function () {
            const contractOwner = await token.owner();
            const contractOwner2 = await token.owner2();
            const contractOwner3 = await token.owner3();
            assert.equal(contractOwner, owner);
            assert.equal(contractOwner2, owner2);
            assert.equal(contractOwner3, owner3);
        });

        it("Should balanceOf owner, owner2, owner3 equal to 1000000", async function () {
            const contractOwnerBal = await token.balanceOf(owner);
            const contractOwner2Bal = await token.balanceOf(owner2);
            const contractOwner3Bal = await token.balanceOf(owner3);
            assert.equal(contractOwnerBal, 1000000);
            assert.equal(contractOwner2Bal, 1000000);
            assert.equal(contractOwner3Bal, 1000000);
        });

        it("Should fail cause only contractOwner(owner, owner2, owner3) can set rates", async function () {
            await expectRevert.unspecified(
                token.setRates(3, {
                    from: accounts[4]
                }),'Only-owner-can-set-rates'
            );
        });

        it("Should setRates from 2 to 3 successfully", async function () {
            await token.setRates(3, {
                from: owner
            })
            const newRates = await token.tokenRates();
            assert.equal(newRates, 3);
        });
    })  

    describe("Mint token via paid ETH", function () {
        it("Should transfer 1 ETH and get 3000000000000000000 Token", async function () {
            await token.payTokenViaETH({
                value: web3.utils.toWei('1', "ether"),
                gas: 4000000,
                from: user1
            });
            const user1Bal = await token.balanceOf(user1);
            assert.equal(user1Bal, web3.utils.toWei('3', "ether"));
        });

        it("Should transfer 3 ETH to receiver() function", async function () {
            const contractOwnerEthBalBefore = await web3.eth.getBalance(owner);
            const contractOwner2EthBalBefore = await web3.eth.getBalance(owner2);
            const contractOwner3EthBalBefore = await web3.eth.getBalance(owner3);
            await web3.eth.sendTransaction({
                value: web3.utils.toWei('3', "ether"),
                gas: 4000000,
                from: user2,
                to: token.address
            })
            const contractOwnerEthBalAfter = await web3.eth.getBalance(owner);
            const contractOwner2EthBalAfter = await web3.eth.getBalance(owner2);
            const contractOwner3EthBalAfter = await web3.eth.getBalance(owner3);
            assert.equal(parseInt(contractOwnerEthBalAfter), parseInt(contractOwnerEthBalBefore)+ web3.utils.toWei('3', "ether")/3);
            assert.equal(parseInt(contractOwner2EthBalAfter), parseInt(contractOwner2EthBalBefore)+ web3.utils.toWei('3', "ether")/3);
            assert.equal(parseInt(contractOwner3EthBalAfter), parseInt(contractOwner3EthBalBefore)+ web3.utils.toWei('3', "ether")/3);
        });

        it("Should fail if transfer ETH to receiver() with data for attack", async function () {
           await expectRevert.unspecified(
            web3.eth.sendTransaction({
                value: web3.utils.toWei('3', "ether"),
                gas: 4000000,
                from: user2,
                to: token.address,
                data: '0x23231123'
            })
           );
        });
    });
});
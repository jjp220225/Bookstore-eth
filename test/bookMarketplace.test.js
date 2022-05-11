// Mocha - testing framework
// Chai - assertion JS library

const BookMarketplace = artifacts.require('BookMarketplace')
const { catchRevert } = require('../utils/exceptions')

const getGas = async (result) => {
  const tx = await web3.eth.getTransaction(result.tx)
  const gasUsed = web3.utils.toBN(result.receipt.gasUsed)
  const gasPrice = web3.utils.toBN(tx.gasPrice)
  const gas = gasUsed.mul(gasPrice)

  return gas
}

contract('BookMarketplace', (accounts) => {
  const bookId = '0x00000000000000000000000000003130'
  const proof =
    '0x0000000000000000000000000000313000000000000000000000000000003130'

  const bookId2 = '0x00000000000000000000000000002130'
  const proof2 =
    '0x0000000000000000000000000000213000000000000000000000000000002130'
  const value = '900000000'

  let _contract = null
  let contractOwner = null
  let buyer = null
  let bookHash = null

  before(async () => {
    _contract = await BookMarketplace.deployed()
    contractOwner = accounts[0]
    buyer = accounts[1]
  })

  describe('Purchase the new book', () => {
    before(async () => {
      await _contract.purchaseBook(bookId, proof, {
        from: buyer,
        value,
      })
    })

    it('should not allow the repurchase of an already owned book', async () => {
      await catchRevert(
        _contract.purchaseBook(bookId, proof, {
          from: buyer,
          value,
        }),
      )
    })

    it('can get index of purchased book hash ', async () => {
      const index = 0
      bookHash = await _contract.getBookHashAtIndex(index)

      const expectedHash = web3.utils.soliditySha3(
        { type: 'bytes16', value: bookId },
        { type: 'address', value: buyer },
      )

      assert.equal(
        bookHash,
        expectedHash,
        'book Hash is not matching expected hash created with keccak256',
      )
    })

    it('Should match purchase data of book', async () => {
      const expectedIndex = 0
      const expectedState = 0

      const book = await _contract.getBookByHash(bookHash)

      assert.equal(book.id, expectedIndex, 'book index expected 0')
      assert.equal(book.price, value, `book price expected ${value}`)
      assert.equal(book.proof, proof, `book proof expected ${proof}`)
      assert.equal(book.owner, buyer, `book buyer expected to be ${buyer}`)
      assert.equal(
        book.state,
        expectedState,
        `book state expected to be ${expectedState}`,
      )
    })
  })

  describe('Activate the purchased book', () => {
    it('book should NOT be able to activate by NOT contract owner', async () => {
      await catchRevert(_contract.activateOrder(bookHash, { from: buyer }))
    })

    it("state should be 'activated'", async () => {
      await _contract.activateOrder(bookHash, { from: contractOwner })
      const book = await _contract.getBookByHash(bookHash)
      const exptectedState = 1

      assert.equal(
        book.state,
        exptectedState,
        "books state should be 'activated'",
      )
    })
  })

  describe('Transfer ownership', () => {
    let currentOwner = null

    before(async () => {
      currentOwner = await _contract.getContractOwner()
    })

    it('getContractOwner should return deployer address', async () => {
      assert.equal(
        contractOwner,
        currentOwner,
        'Contract owner is not matching the one from getContractOwner function',
      )
    })

    it('should NOT transfer ownership when contract owner is not sending TX', async () => {
      await catchRevert(
        _contract.transferOwnership(accounts[3], { from: accounts[4] }),
      )
    })

    it("should transfer owership to 3rd address from 'accounts'", async () => {
      await _contract.transferOwnership(accounts[2], { from: currentOwner })
      const owner = await _contract.getContractOwner()
      assert.equal(
        owner,
        accounts[2],
        'Contract owner is not the second account',
      )
    })

    it("should transfer owership back to initial contract owner'", async () => {
      await _contract.transferOwnership(contractOwner, { from: accounts[2] })
      const owner = await _contract.getContractOwner()
      assert.equal(owner, contractOwner, 'Contract owner is not set!')
    })
  })

  describe('book deactivation', () => {
    let bookHash2 = null
    let currentOwner = null

    before(async () => {
      await _contract.purchaseBook(bookId2, proof2, { from: buyer, value })
      bookHash2 = await _contract.getBookHashAtIndex(1)
      currentOwner = await _contract.getContractOwner()
    })

    it('Should not be able to deactivate a book if not a contract owner', async () => {
      await catchRevert(
        _contract.deactivateOrder(bookHash2, { from: buyer }),
      )
    })

    it('should have state of deactivated and price 0', async () => {
      const beforeTxBuyerBalance = await web3.eth.getBalance(buyer)
      const beforeTxContractBalance = await web3.eth.getBalance(
        _contract.address,
      )
      const beforeTxOwnerBalance = await web3.eth.getBalance(currentOwner)

      const result = await _contract.deactivateOrder(bookHash2, {
        from: contractOwner,
      })

      const afterTxBuyerBalance = await web3.eth.getBalance(buyer)
      const afterTxContractBalance = await web3.eth.getBalance(
        _contract.address,
      )
      const afterTxOwnerBalance = await web3.eth.getBalance(currentOwner)

      const book = await _contract.getBookByHash(bookHash2)
      const exptectedState = 2
      const exptectedPrice = 0
      const gas = await getGas(result)

      assert.equal(book.state, exptectedState, 'book is NOT deactivated!')
      assert.equal(book.price, exptectedPrice, 'book price is not 0!')

      assert.equal(
        web3.utils.toBN(beforeTxOwnerBalance).sub(gas).toString(),
        afterTxOwnerBalance,
        'Contract owner ballance is not correct',
      )

      assert.equal(
        web3.utils
          .toBN(beforeTxBuyerBalance)
          .add(web3.utils.toBN(value))
          .toString(),
        afterTxBuyerBalance,
        'Buyer ballance is not correct',
      )

      assert.equal(
        web3.utils
          .toBN(beforeTxContractBalance)
          .sub(web3.utils.toBN(value))
          .toString(),
        afterTxContractBalance,
        'Contract ballance is not correct',
      )
    })

    it('should NOT be able to activate a deactivated book', async () => {
      await catchRevert(
        _contract.activateOrder(bookHash2, { from: contractOwner }),
      )
    })
  })

  describe('Repurchase book', () => {
    let bookHash2 = null

    before(async () => {
      bookHash2 = await _contract.getBookHashAtIndex(1)
    })

    it("should NOT repurchase when the book doesn't exist", async () => {
      const notExistingHash =
        '0x5ceb3f8075c3dbb5d490c8d1e6c950302ed065e1a9031750ad2c6513069e3fc3'
      await catchRevert(
        _contract.repurchaseBook(notExistingHash, { from: buyer }),
      )
    })

    it('should NOT repurchase with NOT book owner', async () => {
      const notOwnerAddress = accounts[2]
      await catchRevert(
        _contract.repurchaseBook(bookHash2, { from: notOwnerAddress }),
      )
    })

    it('should be able repurchase with the original buyer', async () => {
      const beforeTxBuyerBalance = await web3.eth.getBalance(buyer)
      const beforeTxContractBalance = await web3.eth.getBalance(
        _contract.address,
      )

      const result = await _contract.repurchaseBook(bookHash2, {
        from: buyer,
        value,
      })

      const afterTxBuyerBalance = await web3.eth.getBalance(buyer)
      const afterTxContractBalance = await web3.eth.getBalance(
        _contract.address,
      )

      const book = await _contract.getBookByHash(bookHash2)
      const exptectedState = 0
      const gas = await getGas(result)

      assert.equal(
        book.state,
        exptectedState,
        'The book is not in purchased state',
      )
      assert.equal(
        book.price,
        value,
        `The book price is not equal to ${value}`,
      )

      assert.equal(
        web3.utils
          .toBN(beforeTxBuyerBalance)
          .sub(web3.utils.toBN(value))
          .sub(gas)
          .toString(),
        afterTxBuyerBalance,
        'Client balance is not correct!',
      )
      assert.equal(
        web3.utils
          .toBN(beforeTxContractBalance)
          .add(web3.utils.toBN(value))
          .toString(),
        afterTxContractBalance,
        'Contract balance is not correct!',
      )
    })

    it('should NOT be able to repurchase purchased book', async () => {
      await catchRevert(
        _contract.repurchaseBook(bookHash2, { from: buyer }),
      )
    })
  })

  describe('Receive funds', () => {
    it('Should be able to transact funds to smart contract', async () => {
      const value = '100000000000000000'
      const beforeTx = await web3.eth.getBalance(_contract.address)

      await web3.eth.sendTransaction({
        from: buyer,
        to: _contract.address,
        value,
      })

      const afterTx = await web3.eth.getBalance(_contract.address)

      assert.equal(
        web3.utils.toBN(beforeTx).add(web3.utils.toBN(value)).toString(),
        afterTx,
        'Value after transaction does not match',
      )
    })
  })

  describe('Withdraw some funds', () => {
    const depositFund = '100000000000000000'
    const excessiveFund = '9999999900000000000000000'
    let currOwner = null
    before(async () => {
      currOwner = await _contract.getContractOwner()
      await web3.eth.sendTransaction({
        from: buyer,
        to: _contract.address,
        value: depositFund,
      })
    })

    it('should not be able to withdraw without owners address', async () => {
      const value = '100000000000000000' //0.1 Eth
      await catchRevert(_contract.withdraw(value, { from: buyer }))
    })

    it('should fail when attempting to withdraw more than balance', async () => {
      await catchRevert(_contract.withdraw(excessiveFund, { from: currOwner }))
    })

    it('should have an extra +0.1ETH after withdrawal', async () => {
      const balance = await web3.eth.getBalance(currOwner)
      const result = await _contract.withdraw(depositFund, { from: currOwner })
      const newBalance = await web3.eth.getBalance(currOwner)

      const gas = await getGas(result)

      //take off the gas fees
      assert.equal(
        web3.utils
          .toBN(balance)
          .add(web3.utils.toBN(depositFund))
          .sub(web3.utils.toBN(gas))
          .toString(),
        newBalance,
        'The new owner balance is not correct',
      )
    })
  })

  describe('Withdraw All', () => {
    let currOwner

    before(async () => {
      currOwner = await _contract.getContractOwner()
    })

    after(async () => {
      await _contract.restartContract({from: currOwner})
    })

    it("should fail when the contract isn't stopped", async () => {
      await catchRevert(_contract.withdrawAll({ from: currOwner }))
    })

    it('should send all contract funds to contract owner', async () => {
      await _contract.stopContract({ from: currOwner })

      const contractBalance = await web3.eth.getBalance(_contract.address)
      const ownerBalance = await web3.eth.getBalance(currOwner)

      const result = await _contract.withdrawAll({ from: currOwner })
      const gas = await getGas(result)

      const newOwnerBal = await web3.eth.getBalance(currOwner)

      assert.equal(
        web3.utils
          .toBN(ownerBalance)
          .add(web3.utils.toBN(contractBalance))
          .sub(web3.utils.toBN(gas))
          .toString(),
        newOwnerBal,
        'Owner does not have contract balance',
      )
    })

    it('Should have no funds in the contract left after withdrawAll', async () => {
      const contractBal = await web3.eth.getBalance(_contract.address)
      assert.equal(
        contractBal,
        0,
        'Contracts balance is more than 0, funds remain!',
      )
    })
  })

  describe('Self Destruct Contract', () => {
    let currOwner

    before(async () => {
      currOwner = await _contract.getContractOwner()
    })

    it("should fail when the contract isn't stopped", async () => {
      await catchRevert(_contract.selfDestruct({ from: currOwner }))
    })

    it('should send all contract funds to contract owner', async () => {
      await _contract.stopContract({ from: currOwner })

      const contractBalance = await web3.eth.getBalance(_contract.address)
      const ownerBalance = await web3.eth.getBalance(currOwner)

      const result = await _contract.selfDestruct({ from: currOwner })
      const gas = await getGas(result)

      const newOwnerBal = await web3.eth.getBalance(currOwner)

      assert.equal(
        web3.utils
          .toBN(ownerBalance)
          .add(web3.utils.toBN(contractBalance))
          .sub(web3.utils.toBN(gas))
          .toString(),
        newOwnerBal,
        'Owner does not have contract balance',
      )
    })

    it('Should have no funds in the contract left after Self Destruct', async () => {
      const contractBal = await web3.eth.getBalance(_contract.address)
      assert.equal(
        contractBal,
        0,
        'Contracts balance is more than 0, funds remain!',
      )
    })

    it('Should have byte code of 0x after Self Destruct', async () => {
      const byteCode = await web3.eth.getCode(_contract.address)
      assert.equal(
        byteCode,
        "0x",
        'Contract has not been destroyed!',
      )
    })
  })

})

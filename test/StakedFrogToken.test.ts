import {waffle} from 'hardhat'
import {expect} from 'chai'
import {setup} from '@/utils/fixture'
import {ADDRESS_ZERO, parseCoin, setNextBlockTimestamp} from '@/utils/helpers'

describe('StakedFrogsToken', function () {

  describe('constructor', function () {
    it('Should initialize', async function () {
      // given
      const {frogToken, stakedFrogToken, owner} = await waffle.loadFixture(setup)
      // when
      const name = await stakedFrogToken.name()
      const symbol = await stakedFrogToken.symbol()
      const decimals = await stakedFrogToken.decimals()
      const totalSupply = await stakedFrogToken.totalSupply()
      const lockPeriod = await stakedFrogToken.lockPeriod()
      const token = await stakedFrogToken.token()
      // then
      expect(name).to.be.equal('Staked Frog Nation DAO')
      expect(symbol).to.be.equal('sFRG')
      expect(decimals).to.be.equal(18)
      expect(totalSupply).to.be.equal(0)
      expect(lockPeriod).to.be.equal(86400)
      expect(token).to.be.equal(frogToken.address)
    })
  })

  describe('approve', function () {
    it('Should approve a spender', async function () {
      // given
      const {stakedFrogToken, alice, bob} = await waffle.loadFixture(setup)
      const shares = parseCoin('1.23')
      // when
      const tx = await alice.stakedFrogToken.approve(bob.address, shares)
      // then
      await expect(tx).to.emit(stakedFrogToken, 'Approval').withArgs(alice.address, bob.address, shares)
      expect(await stakedFrogToken.allowance(alice.address, bob.address)).to.be.equal(shares)
    })
  })

  describe('mint', function () {
    it('Should mint same amount when it is zero supply', async function () {
      // given
      const {frogToken, stakedFrogToken, alice, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('1.23')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      // when
      const tx = await alice.stakedFrogToken.mint(amount)
      // then
      await expect(tx).to.emit(frogToken, 'Transfer').withArgs(alice.address, stakedFrogToken.address, amount)
      await expect(tx).to.emit(stakedFrogToken, 'Transfer').withArgs(ADDRESS_ZERO, alice.address, amount)
      expect(await frogToken.balanceOf(alice.address)).to.be.equal(0)
      expect(await stakedFrogToken.balanceOf(alice.address)).to.be.equal(amount)
      expect(await stakedFrogToken.totalSupply()).to.be.equal(amount)
    })
    it('Should mint a parcial shares', async function () {
      // given
      const {frogToken, stakedFrogToken, alice, treasure} = await waffle.loadFixture(setup)
      await treasure.frogToken.transfer(stakedFrogToken.address, parseCoin('5'))
      await treasure.frogToken.transfer(alice.address, parseCoin('8'))
      await alice.frogToken.approve(stakedFrogToken.address, parseCoin('8'))
      await alice.stakedFrogToken.mint(parseCoin('5'))
      // when
      const tx = await alice.stakedFrogToken.mint(parseCoin('3'))
      // then
      await expect(tx).to.emit(frogToken, 'Transfer').withArgs(alice.address, stakedFrogToken.address, parseCoin('3'))
      await expect(tx).to.emit(stakedFrogToken, 'Transfer').withArgs(ADDRESS_ZERO, alice.address, parseCoin('1.5'))
      expect(await frogToken.balanceOf(alice.address)).to.be.equal(0)
      expect(await stakedFrogToken.balanceOf(alice.address)).to.be.equal(parseCoin('6.5'))
      expect(await stakedFrogToken.totalSupply()).to.be.equal(parseCoin('6.5'))
    })
    it('Should update locked period', async function () {
      // given
      const {stakedFrogToken, alice, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('1.23')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      const oldLocked = await stakedFrogToken.lockedUntil(alice.address)
      // when
      const tx = await alice.stakedFrogToken.mint(amount)
      // then
      expect(await stakedFrogToken.lockedUntil(alice.address)).to.be.gt(oldLocked)
    })
    it('Should revert with "ERC20: transfer amount exceeds balance"', async function () {
      // given
      const {stakedFrogToken, alice} = await waffle.loadFixture(setup)
      const amount = parseCoin('1.23')
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      // when
      const tx = alice.stakedFrogToken.mint(amount)
      // then
      await expect(tx).to.be.revertedWith('ERC20: transfer amount exceeds balance')
    })
  })

  describe('burn', function () {
    it('Should burn same amount when it is zero supply', async function () {
      // given
      const {frogToken, stakedFrogToken, alice, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('1.23')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      const lockedUntil = await stakedFrogToken.lockedUntil(alice.address)
      await setNextBlockTimestamp(lockedUntil)
      // when
      const tx = await alice.stakedFrogToken.burn(amount)
      // then
      await expect(tx).to.emit(frogToken, 'Transfer').withArgs(stakedFrogToken.address, alice.address, amount)
      await expect(tx).to.emit(stakedFrogToken, 'Transfer').withArgs(alice.address, ADDRESS_ZERO, amount)
      expect(await stakedFrogToken.balanceOf(alice.address)).to.be.equal(0)
      expect(await frogToken.balanceOf(alice.address)).to.be.equal(amount)
      expect(await stakedFrogToken.totalSupply()).to.be.equal(0)
    })
    it('Should burn a parcial shares', async function () {
      // given
      const {frogToken, stakedFrogToken, alice, treasure} = await waffle.loadFixture(setup)
      await treasure.frogToken.transfer(stakedFrogToken.address, parseCoin('5'))
      await treasure.frogToken.transfer(alice.address, parseCoin('8'))
      await alice.frogToken.approve(stakedFrogToken.address, parseCoin('8'))
      await alice.stakedFrogToken.mint(parseCoin('5'))
      await alice.stakedFrogToken.mint(parseCoin('3'))
      const lockedUntil = await stakedFrogToken.lockedUntil(alice.address)
      await setNextBlockTimestamp(lockedUntil)
      // when
      const tx = await alice.stakedFrogToken.burn(parseCoin('3'))
      // then
      await expect(tx).to.emit(frogToken, 'Transfer').withArgs(stakedFrogToken.address, alice.address, parseCoin('6'))
      await expect(tx).to.emit(stakedFrogToken, 'Transfer').withArgs(alice.address, ADDRESS_ZERO, parseCoin('3'))
      expect(await stakedFrogToken.balanceOf(alice.address)).to.be.equal(parseCoin('3.5'))
      expect(await frogToken.balanceOf(alice.address)).to.be.equal(parseCoin('6'))
    })
    it('Should revert with "locked"', async function () {
      // given
      const {stakedFrogToken, alice, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      // when
      const tx = alice.stakedFrogToken.burn(amount)
      // then
      await expect(tx).to.be.revertedWith('locked')
    })
    it('Should revert with "burn amount exceeds balance"', async function () {
      // given
      const {stakedFrogToken, alice, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      const lockedUntil = await stakedFrogToken.lockedUntil(alice.address)
      await setNextBlockTimestamp(lockedUntil)
      // when
      const tx = alice.stakedFrogToken.burn(amount.add(1))
      // then
      await expect(tx).to.be.revertedWith('burn amount exceeds balance')
    })
  })

  describe('burnFrom', function () {
    it('Should burnFrom same amount when it is zero supply', async function () {
      // given
      const {frogToken, stakedFrogToken, alice, carol, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      await alice.stakedFrogToken.approve(carol.address, amount)
      const lockedUntil = await stakedFrogToken.lockedUntil(alice.address)
      await setNextBlockTimestamp(lockedUntil)
      // when
      const tx = carol.stakedFrogToken.burnFrom(alice.address, amount)
      // then
      await expect(tx).to.emit(frogToken, 'Transfer').withArgs(stakedFrogToken.address, alice.address, amount)
      await expect(tx).to.emit(stakedFrogToken, 'Transfer').withArgs(alice.address, ADDRESS_ZERO, amount)
      expect(await stakedFrogToken.balanceOf(alice.address)).to.be.equal(0)
      expect(await frogToken.balanceOf(alice.address)).to.be.equal(amount)
      expect(await stakedFrogToken.totalSupply()).to.be.equal(0)
    })
    it('Should burnFrom a parcial shares', async function () {
      // given
      const {frogToken, stakedFrogToken, alice,carol, treasure} = await waffle.loadFixture(setup)
      await treasure.frogToken.transfer(stakedFrogToken.address, parseCoin('5'))
      await treasure.frogToken.transfer(alice.address, parseCoin('8'))
      await alice.frogToken.approve(stakedFrogToken.address, parseCoin('8'))
      await alice.stakedFrogToken.mint(parseCoin('5'))
      await alice.stakedFrogToken.mint(parseCoin('3'))
      await alice.stakedFrogToken.approve(carol.address, parseCoin('3'))
      const lockedUntil = await stakedFrogToken.lockedUntil(alice.address)
      await setNextBlockTimestamp(lockedUntil)
      // when
      const tx = await carol.stakedFrogToken.burnFrom(alice.address, parseCoin('3'))
      // then
      await expect(tx).to.emit(frogToken, 'Transfer').withArgs(stakedFrogToken.address, alice.address, parseCoin('6'))
      await expect(tx).to.emit(stakedFrogToken, 'Transfer').withArgs(alice.address, ADDRESS_ZERO, parseCoin('3'))
      expect(await stakedFrogToken.balanceOf(alice.address)).to.be.equal(parseCoin('3.5'))
      expect(await frogToken.balanceOf(alice.address)).to.be.equal(parseCoin('6'))
    })
    it('Should revert with "locked"', async function () {
      // given
      const {stakedFrogToken, alice, carol, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      await alice.stakedFrogToken.approve(carol.address, amount.add(1))
      // when
      const tx = carol.stakedFrogToken.burnFrom(alice.address, amount.add(1))
      // then
      await expect(tx).to.be.revertedWith('locked')
    })
    it('Should revert with "burn amount exceeds balance"', async function () {
      // given
      const {stakedFrogToken, alice, carol, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      await alice.stakedFrogToken.approve(carol.address, amount.add(1))
      const lockedUntil = await stakedFrogToken.lockedUntil(alice.address)
      await setNextBlockTimestamp(lockedUntil)
      // when
      const tx = carol.stakedFrogToken.burnFrom(alice.address, amount.add(1))
      // then
      await expect(tx).to.be.revertedWith('burn amount exceeds balance')
    })
  })

  describe('transfer', function () {
    it('Should transfer shares', async function () {
      // given
      const {stakedFrogToken, alice, bob, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      const lockedUntil = await stakedFrogToken.lockedUntil(alice.address)
      await setNextBlockTimestamp(lockedUntil)
      // when
      const tx = await alice.stakedFrogToken.transfer(bob.address, amount)
      // then
      await expect(tx).to.emit(stakedFrogToken, 'Transfer').withArgs(alice.address, bob.address, amount)
      expect(await stakedFrogToken.balanceOf(alice.address)).to.be.equal(0)
      expect(await stakedFrogToken.balanceOf(bob.address)).to.be.equal(amount)
    })
    it('Should revert with "locked"', async function () {
      // given
      const {stakedFrogToken, alice, bob, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      // when
      const tx = alice.stakedFrogToken.transfer(bob.address, amount)
      // then
      await expect(tx).to.be.revertedWith('locked')
    })
    it('Should revert with "transfer to the zero address"', async function () {
      // given
      const {stakedFrogToken, alice, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      // when
      const tx = alice.stakedFrogToken.transfer(ADDRESS_ZERO, amount)
      // then
      await expect(tx).to.be.revertedWith('transfer to the zero address')
    })
    it('Should revert with "transfer amount exceeds balance"', async function () {
      // given
      const {stakedFrogToken, alice, bob, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      const lockedUntil = await stakedFrogToken.lockedUntil(alice.address)
      await setNextBlockTimestamp(lockedUntil)
      // when
      const tx = alice.stakedFrogToken.transfer(bob.address, amount.add(1))
      // then
      await expect(tx).to.be.revertedWith('transfer amount exceeds balance')
    })
  })

  describe('transferFrom', function () {
    it('Should transfer shares', async function () {
      // given
      const {stakedFrogToken, alice, bob, carol, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      await alice.stakedFrogToken.approve(carol.address, amount)
      const lockedUntil = await stakedFrogToken.lockedUntil(alice.address)
      await setNextBlockTimestamp(lockedUntil)
      // when
      const tx = await carol.stakedFrogToken.transferFrom(alice.address, bob.address, amount)
      // then
      await expect(tx).to.emit(stakedFrogToken, 'Transfer').withArgs(alice.address, bob.address, amount)
      expect(await stakedFrogToken.balanceOf(alice.address)).to.be.equal(0)
      expect(await stakedFrogToken.balanceOf(bob.address)).to.be.equal(amount)
    })
    it('Should revert with "low allowance"', async function () {
      // given
      const {stakedFrogToken, alice, bob, carol, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      // when
      const tx = carol.stakedFrogToken.transferFrom(alice.address, bob.address, amount)
      // then
      await expect(tx).to.be.revertedWith('low allowance')
    })
    it('Should revert with "locked"', async function () {
      // given
      const {stakedFrogToken, alice, bob, carol, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      await alice.stakedFrogToken.approve(carol.address, amount)
      // when
      const tx = carol.stakedFrogToken.transferFrom(alice.address, bob.address, amount)
      // then
      await expect(tx).to.be.revertedWith('locked')
    })
    it('Should revert with "transfer to the zero address"', async function () {
      // given
      const {stakedFrogToken, alice, bob, carol, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      await alice.stakedFrogToken.approve(carol.address, amount)
      // when
      const tx = carol.stakedFrogToken.transferFrom(alice.address, ADDRESS_ZERO, amount)
      // then
      await expect(tx).to.be.revertedWith('transfer to the zero address')
    })
    it('Should revert with "transfer amount exceeds balance"', async function () {
      // given
      const {stakedFrogToken, alice, bob, carol, treasure} = await waffle.loadFixture(setup)
      const amount = parseCoin('2')
      await treasure.frogToken.transfer(alice.address, amount)
      await alice.frogToken.approve(stakedFrogToken.address, amount)
      await alice.stakedFrogToken.mint(amount)
      await alice.stakedFrogToken.approve(carol.address, amount)
      // when
      const tx = carol.stakedFrogToken.transferFrom(carol.address, bob.address, amount.add(1))
      // then
      await expect(tx).to.be.revertedWith('transfer amount exceeds balance')
    })
  })
})

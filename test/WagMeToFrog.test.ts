import {waffle} from 'hardhat'
import {expect} from 'chai'
import {setup} from '@/utils/fixture'
import {parseCoin} from '@/utils/helpers'

describe('WagMeToFrog', function () {
  describe('constructor', function () {
    it('Should initialize', async function () {
      // given
      const {wagMeToFrog, wagMeToken, frogToken} = await waffle.loadFixture(setup)
      // when
      const wagMeTokenAddr = await wagMeToFrog.wagMeToken()
      const frogTokenAddr = await wagMeToFrog.frogToken()
      // then
      expect(wagMeTokenAddr).to.be.equal(wagMeToken.address)
      expect(frogTokenAddr).to.be.equal(frogToken.address)
    })
  })
  describe('claim', function() {
    it('Should claim all wagme', async function() {
      // given
      const {wagMeToFrog, wagMeToken, frogToken, owner, alice} = await waffle.loadFixture(setup)
      const amount = parseCoin('1.23')
      await owner.frogToken.transfer(wagMeToFrog.address, amount)
      await owner.wagMeToken.transfer(alice.address, amount)
      console.log(await wagMeToken.balanceOf(alice.address))
      await alice.wagMeToken.approve(wagMeToFrog.address, amount)
      // when
      const tx = await alice.wagMeToFrog.claim()
      // then
      expect(await wagMeToken.balanceOf(alice.address)).to.be.equal(0)
      expect(await frogToken.balanceOf(alice.address)).to.be.equal(amount)
    })
    it('Should revert with "NOT_APPROVED"', async function () {
      // given
      const {wagMeToFrog, wagMeToken, frogToken, owner, alice} = await waffle.loadFixture(setup)
      await owner.wagMeToken.transfer(alice.address, parseCoin('1.23'))
      // when
      const tx = alice.wagMeToFrog.claim()
      // then
      await expect(tx).to.be.revertedWith('NOT_APPROVED')
    })
  })
  describe('withdraw', function() {
    it('Should withdraw all balance', async function() {
      // given
      const {wagMeToFrog, frogToken, owner} = await waffle.loadFixture(setup)
      await owner.frogToken.transfer(wagMeToFrog.address, parseCoin('1.23'))
      const balance = await frogToken.balanceOf(owner.address)
      // when
      const tx = await owner.wagMeToFrog.withdraw()
      // then
      expect(await frogToken.balanceOf(wagMeToFrog.address)).to.be.equal(0)
      expect(await frogToken.balanceOf(owner.address)).to.be.gt(balance)
    })
    it('Should revert with "Ownable: caller is not the owner"', async function () {
      // given
      const {wagMeToFrog, alice} = await waffle.loadFixture(setup)
      // when
      const tx = alice.wagMeToFrog.withdraw()
      // then
      await expect(tx).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
})

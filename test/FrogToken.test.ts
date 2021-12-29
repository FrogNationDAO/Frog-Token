import {waffle} from 'hardhat'
import {expect} from 'chai'
import {setup} from '@/utils/fixture'
import {parseCoin} from '@/utils/helpers'

describe('FrogsToken', function () {
  describe('constructor', function () {
    it('Should initialize', async function () {
      // given
      const {frogToken, owner} = await waffle.loadFixture(setup)
      // when
      const name = await frogToken.name()
      const symbol = await frogToken.symbol()
      const maxSupply = await frogToken.MAX_SUPPLY()
      // then
      expect(name).to.be.equal('Frog Nation DAO')
      expect(symbol).to.be.equal('FRG')
      expect(maxSupply).to.be.equal(parseCoin('6900000420'))
      expect(await frogToken.balanceOf(owner.address)).to.be.equal(parseCoin('6900000420'))
    })
  })
})

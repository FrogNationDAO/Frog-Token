import {deployments, ethers, getNamedAccounts, waffle} from 'hardhat'
import {Contract} from 'ethers'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {FrogToken__factory} from '@/types'

export async function setup() {
  await deployments.fixture()

  const provider = waffle.provider
  const [deployer] = await ethers.getSigners()

  const {
    deployer: ownerAddr,
    alice: aliceAddr,
    bob: bobAddr,
    carol: carolAddr,
  } = await getNamedAccounts()

  const FrogToken = await deployments.get('FrogToken')

  const contracts = {
    frogToken: FrogToken__factory.connect(FrogToken.address, deployer),
  }

  const [owner, alice, bob, carol] = await setupUsers([
    ownerAddr, aliceAddr, bobAddr, carolAddr,
  ], contracts)

  return {
    ...contracts, provider,
    owner, alice, bob, carol,
  }

}

type UserHelper<T extends { [contractName: string]: Contract }> = SignerWithAddress & T

export async function setupUsers<T extends { [contractName: string]: Contract }>(
  addresses: string[],
  contracts: T,
): Promise<UserHelper<T>[]> {
  const users: UserHelper<T>[] = []
  for (const address of addresses) {
    users.push(await setupUser(address, contracts))
  }
  return users
}

export async function setupUser<T extends { [contractName: string]: Contract }>(
  address: string,
  contracts: T,
): Promise<UserHelper<T>> {
  const signer = await ethers.getSigner(address)
  const user: any = signer
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(signer)
  }
  return user as UserHelper<T>
}

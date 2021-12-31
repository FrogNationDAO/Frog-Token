import {HardhatRuntimeEnvironment} from 'hardhat/types'

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre
  const {deployer} = await getNamedAccounts()

  const frogToken = await deployments.get('FrogToken')

  const stakedFrogToken = await deployments.deploy('StakedFrogToken', {
    from: deployer,
    args: [
      frogToken.address,
    ],
    log: true,
  })
}
deploy.tags = ['StakedFrogToken']

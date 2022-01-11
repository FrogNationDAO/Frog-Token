import {HardhatRuntimeEnvironment} from 'hardhat/types'

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre
  const {deployer} = await getNamedAccounts()

  const frogToken = await deployments.get('FrogToken')
  const wagMeToken = await deployments.get('WagMeToken')

  const stakedFrogToken = await deployments.deploy('WagMeToFrog', {
    from: deployer,
    args: [
      frogToken.address,
      wagMeToken.address,
    ],
    log: true,
  })
}
deploy.tags = ['WagMeToFrog']

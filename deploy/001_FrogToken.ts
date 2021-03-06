import {HardhatRuntimeEnvironment} from 'hardhat/types'

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre
  const {deployer, treasure} = await getNamedAccounts()

  const frogToken = await deployments.deploy('FrogToken', {
    from: deployer,
    args: [
      treasure,
    ],
    log: true,
  })
}
deploy.tags = ['FrogToken']

import {HardhatRuntimeEnvironment} from 'hardhat/types'

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const {ethers, deployments, getNamedAccounts} = hre
  const {deployer} = await getNamedAccounts()

  const coin = await deployments.deploy('FrogToken', {
    from: deployer,
    args: [
      deployer,
    ],
    log: true,
  })
}
deploy.tags = ['FrogToken']

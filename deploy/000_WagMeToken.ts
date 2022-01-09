import {HardhatRuntimeEnvironment} from 'hardhat/types'

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre
  const {deployer, treasure} = await getNamedAccounts()

  const isMainnet = hre.network.config.tags.indexOf('mainnet') != -1
  if (isMainnet) {
    await deployments.save('WagMeToken', {
      address: '0x35bd272c88d2dc370509689ddbe5259e1b50d34d',
      abi: []
    })

    return
  }

  const WagMeToken = await deployments.deploy('WagMeToken', {
    from: deployer,
    args: [
      'Wag Me To The Sun',
      'WagMe',
      '6900000420000000000000000000',
      deployer,
    ],
    log: true,
  })
}
deploy.tags = ['WagMeToken']

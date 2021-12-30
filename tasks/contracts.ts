import {task} from 'hardhat/config'

task('contracts', 'Prints all contracts address', async (taskArgs, hre) => {

  const frogToken = await hre.deployments.get('FrogToken')
  const stakedFrogToken = await hre.deployments.get('StakedFrogToken')

  console.log('-------------')
  console.log(`FrogToken: ${frogToken.address}`)
  console.log(`StakedFrogToken: ${stakedFrogToken.address}`)
  console.log('-------------')

})

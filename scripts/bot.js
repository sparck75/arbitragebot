
const { ethers, artifacts } = require("hardhat");
const hre = require("hardhat");


const uniswapFactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const uniswapRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const sushiswapFactoryAddress = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
const sushiswapRouterAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
const flashLoan = '0x56Ef05B5b803eBeb68EFCAAC015414798b91375a'
const linktoken = '0xa36085F69e2889c224210F603D836748e7dC0088'

const daiAddress = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'
const wethAddress = '0xd0a1e359811322d97991e03f863a0c30c2cf029c'

async function main() {
  const provider = new ethers.getDefaultProvider('https://kovan.infura.io/v3/0be322968c214906a231738f3f6729ef')
  const signer = new ethers.Wallet('d4ece23df952e631152250d1d2ece65e7313041f41ba9798bb08269632507ef5',provider)
  console.log('Signer is:',signer.address)


  const uniswapFactory = await artifacts.readArtifact("IUniswapV2Factory")
  const uniswapRouter = await artifacts.readArtifact("IUniswapV2Router02")
  const flashloan = await artifacts.readArtifact("FlashLoan")
  const linkToken = await artifacts.readArtifact("IERC20")

  const uniswaprouter = new ethers.Contract(uniswapRouterAddress,uniswapRouter.abi,signer)
  const uniswapfactory = new ethers.Contract(uniswapFactoryAddress,uniswapFactory.abi,signer)
  const sushiswapfactory = new ethers.Contract(sushiswapFactoryAddress,uniswapFactory.abi,signer)
  const sushiswaprouter = new ethers.Contract(sushiswapRouterAddress,uniswapRouter.abi,signer)
  const flash = new ethers.Contract(flashLoan,flashloan.abi,signer)
  const link = new ethers.Contract(linktoken,linkToken.abi,signer)
  
  const uniswapPair = await uniswapfactory.getPair(daiAddress,wethAddress)
  const sushiswapPair = await sushiswapfactory.getPair(daiAddress,wethAddress)
  console.log('\n',uniswapPair,'\n',sushiswapPair)
  //call aavve flash
  //
  const amountIn = ethers.utils.parseEther('1')
  const uniswapAmountOut = await uniswaprouter.getAmountsOut(amountIn,[wethAddress,daiAddress])
  const sushiswapAmountsOut = await sushiswaprouter.getAmountsOut(amountIn, [wethAddress,daiAddress])

  

  console.log(
    '\n =========== \n On Uniswap \n Amount of Dai for 1 WETH:',ethers.utils.formatEther(uniswapAmountOut[1]),
    '\n =========== \n On Sushiswap \n Amount of Dai for 1 WETH:', ethers.utils.formatEther(sushiswapAmountsOut[1])
  )

  const balance = await provider.getBalance('0x36c0D7528F0D56d7B3f3CF066ae0f5abDdbbCb83')
  const loan = await flash.myFlashLoanCall({gasLimit: 3000000})
  
  console.log(loan)
  
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


const { ethers, artifacts } = require("hardhat");
const hre = require("hardhat");


const uniswapFactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const uniswapRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const sushiswapFactoryAddress = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
const sushiswapRouterAddress = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
const flashLoan = '0x5DFee85130E303A252c7450947648EdeaB977C96'
const linktoken = '0xa36085F69e2889c224210F603D836748e7dC0088'

const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

async function main() {
  const provider = new ethers.getDefaultProvider('https://kovan.infura.io/v3/0be322968c214906a231738f3f6729ef')
  const signer = new ethers.Wallet('YOUR PRIVATE KEY',provider)
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
  console.log(balance)
  
  const loan = await flash.myFlashLoanCall({gasLimit: 300000})
  
  console.log(loan)
  
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

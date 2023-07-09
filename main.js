const Web3 = require('web3');
const nftContractABI = require('./nft-contract-abi.json'); // Replace with the actual path to the NFT contract ABI file

const providerUrl = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'; // Replace with your Infura project ID or Ethereum node URL
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

const nftContractAddress = '0x123456789abcdef'; // Replace with the actual NFT contract address
const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

const privateKey = 'YOUR_PRIVATE_KEY'; // Replace with your private key for the account claiming and transferring the NFT
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const fromAddress = account.address;

const tokenId = '123'; // Replace with the ID of the NFT you want to claim and transfer
const recipientAddress = '0x987654321abcdef'; // Replace with the address of the recipient

async function claimAndTransferNFT() {
  try {
    const claimTx = nftContract.methods.claim(tokenId);
    const claimTxData = claimTx.encodeABI();

    const transferTx = nftContract.methods.transferFrom(fromAddress, recipientAddress, tokenId);
    const transferTxData = transferTx.encodeABI();

    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimateClaim = await claimTx.estimateGas({ from: fromAddress });
    const gasEstimateTransfer = await transferTx.estimateGas({ from: fromAddress });

    const signedClaimTx = await web3.eth.accounts.signTransaction(
      {
        from: fromAddress,
        to: nftContractAddress,
        gas: gasEstimateClaim,
        gasPrice: gasPrice,
        data: claimTxData,
        nonce: await web3.eth.getTransactionCount(fromAddress),
      },
      privateKey
    );

    const signedTransferTx = await web3.eth.accounts.signTransaction(
      {
        from: fromAddress,
        to: nftContractAddress,
        gas: gasEstimateTransfer,
        gasPrice: gasPrice,
        data: transferTxData,
        nonce: await web3.eth.getTransactionCount(fromAddress),
      },
      privateKey
    );

    const claimReceipt = await web3.eth.sendSignedTransaction(signedClaimTx.rawTransaction);
    console.log('NFT claimed:', claimReceipt);

    const transferReceipt = await web3.eth.sendSignedTransaction(signedTransferTx.rawTransaction);
    console.log('NFT transferred:', transferReceipt);
  } catch (error) {
    console.error('Error claiming and transferring NFT:', error);
  }
}

claimAndTransferNFT();

import Web3 from 'web3';

if (typeof web3 !== 'undefined') {
  console.log('Web3 injected browser: OK.')
  window.web3 = new Web3(window.web3.currentProvider);
} else
  throw new Error("Web3 not found. Install the MetaMask browser plugin or use a dapp browser like Mist.");

export default window.web3;

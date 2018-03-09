import './promise-polyfill'
import { store, app } from './app'
// import Token from 'contracts/Token';
// Enable progressive web app support (with offline-plugin)
if (process.env.NODE_ENV === 'production') {
  require('./pwa')
}

setDefaultAccount()
  .then(()=>store.dispatch("setNetwork"))
  .then(()=>store.dispatch("setDAOValues"))
  .then(()=>store.dispatch("setProposals"))
  .then(()=>store.dispatch("setDecimals"))
  .then(()=>store.dispatch("setBalance"))
  .then(()=>store.dispatch("setSupply"))
  .then(()=>app.$mount('#app'));

function setDefaultAccount(){
  return web3.eth.getAccounts()
    .then(accounts=>store.dispatch("setAccount", accounts[0]));
}

function poll(){
  web3.eth.getBlockNumber()
    .then(num=>store.commit("SET_BLOCK_NUM", num));
}

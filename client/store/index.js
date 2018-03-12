import Vue from 'vue'
import Vuex from 'vuex'
import Web3 from 'web3';
// import Registry from 'contracts/Registry';
// import Token from 'contracts/Token';
// import RECDAO from 'contracts/RECDAO';
import RECDAOArtifacts from 'artifacts/RECDAO.json';
import RegistryArtifacts from 'artifacts/Registry.json';
import TokenArtifacts from 'artifacts/Token.json';
import { NETWORKS } from '../constants.json';
import { bufferToHex, toBuffer, setLengthRight } from 'ethereumjs-util';

Vue.use(Vuex)

const state = {
  account: null,
  balance: null,
  decimals: null,
  blockNum: null,
  network: null,
  proposals: [],
  supply: null,
  username: null,
  transactions: [],
  daoValues: {},
  contracts: {},
  web3: null
}

const mutations = {
  SET_ACCOUNT (state, account) {
    state.account = account;
  },
  SET_BALANCE (state, balance) {
    state.balance = balance;
  },
  SET_CONTRACTS (state, contracts) {
    state.contracts = contracts;
  },
  SET_DECIMALS (state, decimals) {
    state.decimals = decimals;
  },
  SET_USERNAME (state, username) {
    state.username = username;
  },
  SET_NETWORK (state, network) {
    state.network = network;
  },
  SET_PROPOSALS (state, proposals) {
    state.proposals = proposals;
  },
  SET_BLOCK_NUM (state, blockNum) {
    state.blockNum = blockNum;
  },
  SET_DAO_VALUES (state, values) {
    state.daoValues = values;
  },
  SET_SUPPLY (state, supply) {
    state.supply = supply;
  },
  SET_TRANSACTIONS (state, transactions) {
    state.transactions = transactions;
  },
  SET_WEB3 (state, web3) {
    state.web3 = web3;
  }
}

const actions = {
  incrementAsync ({ commit }) {
    setTimeout(() => {
      commit('INCREMENT')
    }, 200)
  },
  setAccount ({commit, dispatch, state}, account) {
    console.log("setAccount")
    commit("SET_ACCOUNT", account);
    return dispatch("setUsername");
  },
  setContracts ({commit, dispatch, state}) {
    let contracts = [TokenArtifacts, RECDAOArtifacts, RegistryArtifacts].reduce((prev, artifacts)=>{
      prev[artifacts.contractName] = new web3.eth.Contract(artifacts.abi, artifacts.networks["4"].address);
      return prev;
    }, {});
    commit("SET_CONTRACTS", contracts);
  },
  setUsername ({ commit, dispatch, state }) {
    let {Registry} = state.contracts;
    return Registry.methods.ownerToUsername(state.account).call()
      .then(web3.utils.hexToUtf8)
      .then(username=>commit("SET_USERNAME", username))
      .then(()=>dispatch("setBalance"));
  },
  setProposals ({ commit, state }) {
    let {RECDAO} = state.contracts;
    return RECDAO.methods.getPropsStatic().call()
      .then(res=>{console.log(typeof res[0][0]); return res;})
      .then(res=>res[0].map(Number).map((action, idx)=>({
          id: idx,
          action,
          data: action === 0 ? bufferToHex(setLengthRight(toBuffer(res.data[idx]), 20)) : res.data[idx],                                   // 0 == UPGRADE
          startedAt: Number(res.startedAt[idx]),
          author: web3.utils.hexToUtf8(res.author[idx]),
        }))
      )
      .then(proposals=>{
        return RECDAO.methods.getPropsDyn().call({from: state.account})
          .then(res=>{console.log(res); return res;})
          .then(res=>proposals.map((proposal, idx)=>{
            proposal.lastSigVoteAt = Number(res.lastSigVoteAt[idx]),
            proposal.passing = res.passing[idx],
            proposal.enacted = res.enacted[idx],
            proposal.voted = res.voted[idx]
            return proposal;
          }))
      })
      .then(proposals=>commit("SET_PROPOSALS", proposals));
  },
  addTransaction ({ commit, dispatch, state }, tx) {
    let transactions = state.transactions;
    let idx = transactions.push(tx) - 1;
    commit("SET_TRANSACTIONS", transactions);
    return tx.promise()
      .then(result=>{
        console.log("result:", result);
        if(result.status && typeof tx.success === "function") tx.success();
        return dispatch("updateTransaction", {idx, result});
      })
      .catch(err=>{
        console.log(err)
        dispatch("updateTransaction", {idx, error: err});
      });
  },
  updateTransaction ({ commit, state }, {idx, result, error}) {
    // console.log("HERE I AM")
    let transactions = state.transactions;
    Vue.set(transactions, idx, { result, label: transactions[idx].label, error});
    commit("SET_TRANSACTIONS", transactions);
  },
  setDAOValues ({ commit, state }) {
    let {RECDAO} = state.contracts;
    return Promise.all([
      RECDAO.methods.PROP_STAKE().call(),
      RECDAO.methods.SIG_VOTE().call(),
      RECDAO.methods.SIG_VOTE_DELAY().call(),
      RECDAO.methods.PROP_DURATION().call(),
      RECDAO.methods.MIN_PASS().call()
    ])
    .then(res=>res.map(Number))
    .then(([PROP_STAKE, SIG_VOTE, SIG_VOTE_DELAY, PROP_DURATION, MIN_PASS])=>commit("SET_DAO_VALUES", {PROP_STAKE, SIG_VOTE, SIG_VOTE_DELAY, PROP_DURATION, MIN_PASS}));
  },
  setDecimals ({ commit, state }) {
    let {Token} = state.contracts;
    return Token.methods.decimals().call().then(res=>commit("SET_DECIMALS", res));
  },
  setBalance ({ commit, state }) {
    let {Token} = state.contracts;
    return Token.methods.balanceOf(state.account).call().then(res=>commit("SET_BALANCE", res/Math.pow(10, state.decimals)));
  },
  setSupply ({ commit, state }) {
    let {Token} = state.contracts;
    return Token.methods.totalSupply().call().then(res=>commit("SET_SUPPLY", res/Math.pow(10, state.decimals)));
  },
  setNetwork ({ commit, state }) {
    return window.web3.eth.net.getId()
      .then(id=>{
        switch (id) {
          case 1:
            return commit("SET_NETWORK", NETWORKS.MAIN);
          case 2:
            return commit("SET_NETWORK", NETWORKS.MORDEN);
          case 3:
            return commit("SET_NETWORK", NETWORKS.ROPSTEN);
          case 4:
            return commit("SET_NETWORK", NETWORKS.RINKEBY);
          case 42:
            return commit("SET_NETWORK", NETWORKS.KOVAN);
          default:
            return commit("SET_NETWORK", NETWORKS.OTHER);
        }
      });
  },
  setWeb3 ({ commit, state }) {
    return new Promise((resolve, reject)=>{
      if (typeof web3 !== 'undefined') {
        console.log('Web3 injected browser: OK.')
        window.web3 = new Web3(window.web3.currentProvider);
        commit("SET_WEB3", window.web3)
        resolve(web3);
      } else {
        reject("Web3 not found. Install the MetaMask browser plugin or use a dapp browser like Mist.")
      }
    })
  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions
})

export default store

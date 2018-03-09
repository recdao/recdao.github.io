import artifacts from 'artifacts/RECDAO.json';
import web3 from '../web3';

const contract = new web3.eth.Contract(artifacts.abi, artifacts.networks["4"].address);

export default contract;

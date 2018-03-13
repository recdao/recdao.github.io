<template>
  <div>
    <div v-if="!!username">{{username}}, you're registered. You have {{balance}} REC.</div>
    <div v-else-if="!!match">
      <p>{{match[0]}}, you will receive {{match[1]}} REC Tokens upon registration.</p>
      <v-btn color="primary" large v-on:click="register">Register</v-btn>
    </div>
    <div v-else>
      <p>{{`Your Ethereum account (${account}) does not match any that were pre-registered.`}}</p>
      <p>{{`If you have not pre-registered you can do so `}}<a target="_blank" href="https://www.reddit.com/message/compose/?to=EthRegBot&message=!ethreg%200xANETHADDRESSHERE&subject=pre-register">here</a>{{` and then wait a short while for a new registration period to be voted open. Please `}}<a target="_blank" href="https://www.reddit.com/message/compose/?to=carlslarson&subject=recdao">dm u/carlslarson</a>{{` or see the `}}<a target="_blank" href="https://www.reddit.com/r/recdao/comments/83wdeq/faq/">FAQ</a>{{` with any questions.`}}</p>
      <v-select
        v-bind:items="lookup"
        v-model="selected"
        return-object
        label="Find pre-registration account"
        autocomplete
      ></v-select>
      <p v-if="selected">{{`${selected.text} pre-registered with the account: ${selected.value}`}}</p>
    </div>
  </div>
</template>

<script>
// import RECDAO from 'contracts/RECDAO';
import userRegInputs from 'data/userRegInputs'
import unique from 'array-unique'

export default {
  components: {
  },
  data: function () {
    return {
      lookup: userRegInputs.map(u=>({text: u[0], value: u[5]})).sort((a,b)=>a.text.localeCompare(b.text)),
      selected: null,
      // txHash: null,
      // registering: false,
      // fail: false
    }
  },
  methods: {
    register(e) {
      e.preventDefault();
      this.$store.dispatch("addTransaction", {
        label: "Register",
        promise: ()=>this.RECDAO.methods.register(...this.regArgs).send({from: this.account, gas: 250000}),
        success: ()=>this.$store.dispatch("setUsername")
      });
    },
    validate(e) {
      e.preventDefault();
      console.log(this.regArgs, this.account)
      return this.RECDAO.methods.validate(...this.regArgs)
        .call({from: this.account})
        .then(res=>console.log(res))
        .catch(err=>{
          throw err;
        });
    },
    hash(e) {
      e.preventDefault();
      console.log(this.regArgs, this.account)
      return this.RECDAO.methods.hash(...this.regArgs)
        .call({from: this.account})
        .then(res=>console.log(res))
        .catch(err=>{
          throw err;
        });
    }
  },
  computed: {
    account(){ return this.$store.state.account; },
    balance(){ return this.$store.state.balance; },
    network(){ return this.$store.state.network; },
    username(){ return this.$store.state.username; },
    match(){ return this.account && userRegInputs.find(u=>u[5].toLowerCase() === this.account.toLowerCase()); },
    regArgs(){
      let data = this.match.slice(0,-1);
      data[0] = web3.utils.fromAscii(data[0]);
      return data;
    },
    RECDAO(){ return this.$store.state.contracts.RECDAO; }
  },
  created() {
    this.RECDAO.methods.roots(0).call({from: this.account})
      .then(res=>console.log(res));
  }
}

</script>

<style>

</style>

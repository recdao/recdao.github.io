<template>
  <section class="section">
    <div v-if="!web3">
      web3 not found. please install the metamask plugin or use the Mist browser.
    </div>
    <div v-else-if="!['rinkeby', 'other'].includes(network)">
      please switch to the rinkeby network.
    </div>
    <div v-else-if="!account">
      no account found. do you need to unlock metamask?
    </div>
    <div v-else>
      <register></register>
      <hr style="margin: 2rem 0"/>
      <create-proposal></create-proposal>
      <h3>Proposals</h3>
      <proposals></proposals>
    </div>
  </section>
</template>

<script>
import Counter from 'components/Counter'
import Register from 'components/Register'
import Proposals from 'components/Proposals'
import CreateProposal from 'components/CreateProposal'

export default {
  components: {
    Counter,
    Register,
    Proposals,
    CreateProposal
  },
  computed: {
    account(){ return this.$store.state.account },
    web3(){ return this.$store.state.web3 },
    network: function(){ return this.$store.state.network; }
  }
}
</script>

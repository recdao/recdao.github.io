<template>
  <section class="section">
    <register></register>
    <create-proposal></create-proposal>
    <h3>Proposals</h3>
    <proposals></proposals>
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
  }
}
</script>

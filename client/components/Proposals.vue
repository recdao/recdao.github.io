<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap>
      <proposal
        v-for="proposal in proposals"
        v-bind:key="proposal.id"
        :proposal="proposal"
        :active="isActive(proposal)"
      ></proposal>
    </v-layout>
    <!-- <v-data-iterator
      content-tag="v-layout"
      row
      wrap
      :items="proposals"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
    >
      <proposal
        slot="item"
        slot-scope="props"
        :proposal="props.item"
      ></proposal>
    </v-data-iterator> -->
  </v-container>
</template>

<script>
import Proposal from 'components/Proposal';

export default {
  components: {
    Proposal
  },
  data(){
    return {
      rowsPerPageItems: [4, 8, 12],
      pagination: {
        rowsPerPage: 4
      }
    }
  },
  computed: {
    account(){ return this.$store.state.account; },
    // active(){ return this.proposals.filter(this.isActive) },
    username(){ return this.$store.state.username; },
    proposals(){ return this.$store.state.proposals.reverse(); },
    blockNum(){ return this.$store.state.blockNum },
    daoValues(){ return this.$store.state.daoValues }
  },
  methods: {
    isActive(prop){
      let {PROP_STAKE, SIG_VOTE, SIG_VOTE_DELAY, PROP_DURATION} = this.daoValues;
      return this.blockNum < prop.startedAt + PROP_DURATION ||
        this.blockNum < prop.lastSigVoteAt + SIG_VOTE_DELAY;
    }
  }
}
</script>

<template>
  <v-flex xs12 sm6 md4 lg3>
    <v-card>
      <v-card-title><h4>{{ action.label }}</h4></v-card-title>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-content>{{ action.dataLabel }}:</v-list-tile-content>
          <v-list-tile-content class="align-end" style="user-select: text;">
            <a v-if="action.enum === 'UPGRADE'"
              :href="`https://${network}.etherscan.io/address/${proposal.data}`"
              :title="proposal.data">
              {{ proposal.data.slice(0,10) + '...' }}
            </a>
            <span v-else>{{ proposal.data }}</span>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>Author:</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ proposal.author }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>Voted:</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ proposal.voted }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>Remaining:</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ remaining }} blocks</v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>Passing:</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ proposal.passing }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>Enacted:</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ proposal.enacted }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar v-if="active && !proposal.voted">
          <v-list-tile-content>
            <v-btn color="red darken-1" dark v-on:click="vote(0)"><v-icon medium>clear</v-icon></v-btn>
          </v-list-tile-content>
          <v-list-tile-content>
            <v-btn color="green darken-1" dark v-on:click="vote(1)"><v-icon medium>check</v-icon></v-btn>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar v-else-if="active && proposal.voted">
          <v-list-tile-content>
            You voted
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar v-else-if="!active && proposal.passing && !proposal.enacted">
          <v-list-tile-content>
            <v-btn color="green darken-1" dark v-on:click="enact">enact</v-btn>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar v-else>
          <v-list-tile-content>
            Voting has ended. The proposal {{proposal.passing && proposal.enacted ? 'passed and has been enacted.' : 'failed.'}}
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-card>
  </v-flex>
</template>

<script>
// import RECDAO from 'contracts/RECDAO';
import {DAO_ACTIONS as actions} from '../constants.json';

export default {
  props: {
    proposal: Object,
    active: Boolean
  },
  data(){
    return {
      action: actions[this.proposal.action]
    }
  },
  computed: {
    account(){ return this.$store.state.account; },
    blockNum(){ return this.$store.state.blockNum; },
    daoValues(){ return this.$store.state.daoValues; },
    network(){ return this.$store.state.network; },
    remaining() {
      let {PROP_STAKE, SIG_VOTE, SIG_VOTE_DELAY, PROP_DURATION} = this.daoValues;
      console.log(this.proposal.startedAt, this.proposal.lastSigVoteAt)
      let remaining = this.proposal.startedAt + PROP_DURATION - this.blockNum;
      console.log(remaining)
      if(remaining <= 0 && this.proposal.lastSigVoteAt)
        remaining = this.proposal.lastSigVoteAt + SIG_VOTE_DELAY - this.blockNum;
      console.log(remaining)
      return remaining > 0 ? remaining : 0;
    },
    RECDAO(){ return this.$store.state.contracts.RECDAO; }
  },
  methods: {
    vote(prefId){
      this.$store.dispatch("addTransaction", {
        label: `Vote ${prefId} @prop:${this.proposal.id}`,
        promise: ()=>this.RECDAO.methods.vote(this.proposal.id, prefId).send({from: this.account, gas: 200000}),
        success: ()=>this.$store.dispatch("setProposals")
      });
    },
    enact(){
      this.$store.dispatch("addTransaction", {
        label: `Enact @prop:${this.proposal.id}`,
        promise: ()=>this.RECDAO.methods.enact(this.proposal.id).send({from: this.account, gas: 200000}),
        success: ()=>this.$store.dispatch("setProposals")
      });
    }
  }
}
</script>

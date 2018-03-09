<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-btn color="primary" dark slot="activator" :disabled="!username">New Proposal</v-btn>
    <v-card>
      <v-card-title>
        <span class="headline">Make a Proposal</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-form v-model="valid">
            <v-select
              label="Proposal Action"
              v-bind:items="actions"
              item-text="label"
              item-value="id"
              v-model="actionIdx"
              required
            ></v-select>
            <v-text-field
              :label="actions[actionIdx].dataLabel"
              v-model="textData"
              :rules="dataRules"
              required
            ></v-text-field>
          </v-form>
        </v-container>
        <small>*indicates required field</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click.native="dialog=false">Cancel</v-btn>
        <v-btn color="blue darken-1" flat @click="submit" :disabled="!valid">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import RECDAO from 'contracts/RECDAO';
import {DAO_ACTIONS as actions} from '../constants.json';

export default {
  components: {
  },
  data() {
    return {
      actions,
      actionIdx: 0,
      dialog: false,
      textData: null,
      valid: false,
      dataRules: [
        v => !!v || `required`,
        v => web3.utils.isHex(v) || "not a hex value",
        v => this.actionIdx !== 0 || web3.utils.isAddress(v) || "not a valid address"
      ]
    }
  },
  computed: {
    account(){ return this.$store.state.account; },
    username(){ return this.$store.state.username; }
  },
  methods: {
    submit(e) {
      e.preventDefault();
      console.log("ADD PROP", web3.utils.toHex(this.actionIdx), this.textData)
      this.$store.dispatch("addTransaction", {
        label: "Create Proposal",
        promise: ()=>RECDAO.methods.addProp(web3.utils.toHex(this.actionIdx), this.textData).send({from: this.account, gas: 250000}),
        success: ()=>this.$store.dispatch("setProposals")
      });
      this.dialog=false;
      this.textData=null;
    }
  }
}
</script>

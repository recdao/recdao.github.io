<template>
  <v-app id="ethtrader">
    <v-content>
      <v-container >
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-layout column style="position: fixed; bottom: 32px; width: 100%">
      <transaction-notify :label="label" :result="result" :error="error" v-for="({label,result,error}, idx) in transactions" v-bind:key="idx"></transaction-notify>
    </v-layout>
    <v-footer app fixed>
      <v-layout row justify-space-between>
        <span xs2>&copy; 2018</span>
        <div xs2>{{'Total REC: '+ supply}}</div>
        <div xs2>{{'network: '+ network}}</div>
        <div xs2>{{'block: '+ blockNum}}</div>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
import TransactionNotify from 'components/TransactionNotify'

export default {
  components: {
    TransactionNotify
  },
  data: function (){
    return {
    }
  },
  computed: {
    blockNum(){ return this.$store.state.blockNum },
    network: function(){ return this.$store.state.network; },
    supply: function(){ return this.$store.state.supply; },
    transactions(){ return this.$store.state.transactions; }
  }
}
</script>

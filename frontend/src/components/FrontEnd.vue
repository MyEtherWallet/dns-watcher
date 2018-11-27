<template>
  <div class="frontend">

    <div class="top">
      <header class="header">
        <div class="page-container header-elements-container">
          <div class="logo-image">
            <img src="https://www.myetherwallet.com/images/logo-myetherwallet.svg" alt="">
          </div>
        </div>
      </header>
      <file-check/>

      <div class="buttons-container">
        <div class="page-container">
          <div class="buttons flex-box-item-center">
            <h3 v-bind:class="[buttonClass, (currentFilter === 2) ? selectedClass : '']"
                v-on:click="filterEntries(2)">All</h3>
            <h3 v-bind:class="[buttonClass, (currentFilter === 3) ? selectedClass : '']"
                v-on:click="filterEntries(3)">Errors</h3>
            <h3 v-bind:class="[buttonClass, (currentFilter === 4) ? selectedClass : '']"
                v-on:click="filterEntries(4)">Valid</h3>
          </div>
        </div>
      </div>      
    </div>

    <div class="dns-table">
      <div class="page-container">
        <dns-result-table
          :currentFilter="currentFilter"></dns-result-table>
      </div>
    </div>

  </div>
</template>

<script>
import FileCheck from './FileCheck.vue';
import DnsResultTable from './DnsResultTable.vue';

export default {
  name: 'FrontEnd',
  props: {
    msg: String
  },
  data() {
    return {
      currentFilter: 2,
      buttonClass: 'button',
      selectedClass: 'selected'
    };
  },
  methods: {
    filterEntries(filter) {
      this.currentFilter = filter;
    }
  },
  components: {
    'file-check': FileCheck,
    'dns-result-table': DnsResultTable
  }
};
</script>

<style lang="scss">
  @import "FrontEnd.scss";
</style>

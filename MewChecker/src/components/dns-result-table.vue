<template>
  <div class="table-contents">
    <div class="validation-status">
      <p v-bind:class="{ active: errorHighLight }" v-on:click="showErrors">Errors</p>
      <p v-bind:class="{ active: validHighLight }" v-on:click="showValid">Valid</p>
    </div>

      <dns-results
        v-bind:show-good="showGood"
        v-bind:show-bad="showBad"
      ></dns-results>
  </div>

</template>

<script>
  import DnsResults from "./dns-results.vue";

  export default {
    name: "dns-result-table",
    components: {
      DnsResults
    },
    data: function () {
      return {
        sortopt: 0,
        showGood: true,
        showBad: true,
        errorHighLight: false,
        validHighLight: false,
        selected: null
      }
    },
    methods: {
      showErrors: function (event) {
        if (this.sortopt === 1) {
          this.resetSorting();
        } else {
          this.showBad = true;
          this.showGood = false;
          this.validHighLight = false;
          this.errorHighLight = true;
          this.sortopt = 1;
        }
      },
      showValid: function (event) {
        if (this.sortopt === 2) {
          this.resetSorting();
        }
        else {
          this.showBad = false;
          this.showGood = true;
          this.errorHighLight = false;
          this.validHighLight = true;
          this.sortopt = 2;
        }
      },
      resetSorting: function(event){
        this.validHighLight = false;
        this.errorHighLight = false;
        this.showBad = true;
        this.showGood = true;
        this.sortopt = 0;
      }
    },
  }
</script>

<style lang="scss">
  p.active{
    border-bottom: 1px solid rgba(0, 0, 0, 0.28);
  }
</style>

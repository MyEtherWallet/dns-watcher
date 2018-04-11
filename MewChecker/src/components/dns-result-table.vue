<template>
  <div class="table-contents">
    <div class="validation-status">
      <p v-bind:class="{ active: errorActive }" v-on:click="showErrors">Errors</p>
      <p v-bind:class="{ active: validActive }" v-on:click="showValid">Valid</p>
    </div>

      <dns-results
        v-bind:sortopt="sortopt"
        v-bind:detailedfilter="detailedfilter"
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
        detailedfilter: "",
        errorActive: false,
        validActive: false,
        selected: null
      }
    },
    methods: {
      showErrors: function (event) {
        if (this.sortopt === 1) {
          this.resetSorting();
        } else {
          this.errorActive = true;
          this.sortopt = 1;
        }
      },
      showValid: function (event) {
        if (this.sortopt === 2) {
          this.resetSorting();
        }
        else {
          this.validActive = true;
          this.sortopt = 2;
        }
        // this.sortopt = 2;
      }, resetSorting: function(event){
        this.validActive = false;
        this.validActive = false;
        this.sortopt = 0;
      }
    },
  }
</script>


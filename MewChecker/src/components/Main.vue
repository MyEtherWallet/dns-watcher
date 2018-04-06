<template>
  <div id="app">
    <!--<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"-->
          <!--integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">-->
    <div class="dns-watcher">

      <div class="wrapper">
        <header>
          <img src="~@/assets/mew-logo.png">
          <h1 class="title">DNS Watcher</h1>
          <h5 class="">status.myetherwallet.com</h5>

        </header>
        <div class="status">
          <file-check></file-check>
        </div>

        <dns-result-table></dns-result-table>
        <!--<div class="status-buttons">-->
        <!--<button>Errors</button>-->
        <!--<button>Valid</button>-->
        <!--</div>-->

        <!--<div class="table-data">-->
        <!--<dns-results></dns-results>-->
        <!--</div>-->


      </div>

    </div>

    <!--<img class="mewLogo" src="../public/mewlogo.svg">-->
    <!--<file-check></file-check>-->
    <!--<div class="checker-component">-->
    <!--<h3>DNS Nameservers correctly or incorrectly pointing to myetherwallet.com:</h3>-->
    <!--<dns-results></dns-results>-->
    <!--</div>-->

  </div>
</template>

<script>

  import FileCheck from "./FileCheck.vue";
  import DnsResultTable from "./DnsResultTable.vue";

  export default {
    name: "main",
    components: {
      FileCheck,
      DnsResultTable
    }
  }
</script>

<style>

</style>

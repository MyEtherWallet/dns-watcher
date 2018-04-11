<template>
  <div id="app" class="index">
      <div class="dns-watcher-container">
        <div class="header">
         <a href="#"><img class="logo" src="~@/assets/mew-logo.png"/></a>
        </div><!-- .header -->
          <file-check></file-check>
        <dns-result-table></dns-result-table>
      </div>
  </div>
</template>

<script>

  import FileCheck from "./file-check.vue";
  import DnsResultTable from "./dns-result-table.vue";

  export default {
    name: "main",
    components: {
      FileCheck,
      DnsResultTable
    }
  }
</script>

<style lang="scss">
  @import "style.scss";
</style>

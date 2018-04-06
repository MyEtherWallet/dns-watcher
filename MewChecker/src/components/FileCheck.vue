<template>
  <div class="checker">
    <div v-if="checkComplete">
      <div v-if="fileCheckResult">
        <h1 class="validation valid"><i class="fa fa-check" aria-hidden="true"></i> Valid</h1>
      </div>
      <div v-else>
        <h1 class="validation invalid"><i class="fa fa-times" aria-hidden="true"></i> Error</h1>
      </div>
    </div>
    <div v-else>
      <h1 class="validation checking"><i class="fa fa-spinner fa-pulse" aria-hidden="true"></i> Checking</h1>
    </div>
  </div>
</template>

<script>
  import fileCheck from "../js/inBrowserFileCheck";

  let files = [
    "/index.html",
    "/embedded.html",
    "/helpers.html",
    "/signmsg.html",
    "/bin/startMEW.js",
    "/css/etherwallet-master.min.css",
    // fontsBold: "",
    // fontsLight: "",
    // fontsRegular: "",
    "/js/etherwallet-master.js",
    "/js/etherwallet-static.min.js",
    "/js/jquery-1.12.3.min.js"
  ];


  export default {
    name: "file-check",
    data: function () {
      return {
        checkComplete: false,
        fileCheckResult: false,
        poolingFileCheck: ""
      }
    },
    methods: {
      fileCheck() {
        fileCheck(files)
          .then(result => {
            console.log("complete");
            this.fileCheckResult = result;
            this.checkComplete = true;
          })
          .catch(error => {
            console.error(error);
            clearInterval(this.fileCheckResult);
          })
      }
    },
    created() {
      this.fileCheck();
      this.poolingFileCheck = setInterval(() => {
        this.fileCheckResult = false;
        this.fileCheck();
      }, 60000)
    }
  }
</script>

<style lang="scss">
  @import 'style.scss';
</style>

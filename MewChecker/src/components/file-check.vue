<template>
  <div>
    <div v-if="checkComplete">
        <div v-if="fileCheckResult" class="status-indication valid">
          <div class="site-title">
            <h1>DNS Watcher</h1>
            <h3>status.myetherwallet.com</h3>
          </div>
          <div class="status-icon">
            <p class=""><i class="fa fa-check" aria-hidden="true"></i> Valid</p>
          </div>
        </div><!-- .status-indication -->
        <div v-else class="status-indication error">
          <div class="site-title">
            <h1>DNS Watcher</h1>
            <h3>status.myetherwallet.com</h3>
          </div>
          <div class="status-icon">
            <p class=""><i class="fa fa-exclamation" aria-hidden="true"></i> Error</p>
          </div>
        </div><!-- .status-indication -->
    </div>
      <div v-else class="status-indication checking">
        <div class="site-title">
          <h1>DNS Watcher</h1>
          <h3>status.myetherwallet.com</h3>
        </div>
        <div class="status-icon">
          <p class=""><i class="fa fa-refresh" aria-hidden="true"></i> Checking</p>
        </div>
      </div><!-- .status-indication -->
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

  // function fileChecker() {
  //   fileCheck(files)
  //     .then(result => {
  //       console.log("complete");
  //       this.fileCheckResult = result;
  //       this.checkComplete = true;
  //     })
  //     .catch(error => {
  //       console.error(error);
  //       clearInterval(this.fileCheckResult);
  //     })
  // }


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
      // fileCheck() {
      //   fileCheck(files)
      //     .then(result => {
      //       console.log("complete");
      //       this.fileCheckResult = result;
      //       this.checkComplete = true;
      //     })
      //     .catch(error => {
      //       console.error(error);
      //       clearInterval(this.fileCheckResult);
      //     })
      // }
    },
    mounted() {
      this.$nextTick(() =>{
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
        this.poolingFileCheck = setInterval(() => {
          this.checkComplete = false;
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
        }, 300000) // checks file status every 5 minutes
      })
    }
  }
</script>

<style lang="scss">
  @import 'style.scss';
</style>

<template>

  <div v-if="checkComplete">
    <div v-if="fileCheckResult" class="page-title">
      <div class="page-container flex-box-item-center">
        <div class="title">
          <h1>DNS Watcher</h1>
          <h4>{{status_site}}</h4>
        </div>
        <div class="current-status ">
          <p class="good-files"><i class="fa fa-check-circle-o" aria-hidden="true"></i> VALID</p>
        </div>
      </div>
    </div>
    <div v-else class="page-title">
      <div class="page-container flex-box-item-center">
        <div class="title">
          <h1>DNS Watcher</h1>
          <h4>{{status_site}}</h4>
        </div>
        <div class="current-status ">
          <p class="bad-files"><i class="fa fa-times-circle-o" aria-hidden="true"></i> ERROR</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="page-title">
    <div class="page-container flex-box-item-center">
      <div class="title">
        <h1>DNS Watcher</h1>
        <h4>{{status_site}}</h4>
      </div>
      <div class="current-status">
        <p class="checking-files"><i class="fa fa-refresh" aria-hidden="true"></i> CHECKING</p>

      </div>
    </div>
  </div>
</template>

<script>

import fileCheck from '../inBrowserFileCheck';

// let files = [
//   '/index.html',
//   '/embedded.html',
//   '/helpers.html',
//   '/signmsg.html',
//   '/bin/startMEW.js',
//   '/css/etherwallet-master.min.css',
//   '/js/etherwallet-master.js',
//   '/js/etherwallet-static.min.js',
//   '/js/jquery-1.12.3.min.js'
// ];

export default {
  name: 'file-check',
  data: function() {
    return {
      checkComplete: false,
      fileCheckResult: false,
      poolingFileCheck: '',
      status_site: process.env.STATUS_SITE
    };
  },
  methods: {
    startPolling() {
      this.poolingFileCheck = setInterval(() => {
        this.checkComplete = false;
        fileCheck()
          .then(result => {
            this.fileCheckResult = result;
            this.checkComplete = true;
          })
          .catch(error => {
            console.error(error);
            clearInterval(this.poolingFileCheck);
          });
      }, 300000); // checks file status every 5 minutes
    }
  },
  mounted() {
    this.$nextTick(() => {
      fileCheck()
        .then(result => {
          this.fileCheckResult = result;
          this.checkComplete = true;
          this.startPolling();
        })
        .catch(error => {
          console.error(error);
        });
    });
  }
};
</script>



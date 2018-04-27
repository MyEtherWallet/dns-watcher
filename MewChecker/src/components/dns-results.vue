<template>
  <table>
    <thead>
    <tr>
      <td>Status</td>
      <td>IP</td>
      <td>Location</td>
      <td>Last Checked</td>
    </tr>
    </thead>

    <tbody>
    <dns-display v-if="displayList" v-for="(ip, index) in bad"
                 v-bind:key="ip.key"
                 v-bind:index = "index"
                 v-bind:ip="ip"
                 v-bind:status="0"
                 v-bind:detailedfilter="detailedfilter"
                 v-bind:sort="sortopt == 1 || sortopt == 0"></dns-display>
    <dns-display v-if="displayList" v-for="(ip, index) in good"
                 v-bind:key="ip.key"
                 v-bind:index = "index"
                 v-bind:ip="ip"
                 v-bind:status="1"
                 v-bind:detailedfilter="detailedfilter"
                 v-bind:sort="sortopt == 2 || sortopt == 0"></dns-display>
    </tbody>

  </table>
</template>

<script>
  import dnsDisplay from "./dns-display.vue";
  const host = "54.70.164.31";
  const port = "";
  const proto = "http";

  const request = require("request-promise-native");

  export default {
    name: "dns-results",
    props: ["sortopt", "detailedfilter"],
    data: function () {
      return {
        displayList: false,
        statusGood: 'good',
        statusBad: 'bad',
        good: [],
        bad: [],
        timestamp: "",
        updateChecker: ""
      }
    },
    methods: {
      getDnsResults() {
          request(proto + "://" + host + ":" + port + "/dns-report")
            .then((result) => {
              console.log("got DNS Results");
              this.updateGood = [];
              this.updateBad = [];
              let vForKey = 0;
              try {
                let json = JSON.parse(result);
                json.good.forEach(val => {
                  val.key = ++vForKey;
                  this.updateGood.push(val);
                });
                json.bad.forEach(val => {
                  val.key = ++vForKey;
                  this.updateBad.push(val);
                });

                this.good.splice(0, this.good.length, ...this.updateGood);
                this.bad.splice(0, this.bad.length, ...this.updateBad);
                if(!this.displayList){
                  this.displayList = true;
                }
                this.timestamp = json.timestamp;
              } catch (e) {
                console.error(e);
              }
            })
      },
      checkForResultUpdate() {
        this.updateChecker = setInterval(() => {
          request(proto + "://" + host + ":" + port + "/new-results?timestamp=" + Date.parse(this.timestamp))
            .then(JSON.parse)
            .then((result) => {
              try {
                if (result.result) {
                  this.getDnsResults();
                }
                console.log("can update check", result.result);
              } catch (e) {
                console.error(e);
              }
            })
            .catch(error => {
              console.error(error);
              console.error("FAILED TO CONNECT TO SERVER. WILL RETRY IN 1 MINUTE");
              clearInterval(this.updateChecker);
              setTimeout(() => {
                this.checkForResultUpdate();
              }, 60000) // retry after a minute
            })
        }, 10000)
      }
    },
    created() {
      this.getDnsResults();
      this.checkForResultUpdate();
    },
    components: {
      "dns-display": dnsDisplay
    }
  }
</script>

<style lang="scss">
  @import 'style.scss';
</style>

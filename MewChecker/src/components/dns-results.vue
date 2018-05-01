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
    <dns-display v-if="displayBad && showBad" v-for="(ip, index) in bad"
                 v-bind:key="ip.key"
                 v-bind:name="ip.name"
                 v-bind:ns="ip.ns"
                 v-bind:good-status="false"
                 v-bind:bad-status="true"
                 v-bind:timestamp="timestamp"
                 v-bind:country="ip.country"></dns-display>
    <dns-display v-if="displayGood && showGood" v-for="(ip, index) in good"
                 v-bind:key="ip.key"
                 v-bind:name="ip.name"
                 v-bind:ns="ip.ns"
                 v-bind:good-status="true"
                 v-bind:bad-status="false"
                 v-bind:timestamp="timestamp"
                 v-bind:country="ip.country"></dns-display>
    </tbody>

  </table>
</template>

<script>
  import dnsDisplay from "./dns-display.vue";

  const request = require("request-promise-native");

  export default {
    name: "dns-results",
    props: ["showGood", "showBad"],
    data: function () {
      return {
        displayBad: false,
        displayGood: false,
        displayList: false,
        statusGood: 'good',
        statusBad: 'bad',
        good: [],
        bad: [],
        timestamp: "",
        updateChecker: ""
      }
    },
    watch: {

    },
    methods: {
      getDnsResults() {
        request(window.location.origin + "/dns-report")
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
              if (!this.displayList) {
                this.displayList = true;
                this.displayBad = true;
                this.displayGood = true;
              }
              console.log("parsed DNS Results");
              console.log(this.detailedfilter); //todo remove dev item
              this.timestamp = json.timestamp;
              this.$forceUpdate();
            } catch (e) {
              console.error(e);
            }
          })
      },
      checkForResultUpdate() {
        this.updateChecker = setInterval(() => {
          request(window.location.origin + "/new-results")
            .then(JSON.parse)
            .then((result) => {
              try {
                let displayedList = Date.parse(this.timestamp);
                let currentList = Date.parse(result.timestamp);
                console.log("displayedList", displayedList); //todo remove dev item
                console.log("currentList", currentList); //todo remove dev item
                if (+currentList > +displayedList) {
                  this.getDnsResults();
                }
                console.log(result); //todo remove dev item
                console.log("can update check", result.timestamp);
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
    computed: {
      filterResults(){

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

<template>
  <div v-if="displayList" class="table-data">
    <table>
      <tbody>
      <tr>
        <td></td>
        <td>IP</td>
        <td>Location</td>
        <td>Last Checked</td>
      </tr>
      <dns-display-bad v-for="(ip, index) in bad"
                       :key="index"
                       v-bind:ip="ip"
                       v-bind:status="sortopt == 1 || sortopt == 0"></dns-display-bad>
      <dns-display-good v-for="(ip, index) in good"
                        :key="index"
                        v-bind:ip="ip"
                        v-bind:status="sortopt == 2 || sortopt == 0"></dns-display-good>

      </tbody>

    </table>
  </div>
</template>

<script>
  import dnsDisplayGood from "./dns-display-good.vue";
  import dnsDisplayBad from "./dns-display-bad.vue";

  const request = require("request-promise-native");

  export default {
    name: "dns-results",
    props: ["sortopt"],
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
        request("https://localhost:3000/dns-report")
          .then((result) => {
            console.log("got DNS Results");
            this.good = [];
            this.bad = [];
            try {
              let json = JSON.parse(result);
              json.good.forEach(val => {
                this.good.push(val);
              });
              json.bad.forEach(val => {
                this.bad.push(val);
              });
              this.timestamp = json.timestamp;
              // this.good = result.good;
              // this.bad = result.bad;
              this.displayList = true;
            } catch (e) {
              console.error(e);
            }
          })
      },
      checkForResultUpdate() {
        // /new-results
        this.updateChecker = setInterval(() => {
        request("https://localhost:3000/new-results?timestamp="+ Date.parse(this.timestamp))
          .then(JSON.parse)
          .then((result) => {
            try {
              if(result.result){
                // console.log("updating list");
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
            setTimeout(()=>{
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
      "dns-display-good": dnsDisplayGood,
      "dns-display-bad": dnsDisplayBad
    }
  }
</script>

<style lang="scss">
  @import 'style.scss';
</style>

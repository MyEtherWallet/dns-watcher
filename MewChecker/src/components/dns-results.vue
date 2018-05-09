<template>
    <table>
        <thead>
        <tr>
            <td>Status</td>
            <td>DNS Server</td>
            <td>Location</td>
            <td>Last Checked</td>
            <td>Resolutions</td>
        </tr>
        </thead>

        <tbody class="table-body">
        <dns-display-bad v-if="displayBad" v-for="(ip, index) in bad"
                         v-bind:key="ip.ns"
                         v-bind:name="ip.name"
                         v-bind:ns="ip.ns"
                         v-bind:addresses="ip.resolved"
                         v-bind:timestamp="timestamp"
                         v-bind:country="ip.country"></dns-display-bad>
        <dns-display-good v-if="displayGood" v-for="(ip, index) in good"
                          v-bind:key="ip.ns"
                          v-bind:name="ip.name"
                          v-bind:ns="ip.ns"
                          v-bind:timestamp="timestamp"
                          v-bind:country="ip.country"></dns-display-good>
        </tbody>

    </table>
</template>

<script>
    // import dnsDisplay from "./dns-display.vue";
    import dnsDisplayGood from "./dns-display-good.vue";
    import dnsDisplayBad from "./dns-display-bad.vue";


    const request = require("request-promise-native");

    export default {
        name: "dns-results",
        // props: ["showGood", "showBad"],
        data: function () {
            return {
                displayBad: true,
                displayGood: true,
                displayList: false,
                statusGood: 'good',
                statusBad: 'bad',
                good: [],
                bad: [],
                timestamp: "",
                updateChecker: "",
                updateCheckerStarted: false
            }
        },
        // watch: {
        //
        // },
        methods: {
            getDnsResults() {
                request(window.location.origin + "/dns-report")
                    .then((result) => {
                        console.log("got DNS Results");
                        // this.updateGood = [];
                        // this.updateBad = [];
                        // let vForKey = 0;
                        try {
                            let json = JSON.parse(result);
                            // json.good.forEach(val => {
                            //   val.key = ++vForKey;
                            //   this.updateGood.push(val);
                            //   console.log(vForKey); //todo remove dev item
                            // });
                            // json.bad.forEach(val => {
                            //   val.key = ++vForKey;
                            //   this.updateBad.push(val);
                            //   console.log(vForKey); //todo remove dev item
                            // });
                            this.good.splice(0, this.good.length, ...json.good);
                            this.bad.splice(0, this.bad.length, ...json.bad);
                            this.timestamp = json.timestamp;
                            // if (this.displayList) {
                            // if (!this.displayList) {
                            //   this.displayList = true;
                            //   this.good = [...json.good];
                            //   this.bad = [...json.bad];
                            //   this.timestamp = json.timestamp;
                            //   console.log("parsed DNS Results");
                            //   this.$forceUpdate();
                            // } else {
                            //   this.good.splice(0, this.good.length, ...json.good);
                            //   this.bad.splice(0, this.bad.length, ...json.bad);
                            //   this.timestamp = json.timestamp;
                            // }

                            // if(!this.updateCheckerStarted) {
                            //   this.updateCheckerStarted = true;
                            //   this.checkForResultUpdate();
                            // }


                            // this.$forceUpdate();
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

        created() {
            this.checkForResultUpdate();
            // this.getDnsResults();
        },
        beforeCreate() {
            request(window.location.origin + "/dns-report")
                .then((result) => {
                    console.log("got DNS Results");
                    try {
                        let json = JSON.parse(result);
                        this.displayList = true;
                        this.good = [...json.good];
                        this.bad = [...json.bad];
                        this.timestamp = json.timestamp;
                        console.log("parsed DNS Results");
                        this.$forceUpdate();
                        // this.checkForResultUpdate();
                    } catch (e) {
                        console.error(e);
                    }
                })
        },
        components: {
            "dns-display-good": dnsDisplayGood,
            "dns-display-bad": dnsDisplayBad
            // "dns-display": dnsDisplay
        }
    }
</script>

<style lang="scss">
    @import 'style.scss';

</style>

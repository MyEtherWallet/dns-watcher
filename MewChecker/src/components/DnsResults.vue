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
                timestamp: ""
            }
        },
        methods: {
            getDnsResults() {
                request("https://localhost:3000/dns-report")
                    .then((result) => {
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
            }
        },
        created() {
            this.getDnsResults();
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
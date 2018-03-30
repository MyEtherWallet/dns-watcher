<template>
    <div class="container">
        <div v-if="displayList" class="timestamp">
            Updated at: {{timestamp}}
        </div>
        <div class="boxit">
            <h3 class="incorrect">Incorrect</h3>
            <div v-if="displayList">
                <dns-display v-for="(ip, index) in bad"
                             :key="index"
                             v-bind:ip="ip"
                             class="negative"></dns-display>
            </div>

        </div>

        <br>
        <div class="boxit error-border">
            <h3>Correct</h3>
            <div v-if="displayList">
                <dns-display v-for="(ip, index) in good"
                             :key="index"
                             v-bind:ip="ip"></dns-display>
            </div>
        </div>
    </div>
</template>

<script>
    import dnsDisplay from "./dns-display.vue";

    const request = require("request-promise-native");

    export default {
        name: "dns-results",
        data: function () {
            return {
                displayList: false,
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
            "dns-display": dnsDisplay
        }
    }
</script>

<style scoped>
    .container {
        position: absolute;
        right: 50%;
    }

    .timestamp{
        text-align: center;
    }
    .incorrect {
        color: red;
    }


    .negative {
        text-align: center;
        color: black;
        background: red;
        width: 150%
    }

    .boxit {
        text-align: center;
        position: relative;
        /*right: -470%;*/
        /*left: 25%;*/
        width: 70%;

    }
</style>
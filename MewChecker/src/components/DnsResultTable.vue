<template>
    <div>
        <div class="status-buttons">
            <button v-bind:class="{ active: errorActive }" v-on:click="showErrors">Errors</button>
            <button v-bind:class="{ active: validActive }" v-on:click="showValid">Valid</button>
        </div>

        <div class="table-data">
            <dns-results v-bind:sortopt="sortopt"></dns-results>
        </div>
    </div>

</template>

<script>
    import DnsResults from "./DnsResults.vue";

    export default {
        name: "dns-result-table",
        components: {
            DnsResults
        },
        data: function () {
            return {
                sortopt: 0,
                errorActive: false,
                validActive: false
            }
        },
        methods: {
            showErrors: function (event) {
                if (this.sortopt === 1) {
                    this.errorActive = false;
                    this.sortopt = 0;
                } else {
                    this.errorActive = true;
                    this.sortopt = 1;
                }
            },
            showValid: function (event) {
                if (this.sortopt === 2) {
                    this.validActive = false;
                    this.sortopt = 0;
                }
                else {
                    this.validActive = true;
                    this.sortopt = 2;
                }
                // this.sortopt = 2;
            }
        }
    }
</script>

<style scoped>
    .active {
        background-color: #356bc7;
    }
</style>
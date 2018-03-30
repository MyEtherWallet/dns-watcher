<template>
    <div id="app" >
        <img class="mewLogo" src="../public/mewlogo.svg">
        <file-check></file-check>
        <div class="checker-component">
            <h3>DNS Nameservers correctly or incorrectly pointing to myetherwallet.com:</h3>
            <dns-results></dns-results>
        </div>

    </div>
</template>

<script>
    import FileCheck from "./components/FileCheck.vue";
    import DnsResults from "./components/DnsResults.vue";

    export default {
        name: 'app',
        components: {
            FileCheck,
            DnsResults
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
    .checker-component{
        margin-top: 75px;
    }
    .mewLogo{
        position: absolute;
        height: 200px;
        width: 200px;
        top: 5%;
        left: 1%;
    }
</style>

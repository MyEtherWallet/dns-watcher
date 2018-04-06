<template>
    <tr v-show="status">
        <td ><i class="fa fa-check"></i></td>
        <td>{{ip.ns}}</td>
        <td>{{ip.country}}</td>
        <td>{{ip.timestamp}}</td>
    </tr>
</template>

<script>
    export default {
        name: "dns-display-good",
        props: ["status", "ip"]
    }
</script>

<style lang="scss">
    @import 'style.scss';
</style>
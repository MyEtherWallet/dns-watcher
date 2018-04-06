<template>
    <tr v-show="status">
        <td><i class="fa fa-times"></i></td>
        <td>{{ip.ns}}</td>
        <td>{{ip.country}}</td>
        <td>{{ip.timestamp}}</td>
    </tr>
</template>

<script>
    export default {
        name: "dns-display-bad",
        props: ["status", "ip"]
    }
</script>

<style lang="scss">
    @import 'style.scss';
</style>

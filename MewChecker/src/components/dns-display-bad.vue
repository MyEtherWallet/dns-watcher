<template>
    <tr v-show="shoulddisplay">
        <td><i class="fa fa-times"></i></td>
        <td>{{ip.ns}}</td>
        <td>{{ip.country}}</td>
        <td>{{ip.timestamp}}</td>
    </tr>
</template>

<script>
    export default {
        name: "dns-display-bad",
        props: ["detailedsort", "sort", "ip"],
      computed: {
        shoulddisplay: function(){
            // if(this.sort)
          return false;
          }
      }
    }
</script>

<style lang="scss">
    @import 'style.scss';
</style>

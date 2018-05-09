<template>
  <tr>
    <td class="status"><i class="fa fa-times" aria-hidden="true"></i></td>
    <td>{{ns}} <small v-if="name"><br><em >{{name}}</em></small></td>
    <td>{{country}}</td>
    <td class="locationPad">{{timestamp}}</td>
    <td><small v-for="addr in addresses" >{{addr}}<br></small></td>
    <!--<td>{{index}}</td>-->
  </tr>
</template>

<script>
  // import * as countries from "i18n-iso-countries";

  // const countries = require("i18n-iso-countries");

  export default {
    name: "dns-display-bad",
    props: ["name", "ns", "country", "addresses", "timestamp"]
  }
</script>


<style scoped>
  small{
    font-size: 12px;
    font-weight: 200;
  }
  .locationPad{
    padding-left: 10px;
  }
  </style>

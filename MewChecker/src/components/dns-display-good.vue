<template>
  <tr>
    <td class="status"><i class="fa fa-check" aria-hidden="true"></i></td>
    <td>{{ns}} <small v-if="name"><br><em >{{name}}</em></small></td>
    <td>{{country}}</td>
    <td>{{timestamp}}</td>
    <!--<td>{{index}}</td>-->
  </tr>
</template>

<script>
  // import * as countries from "i18n-iso-countries";

  // const countries = require("i18n-iso-countries");

  export default {
    name: "dns-display-good",
    props: ["name", "ns", "country", "timestamp"]
  }
</script>


<style scoped>
  small{
    font-size: 12px;
    font-weight: 200;
  }
  </style>

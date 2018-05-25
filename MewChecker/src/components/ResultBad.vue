<template>
  <tr>
    <td class="status">
      <div class="">
        <i class="fa fa-check-circle good" aria-hidden="true"></i>
      </div>
    </td>
    <td class="ip">
      <h6>{{ns}}</h6>
      <p>{{name}}</p>
      <div class="for-mobile">
        <p>Resolutions</p>
        <p v-for="(address, index) in addresses" v-bind:key="index">{{address}}</p>
      </div>
    </td>
    <td>
      <span class="for-desktop">{{country}}</span>
      <span class="for-mobile">SK</span>
    </td>
    <td>{{timestamp}}</td>
    <td class="for-desktop">203.225.632.223</td>
  </tr>
</template>

<script>
// import * as countries from "i18n-iso-countries";

// const countries = require("i18n-iso-countries");

export default {
  name: 'result-bad',
  props: ['name', 'ns', 'country', 'addresses', 'timestamp']
}
</script>
<!--<style scoped lang="scss">
  @import "FrontEnd.scss";
</style>-->
<!--<style scoped>
  small{
    font-size: 12px;
    font-weight: 200;
  }
  </style>-->

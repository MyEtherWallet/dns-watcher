<template>
  <tr v-show="shoulddisplay">
    <td v-if="good" class="status"><i class="fa fa-check" aria-hidden="true"></i></td>
    <td v-if="bad" class="status"><i class="fa fa-times" aria-hidden="true"></i></td>
    <td>{{ip.ns}} <small v-if="ip.name"><br><em >{{ip.name}}</em></small></td>
    <td>{{ip.country}}</td>
    <td>{{timestamp}}</td>
    <!--<td>{{index}}</td>-->
  </tr>
</template>

<script>
  // import * as countries from "i18n-iso-countries";

  const countries = require("i18n-iso-countries");

  export default {
    name: "dns-display-bad",
    props: ["detailedfilter", "sort", "status", "ip", "timestamp", "index"],
    computed: {
      shoulddisplay: function () {
        let binaryDisplay = this.sort;
        if (this.detailedfilter == "" && binaryDisplay) {
          return binaryDisplay;
        } else {
          if (this.detailedfilter == this.ip.country) {
            return true;
          } else {
            return false;
          }
        }
      },
      good: function () {
        return +this.status == 1;
      },
      bad: function () {
        return +this.status == 0;
      },
      // country: function(){
      //   let loc = countries.getName(this.ip.country, "en");
      //   console.log(loc); //todo remove dev item
      //    return loc;
      // }
    }
  }
</script>


<style scoped>
  small{
    font-size: 12px;
    font-weight: 200;
  }
  </style>

<template>
  <tr v-show="shoulddisplay">
    <td v-if="good" class="status"><i class="fa fa-check" aria-hidden="true"></i></td>
    <td v-if="bad" class="status"><i class="fa fa-times" aria-hidden="true"></i></td>
    <td>{{ip.ns}} <em v-if="ip.name"><small>  <br> name: {{ip.name}}</small></em></td>
    <td>{{country}}</td>
    <td>{{timestamp}}</td>
    <!--<td>{{index}}</td>-->
  </tr>
</template>

<script>
  import * as countries from "i18n-iso-countries";

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
      country: function(){
         return countries.getName(this.ip.country, "en");
      }
    }
  }
</script>

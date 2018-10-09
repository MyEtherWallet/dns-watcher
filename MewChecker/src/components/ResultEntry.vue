<template>
    <tr>
        <td class="status">
            <div class="">
                <i v-bind:class="[fa, addresses ? badIcon : goodIcon , addresses ? bad : good]" aria-hidden="true"></i>
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
            <span class="for-mobile">{{countryShort}}</span>
        </td>
        <td>{{timestamp}}</td>
        <td class="for-desktop"><p v-for="(address, index) in addresses" v-bind:key="index">{{address}} <img :src="hostName + '/badResolutions/' + address + '-480x320.png'" height="75px" width="150px"/></p></td>
    </tr>
</template>

<script>
  export default {
    name: "result-entry",
    props: ['name', 'ns', 'country','countryShort', 'addresses', 'timestamp', 'hostName'],
    data() {
        return {
          fa: "fa",
          good: "good",
          bad: "bad",
          goodIcon: "fa-check-circle",
          badIcon: "fa-times-circle",
          image: ''
        }
    },
  }
</script>

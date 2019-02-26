<template>
    <tr v-if="ns">
        <td class="status">
            <div class="">
                <i v-bind:class="['fa', status ? goodIcon : badIcon, status ? 'good' : 'bad']" aria-hidden="true"></i>
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
        <td>{{prettyDate}}</td>
        <td class="for-desktop">
          <p 
            v-for="(address, index) in addresses" 
            v-bind:key="index">
              <i>{{address}}</i>
              <img
                v-if="!status"
                :src="imgSrc[index]" 
                @error="noImg(address)"
                height="100px" 
                width="150px"/>
          </p>
        </td>
    </tr>
</template>

<script>
  const moment = require('moment')

  export default {
    name: "result-entry",
    props: ['name', 'ns', 'status', 'country','countryShort', 'addresses', 'timestamp', 'hostName'],
    data() {
        return {
          fa: "fa",
          good: "good",
          bad: "bad",
          goodIcon: "fa-check-circle",
          badIcon: "fa-times-circle",
          images: {}
        }
    },
    computed: {
      prettyDate() {
        return moment(this.timestamp).format('lll')
      },
      imgSrc() {
        let self = this
        return this.addresses.map(address => {
          return self.images[address]
        })
      }
    },
    methods: {
      noImg(address) {
        this.images[address] = this.hostName + '/ScreenShotFailed-Placeholder-480x320.png'
      }
    },
    created() {
      if (!this.addresses) return
      this.addresses.forEach(address => {
        this.images[address] = this.hostName + '/screenshots/' + address + '.png'
      })
    }
  }
</script>

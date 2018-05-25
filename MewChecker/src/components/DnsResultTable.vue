<template>
    <!--<div ref="resultsTable">-->
        <table>
            <thead>
            <tr>
                <td class="status">Status</td>
                <td>DNS Server</td>
                <td>Location</td>
                <td>Last Checked</td>
                <td class="for-desktop">Resolutions</td>
            </tr>
            </thead>
            <tbody>
            <result-entry v-for="ip in entriesDisplayed"
                        v-bind:key="ip.ns"
                        v-bind:name="ip.name"
                        v-bind:ns="ip.ns"
                        v-bind:addresses="ip.resolved"
                        v-bind:timestamp="timestamp"
                        v-bind:country="ip.country"
                        v-bind:country-short="ip.countryShort"></result-entry>
            </tbody>
        </table>
<!--        <div class="buttons-container">
            <div class="page-container">
                <div class="buttons flex-box-item-center">
                    <h3 class="button" v-on:click="navigatePagedEntries(0)">First</h3>
                    <h3 class="button" v-on:click="navigatePagedEntries(false)">Prior</h3>
                    <h3 class="button">{{currentPage + 1}} of {{paged.length}}</h3>
                    <h3 class="button" v-on:click="navigatePagedEntries(true)">Next</h3>
                    <h3 class="button" v-on:click="navigatePagedEntries(paged.length - 1)">Last</h3>
                </div>
            </div>
        </div>
    </div>-->
</template>

<script>
  import ResultEntry from './ResultEntry.vue'

  const request = require('request-promise-native')

  export default {
    name: 'dns-result-table',
    props: ["currentFilter"],
    data: function () {
      return {
        displayBad: true,
        displayGood: true,
        displayList: false,
        good: [],
        bad: [],
        entries: [],
        entriesDisplayed: [],
        timestamp: '',
        updateChecker: '',
        updateCheckerStarted: false,
        paged: [],
        entriesPerPage: 500,
        currentPage: 0
      }
    },
    watch:{
      currentFilter: {
        handler: function(newVal, oldVal){
          if(newVal !== oldVal){
            // let createGroupedArray = (arr, chunkSize) => { // for pagination
            //   var groups = [], i;
            //   for (i = 0; i < arr.length; i += chunkSize) {
            //     groups.push(arr.slice(i, i + chunkSize));
            //   }
            //   return groups;
            // }
            // let splitEntriesIntoPages = (items) => { // for pagination
            //   let pagedEntries = createGroupedArray(items, this.entriesPerPage)
            //   this.paged.splice(0, this.paged.length, ...pagedEntries)
            //   this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.paged[0])
            //   this.currentPage = 0
            // }
            switch(newVal){
              case 2:
                // splitEntriesIntoPages(this.entries)// for pagination
                this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.entries)

                // this.$forceUpdate()
                break;
              case 3:
                // splitEntriesIntoPages(this.bad)// for pagination
                this.$nextTick(() =>{
                  this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.bad)
                })
                // this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.bad)
                // this.$forceUpdate()
                break;
              case 4:
                // splitEntriesIntoPages(this.good)// for pagination
                this.$nextTick(() =>{
                  this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.good)
                })
                // this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.good)
                // this.$forceUpdate()
                break;
            }
          }

        },
        immediate: true
      }
    },
    methods: {
      // navigatePagedEntries(forward){ // for pagination
      //   if(typeof forward === 'number'){
      //     this.currentPage = forward;
      //     this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.paged[this.currentPage])
      //   } else {
      //     if(forward){
      //       if((this.paged.length -1) > (this.currentPage + 1)){
      //         this.currentPage += 1
      //         this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.paged[this.currentPage])
      //       }
      //     } else {
      //       if(0 > (this.currentPage - 1)){
      //         this.currentPage -= 1
      //         this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.paged[this.currentPage])
      //       }
      //     }
      //   }
      // },
      // createGroupedArray(arr, chunkSize) { // for pagination
      //   var groups = [], i;
      //   for (i = 0; i < arr.length; i += chunkSize) {
      //     groups.push(arr.slice(i, i + chunkSize));
      //   }
      //   return groups;
      // },
      getDnsResults() {
        request(window.location.origin + '/dns-report')
          .then((result) => {
            try {
              let json = JSON.parse(result)
              let allItems = [...json.bad, ...json.good]
              this.entries.splice(0, this.entries.length, ...allItems)
              // this.splitEntriesIntoPages(allItems) // for pagination
              this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.entries)
              this.good.splice(0, this.good.length, ...json.good);
              this.bad.splice(0, this.bad.length, ...json.bad);
              this.timestamp = json.timestamp
            } catch (e) {
              console.error(e)
            }
          })
      },
      // splitEntriesIntoPages(items){ // for pagination
      //   let pagedEntries = this.createGroupedArray(items, this.entriesPerPage)
      //   this.paged.splice(0, this.paged.length, ...pagedEntries)
      //   this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.paged[0])
      //   this.currentPage = 0
      // },
      checkForResultUpdate() {
        this.updateChecker = setInterval(() => {
          request(window.location.origin + '/new-results')
            .then(JSON.parse)
            .then((result) => {
              try {
                let displayedList = Date.parse(this.timestamp)
                let currentList = Date.parse(result.timestamp)
                console.log('displayedList', displayedList) // todo remove dev item
                console.log('currentList', currentList) // todo remove dev item
                if (+currentList > +displayedList) {
                  this.getDnsResults()
                }
                console.log(result) // todo remove dev item
                console.log('can update check', result.timestamp)
              } catch (e) {
                console.error(e)
              }
            })
            .catch(error => {
              console.error(error)
              console.error('FAILED TO CONNECT TO SERVER. WILL RETRY IN 1 MINUTE')
              clearInterval(this.updateChecker)
              setTimeout(() => {
                this.checkForResultUpdate()
              }, 60000) // retry after a minute
            })
        }, 10000)
      }
    },

    created() {
      this.checkForResultUpdate()
      // this.getDnsResults();
    },
    beforeCreate() {
      // let createGroupedArray = function(arr, chunkSize) { // for pagination
      //   var groups = [], i;
      //   for (i = 0; i < arr.length; i += chunkSize) {
      //     groups.push(arr.slice(i, i + chunkSize));
      //   }
      //   return groups;
      // }

      request(window.location.origin + '/dns-report')
        .then((result) => {
          try {
            let json = JSON.parse(result)
            let allItems = [...json.bad, ...json.good]
            this.entries.splice(0, this.entries.length, ...allItems)
            // let pagedEntries = createGroupedArray(this.entries, this.entriesPerPage) // for pagination
            // this.paged.splice(0, this.paged.length, ...pagedEntries) // for pagination
            // this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.paged[0]) // for pagination
            this.entriesDisplayed.splice(0, this.entriesDisplayed.length, ...this.entries)
            this.good.splice(0, this.good.length, ...json.good);
            this.bad.splice(0, this.bad.length, ...json.bad);
            this.timestamp = json.timestamp
          } catch (e) {
            console.error(e)
          }
        })



    },
    components: {
      // 'result-good': ResultGood,
      // 'result-bad': ResultBad
      "result-entry": ResultEntry
    }
  }
</script>

<!--<style scoped lang="scss">
  @import "FrontEnd.scss";
</style>-->
<!--<style scoped>

</style>-->

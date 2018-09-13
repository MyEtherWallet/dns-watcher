<template>
    <!--<div ref="resultsTable">-->
    <div>
      <div class="pagination-buttons-container" >
        <div class="page-container">
          <div class="buttons flex-box-item-center">
            <h4 class="button" @click="goToPage(--pageNum)"><i class="fa fa-arrow-left" aria-hidden="true"></i> Go to previous page</h4>
            <h4 class="button" @click="goToPage(++pageNum)">Go to next page <i class="fa fa-arrow-right" aria-hidden="true"></i></h4>
          </div>
        </div>
      </div>
        <paginate ref="paginator" name="allEntries" :list="entries" :per="50">
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
                    <result-entry v-for="ip in paginated('allEntries')" :key="ip.ns" :name="ip.name" :ns="ip.ns" :addresses="ip.resolved" :timestamp="timestamp" :country="ip.country" :country-short="ip.countryShort"></result-entry>
                </tbody>
            </table>
        </paginate>
    </div>
</template>
<script>
import ResultEntry from './ResultEntry.vue'

const request = require('request-promise-native')

export default {
    name: 'dns-result-table',
    props: ["currentFilter"],
    data: function() {
        return {
            good: [],
            bad: [],
            entries: [],
            all: [],
            timestamp: '',
            updateChecker: '',
            paginate: ["allEntries"],
            pageNum: 1
        }
    },
    watch: {
        currentFilter: function(newVal) {
            if (newVal == 3) this.entries = this.bad
            else if (newVal == 4) this.entries = this.good
            else this.entries = this.all
            this.goToPage(1)
            this.pageNum = 1
        }
    },
    methods: {
        goToPage(_pnum) {
            if (this.$refs.paginator && _pnum > 0 && _pnum <= this.$refs.paginator.lastPage) {
                this.$refs.paginator.goToPage(_pnum)
            }
            if (_pnum < 1) this.pageNum = 1
            if (_pnum > this.$refs.paginator.lastPage) this.pageNum = this.$refs.paginator.lastPage
        },
        getDnsResults() {
            request(window.location.origin + '/dns-report')
                .then((result) => {
                    try {
                        let json = JSON.parse(result)
                        let allItems = [...json.bad, ...json.good]
                        this.all = allItems
                        if(this.entries.length==0) this.entries = this.all
                        this.good.splice(0, this.good.length, ...json.good);
                        this.bad.splice(0, this.bad.length, ...json.bad);
                        this.timestamp = json.timestamp
                        console.log("done")
                    } catch (e) {
                        console.error(e)
                    }
                })
        },
        checkForResultUpdate() {
            this.updateChecker = setInterval(() => {
                request(window.location.origin + '/new-results')
                    .then(JSON.parse)
                    .then((result) => {
                        try {
                            let displayedList = Date.parse(this.timestamp)
                            let currentList = Date.parse(result.timestamp)
                            if (+currentList > +displayedList) {
                                this.getDnsResults()
                            }
                        } catch (e) {
                            console.error(e)
                        }
                    })
                    .catch(error => {
                        console.log(error)
                        clearInterval(this.updateChecker)
                        setTimeout(() => {
                                this.checkForResultUpdate()
                            }, 60000) // retry after a minute
                    })
            }, 10000)
        }
    },
    created() {
        this.getDnsResults()
        this.checkForResultUpdate()
    },
    beforeCreate() {},
    components: {
        "result-entry": ResultEntry
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "Pagination.scss";
</style>

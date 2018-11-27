<template>
    <div>
      <div class="pagination-buttons-container" >
        <div class="page-container">
          <div class="buttons flex-box-item-center">
            <h4 class="button" v-if="pageNum != 1" @click="goToPage(--pageNum)"><i class="fa fa-arrow-left" aria-hidden="true"></i>&nbsp;&nbsp;PREV</h4>
            <div v-else></div>
            <h4 class="button" v-if="pageNum < maxPages" @click="goToPage(++pageNum)">NEXT&nbsp;&nbsp;<i class="fa fa-arrow-right" aria-hidden="true"></i></h4>
          </div>
        </div>
      </div>
        <paginate ref="paginator" name="allEntries" :list="entries" :per="resultsPerPage">
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
                    <result-entry 
                        v-for="ip in paginated('allEntries')" 
                        :key="ip.ns" 
                        :status="ip.status" 
                        :name="ip.name" 
                        :ns="ip.ns"
                        :addresses="ip.resolved" 
                        :timestamp="ip.timestamp" 
                        :country="ip.country" 
                        :country-short="ip.countryShort" 
                        :host-name="hostName">
                    </result-entry>
                </tbody>
            </table>
        </paginate>
    </div>
</template>
<script>
import ResultEntry from './ResultEntry.vue'

const request = require('request-promise-native')
const _ = require('underscore')

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
            hostName: window.location.origin,
            updateChecker: '',
            paginate: ["allEntries"],
            pageNum: 1,
            resultsPerPage: 50
        }
    },
    computed: {
        maxPages() {
            return Math.ceil(this.entries.length / this.resultsPerPage)
        }
    },
    watch: {
        currentFilter: function(newVal) {
            console.log(newVal)
            if (newVal == 2) this.entries = this.all
            else if (newVal == 3) this.entries = this.bad
            else this.entries = this.good
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
                        let sorted = _.groupBy(json, 'status')
                        this.good = sorted.true
                        this.bad = sorted.false
                        this.all = [...this.bad, ...this.good]
                        this.entries = this.all
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
        // this.checkForResultUpdate()
    },
    beforeCreate() {},
    components: {
        "result-entry": ResultEntry
    }
}
</script>

<style lang="scss" scoped>
  @import "Pagination.scss";
</style>

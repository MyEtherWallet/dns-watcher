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
        <paginate ref="paginator" name="entries" :list="entries" :per="resultsPerPage">
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
                        v-for="ip in paginated('entries')" 
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
            paginate: ["entries"],
            pageNum: 1,
            resultsPerPage: 50
        }
    },
    computed: {
        maxPages() {
            return Math.ceil(this.entries.length / this.resultsPerPage)
        },
        emptyEntries () {
            return this.entries.length == 0
        }
    },
    watch: {
        currentFilter: function(newVal) {
            if (newVal == 2) this.entries = this.all
            else if (newVal == 3) this.entries = this.bad
            else this.entries = this.good
            this.entries = this.entries.slice(0)
            this.goToPage(1)
            this.pageNum = 1
        },
        // See: https://stackoverflow.com/questions/50632923/vue-vue-paginate-array-will-not-refresh-once-empty 
        emptyEntries: function(newVal, oldVal) {
          if ( newVal === false && oldVal === true ) {
            setTimeout(() => {
              if (this.$refs.paginator) {
                this.$refs.paginator.goToPage(this.pageNum)
              }
            }, 50)
          }
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
                    this.good = sorted.true || []
                    this.bad = sorted.false || []
                    this.all = [...this.bad, ...this.good]
                    this.entries = this.all
                } catch (e) {
                    console.error(e)
                }
              })
        }
    },
    created() {
        this.getDnsResults()
        setInterval(this.getDnsResults, 60 * 1000)
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

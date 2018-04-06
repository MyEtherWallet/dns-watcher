<template>
  <div class="dns-watcher">

    <div class="wrapper">
      <header>
        <img src="~@/assets/mew-logo.png">
        <h1 class="title">DNS Watcher</h1>
        <h5 class="">status.myetherwallet.com</h5>
        
      </header>

      <div class="status">
        <h1 class="validation valid hidden"><i class="fa fa-check" aria-hidden="true"></i> Valid</h1>
        <h1 class="validation invalid"><i class="fa fa-times" aria-hidden="true"></i> Error</h1>
      </div>

      <div class="status-buttons">
        <button>Errors</button>
        <button>Valid</button>
      </div>

      <div class="table-data">
        <table>
          <tbody>
            <tr>
              <td>X</td>
              <td>192.168.1.200</td>
              <td>192.168.1.200</td>
              <td>2018-02-12 12:12:18</td>
            </tr>
            <tr>
              <td>X</td>
              <td>192.168.1.200</td>
              <td>192.168.1.200</td>
              <td>2018-02-12 12:12:18</td>
            </tr>
            <tr>
              <td>X</td>
              <td>192.168.1.200</td>
              <td>192.168.1.200</td>
              <td>2018-02-12 12:12:18</td>
            </tr>
            <tr>
              <td>X</td>
              <td>192.168.1.200</td>
              <td>192.168.1.200</td>
              <td>2018-02-12 12:12:18</td>
            </tr>
            <tr>
              <td>X</td>
              <td>192.168.1.200</td>
              <td>192.168.1.200</td>
              <td>2018-02-12 12:12:18</td>
            </tr>

          </tbody>

        </table>
      </div>


    </div>

  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style lang="scss">
  @import 'style.scss';
</style>

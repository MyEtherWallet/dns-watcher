<template>
  <div class="home">
    <FrontEnd/>
  </div>
</template>

<script>
// @ is an alias to /src
import FrontEnd from '@/components/FrontEnd.vue'

export default {
  name: 'home',
  components: {
    FrontEnd
  }
}
</script>

<template>
  <div id="app">
    <SearchForm />
  </div>
</template>

<script>
import SearchForm from './components/SearchForm.vue'

export default {
  name: 'App',
  components: {
    SearchForm
  }
}
</script>

<style>
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
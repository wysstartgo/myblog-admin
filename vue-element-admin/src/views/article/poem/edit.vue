<template>
  <poem-detail :is-edit="true" />
</template>

<script>
import PoemDetail from '../components/PoemDetail'

export default {
  name: 'EditForm',
  components: { PoemDetail }
}
</script>


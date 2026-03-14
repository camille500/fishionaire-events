<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const accordionItems = computed(() =>
  props.items.map((item, index) => ({
    label: item.question,
    content: item.answer,
    value: String(index),
  }))
)
</script>

<template>
  <div class="accordion-group">
    <UAccordion :items="accordionItems" type="single" />
  </div>
</template>

<style scoped>
.accordion-group {
  max-width: var(--max-width-narrow);
  margin: 0 auto;
}
</style>

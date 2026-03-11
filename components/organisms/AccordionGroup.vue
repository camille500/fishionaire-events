<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const activeIndex = ref(-1)

const toggle = (index) => {
  activeIndex.value = activeIndex.value === index ? -1 : index
}
</script>

<template>
  <div class="accordion-group">
    <AccordionItem
      v-for="(item, index) in items"
      :key="index"
      :question="item.question"
      :answer="item.answer"
      :open="activeIndex === index"
      @toggle="toggle(index)"
    />
  </div>
</template>

<style scoped>
.accordion-group {
  max-width: var(--max-width-narrow);
  margin: 0 auto;
}
</style>

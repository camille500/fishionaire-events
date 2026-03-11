<script setup>
defineProps({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <div class="accordion-item" :class="{ 'accordion-item--open': open }">
    <button class="accordion-item__trigger" @click="emit('toggle')">
      <span class="accordion-item__question">{{ question }}</span>
      <AppIcon name="chevron-down" size="sm" class="accordion-item__icon" />
    </button>
    <div class="accordion-item__content">
      <div class="accordion-item__inner">
        <AppText size="sm">{{ answer }}</AppText>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-item {
  border-bottom: 1px solid var(--color-border);
}

.accordion-item__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-6) 0;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
}

.accordion-item__question {
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.accordion-item__icon {
  transition: transform var(--transition-base);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.accordion-item--open .accordion-item__icon {
  transform: rotate(180deg);
}

.accordion-item__content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--transition-base);
}

.accordion-item--open .accordion-item__content {
  grid-template-rows: 1fr;
}

.accordion-item__inner {
  overflow: hidden;
}

.accordion-item--open .accordion-item__inner {
  padding-bottom: var(--space-6);
}
</style>

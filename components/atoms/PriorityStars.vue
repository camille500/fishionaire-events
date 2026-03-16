<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  max: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits(['update:modelValue'])

function setRating(value) {
  if (props.readonly) return
  emit('update:modelValue', value === props.modelValue ? 0 : value)
}
</script>

<template>
  <div class="priority-stars" :class="{ 'priority-stars--readonly': readonly }">
    <button
      v-for="i in max"
      :key="i"
      type="button"
      class="priority-stars__star"
      :class="{ 'priority-stars__star--active': i <= modelValue }"
      :disabled="readonly"
      @click="setRating(i)"
    >
      <Icon :name="i <= modelValue ? 'lucide:star' : 'lucide:star'" />
    </button>
  </div>
</template>

<style scoped>
.priority-stars {
  display: inline-flex;
  gap: 2px;
}

.priority-stars__star {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: color-mix(in srgb, var(--color-text-primary) 20%, transparent);
  transition: color var(--transition-fast);
  font-size: 16px;
  line-height: 1;
}

.priority-stars__star--active {
  color: var(--color-accent-gold);
}

.priority-stars__star:hover:not(:disabled) {
  color: var(--color-accent-gold);
}

.priority-stars--readonly .priority-stars__star {
  cursor: default;
}
</style>

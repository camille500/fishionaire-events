<script setup>
const { getType, getLabel } = useSubEventTypes()

const props = defineProps({
  type: {
    type: String,
    default: 'generic',
  },
})

const typeConfig = computed(() => getType(props.type))
</script>

<template>
  <span
    class="sub-event-type-badge"
    :style="{
      background: typeConfig.bgColor,
      color: typeConfig.color,
      borderColor: typeConfig.borderColor,
    }"
  >
    <Icon :name="typeConfig.icon" :size="10" />
    {{ getLabel(type) }}
  </span>
</template>

<style scoped>
.sub-event-type-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  border: 1px solid;
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
}
</style>

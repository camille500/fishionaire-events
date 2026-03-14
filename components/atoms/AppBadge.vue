<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'accent', 'success'].includes(v),
  },
})

const variantMap = {
  default: { color: 'neutral', variant: 'soft' },
  accent: { color: 'error', variant: 'solid' },
  success: { color: 'success', variant: 'solid' },
}

const badgeProps = computed(() => variantMap[props.variant] || variantMap.default)
</script>

<template>
  <UBadge
    :label="label"
    :color="badgeProps.color"
    :variant="badgeProps.variant"
    size="sm"
    class="app-badge"
  />
</template>

<style scoped>
.app-badge {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-full);
}
</style>

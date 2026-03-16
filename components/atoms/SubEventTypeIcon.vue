<script setup>
const { getType } = useSubEventTypes()

const props = defineProps({
  type: {
    type: String,
    default: 'generic',
  },
  size: {
    type: String,
    default: 'sm',
  },
})

const typeConfig = computed(() => getType(props.type))

const sizeMap = {
  xs: { wrapper: '20px', icon: 10 },
  sm: { wrapper: '28px', icon: 14 },
  md: { wrapper: '36px', icon: 18 },
  lg: { wrapper: '44px', icon: 22 },
}

const dimensions = computed(() => sizeMap[props.size] || sizeMap.sm)
</script>

<template>
  <span
    class="sub-event-type-icon"
    :style="{
      background: typeConfig.bgColor,
      borderColor: typeConfig.borderColor,
      width: dimensions.wrapper,
      height: dimensions.wrapper,
    }"
  >
    <Icon :name="typeConfig.icon" :size="dimensions.icon" :style="{ color: typeConfig.color }" />
  </span>
</template>

<style scoped>
.sub-event-type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 1px solid;
  flex-shrink: 0;
}
</style>

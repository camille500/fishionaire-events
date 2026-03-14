<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost', 'gradient'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  to: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const buttonProps = computed(() => {
  const map = {
    primary: { color: 'primary', variant: 'solid' },
    secondary: { color: 'secondary', variant: 'solid' },
    outline: { color: 'neutral', variant: 'outline' },
    ghost: { color: 'neutral', variant: 'ghost' },
    gradient: { color: 'primary', variant: 'solid' },
  }
  return map[props.variant] || map.primary
})
</script>

<template>
  <UButton
    :color="buttonProps.color"
    :variant="buttonProps.variant"
    :size="size"
    :to="to || undefined"
    :loading="loading"
    :disabled="disabled"
    :leading-icon="icon || undefined"
    :class="[
      'app-button',
      { 'app-button--gradient': variant === 'gradient' },
    ]"
  >
    <slot />
  </UButton>
</template>

<style scoped>
.app-button {
  transition: all 0.3s ease;
  border-radius: var(--radius-md) !important;
  position: relative;
  overflow: hidden;
}

.app-button:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-accent);
}

.app-button:active {
  transform: translateY(0) scale(0.98);
  transition-duration: 100ms;
}

.app-button--gradient {
  background: var(--gradient-accent) !important;
  border-color: transparent !important;
  background-size: 200% auto;
  color: #fff !important;
}

.app-button--gradient:hover {
  background-position: right center;
  box-shadow: var(--shadow-accent-lg);
}

.app-button--gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.app-button--gradient:hover::before {
  opacity: 1;
  animation: shimmer-btn 1.5s ease infinite;
}
</style>

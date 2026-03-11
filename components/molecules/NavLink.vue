<script setup>
const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const isActive = computed(() => route.path === props.to || route.path.startsWith(props.to + '/'))
</script>

<template>
  <NuxtLink :to="to" class="nav-link" :class="{ 'nav-link--active': isActive }">
    {{ label }}
  </NuxtLink>
</template>

<style scoped>
.nav-link {
  position: relative;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  padding: var(--space-2) 0;
  transition: color var(--transition-fast);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--color-accent);
  transition: width var(--transition-base);
  border-radius: var(--radius-full);
}

.nav-link:hover {
  color: var(--color-text-primary);
}

.nav-link:hover::after,
.nav-link--active::after {
  width: 100%;
}

.nav-link--active {
  color: var(--color-text-primary);
}
</style>

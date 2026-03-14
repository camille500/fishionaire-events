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
  color: rgba(244, 244, 246, 0.65);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--space-2) 0;
  transition: color 0.2s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-accent);
  transition: width 0.3s ease;
  border-radius: var(--radius-full);
}

.nav-link:hover {
  color: #f4f4f6;
}

.nav-link:hover::after,
.nav-link--active::after {
  width: 100%;
}

.nav-link--active {
  color: #f4f4f6;
}
</style>

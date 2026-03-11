<script setup>
const props = defineProps({
  src: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
})

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const colorIndex = computed(() => {
  let hash = 0
  for (const char of props.name) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 6
})

const colors = [
  '#ff6b6b', '#9b59b6', '#2196f3',
  '#4caf50', '#ff9800', '#e91e63',
]
</script>

<template>
  <div :class="['avatar', `avatar--${size}`]">
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="avatar__image"
    />
    <span
      v-else
      class="avatar__initials"
      :style="{ backgroundColor: colors[colorIndex] }"
    >
      {{ initials }}
    </span>
  </div>
</template>

<style scoped>
.avatar {
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar--sm { width: 32px; height: 32px; font-size: var(--text-xs); }
.avatar--md { width: 40px; height: 40px; font-size: var(--text-sm); }
.avatar--lg { width: 56px; height: 56px; font-size: var(--text-lg); }

.avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar__initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.02em;
}
</style>

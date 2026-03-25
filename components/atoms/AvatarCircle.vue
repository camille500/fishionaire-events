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
    validator: (v) => ['sm', 'md', 'lg', 'xl', '2xl'].includes(v),
  },
  ring: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: null,
    validator: (v) => v === null || ['online', 'away', 'busy'].includes(v),
  },
  interactive: {
    type: Boolean,
    default: false,
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
  <div :class="['avatar', `avatar--${size}`, { 'avatar--ring': ring, 'avatar--interactive': interactive }]">
    <div class="avatar__inner">
      <img
        v-if="src"
        :src="src"
        :alt="name"
        class="avatar__image"
        loading="lazy"
      />
      <span
        v-else
        class="avatar__initials"
        :style="{ backgroundColor: colors[colorIndex] }"
      >
        {{ initials }}
      </span>
    </div>
    <span
      v-if="status"
      :class="['avatar__status', `avatar__status--${status}`]"
    />
  </div>
</template>

<style scoped>
.avatar {
  position: relative;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.avatar--interactive {
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.avatar--interactive:hover {
  transform: scale(1.04);
}

.avatar--ring {
  padding: 2px;
  background: var(--gradient-accent);
}

.avatar--ring .avatar__inner {
  border: 2px solid var(--color-background);
}

.avatar__inner {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar--sm { width: 32px; height: 32px; font-size: var(--text-xs); }
.avatar--md { width: 40px; height: 40px; font-size: var(--text-sm); }
.avatar--lg { width: 56px; height: 56px; font-size: var(--text-lg); }
.avatar--xl { width: 64px; height: 64px; font-size: var(--text-xl); }
.avatar--2xl { width: 96px; height: 96px; font-size: var(--text-2xl); }

.avatar--ring.avatar--sm { width: 36px; height: 36px; }
.avatar--ring.avatar--md { width: 44px; height: 44px; }
.avatar--ring.avatar--lg { width: 60px; height: 60px; }
.avatar--ring.avatar--xl { width: 68px; height: 68px; }
.avatar--ring.avatar--2xl { width: 100px; height: 100px; }

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

.avatar__status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-background);
}

.avatar--lg .avatar__status,
.avatar--xl .avatar__status,
.avatar--2xl .avatar__status {
  width: 12px;
  height: 12px;
  border-width: 2px;
}

.avatar--2xl .avatar__status {
  width: 16px;
  height: 16px;
  border-width: 3px;
}

.avatar__status--online {
  background: #22c55e;
}

.avatar__status--away {
  background: #f59e0b;
}

.avatar__status--busy {
  background: var(--color-error);
}
</style>

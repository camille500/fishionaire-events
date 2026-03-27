<script setup>
const props = defineProps({
  sections: {
    type: Array,
    required: true,
    // [{ id: string, label: string, icon: string }]
  },
})

const activeSection = ref(null)
const navRef = ref(null)
let observer = null

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
  )

  // Observe each section element
  for (const section of props.sections) {
    const el = document.getElementById(section.id)
    if (el) observer.observe(el)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

function scrollTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Auto-scroll active pill into view
watch(activeSection, () => {
  nextTick(() => {
    const activePill = navRef.value?.querySelector('.section-nav__pill--active')
    if (activePill) {
      activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  })
})
</script>

<template>
  <nav v-if="sections.length > 1" ref="navRef" class="section-nav">
    <div class="section-nav__track">
      <button
        v-for="section in sections"
        :key="section.id"
        class="section-nav__pill"
        :class="{ 'section-nav__pill--active': activeSection === section.id }"
        @click="scrollTo(section.id)"
      >
        <Icon :name="section.icon" size="14" />
        <span>{{ section.label }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.section-nav {
  flex: 1;
  min-width: 0;
}

.section-nav__track {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: none;
  max-width: 720px;
  margin: 0 auto;
}

.section-nav__track::-webkit-scrollbar {
  display: none;
}

.section-nav__pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 36px;
}

.section-nav__pill:hover {
  border-color: var(--event-accent, var(--color-accent));
  color: var(--event-accent, var(--color-accent));
}

.section-nav__pill--active {
  background: var(--event-accent, var(--color-accent));
  border-color: var(--event-accent, var(--color-accent));
  color: #fff;
}

@media (max-width: 640px) {
  .section-nav__pill {
    min-height: 44px;
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
  }
}
</style>

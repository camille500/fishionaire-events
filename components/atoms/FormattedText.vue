<script setup>
defineProps({
  text: { type: String, default: '' },
  tag: { type: String, default: 'div' },
})

function formatText(raw) {
  if (!raw) return ''
  // Escape HTML to prevent XSS
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Basic markdown: **bold**, *italic*, [link](url)
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <component :is="tag" class="formatted-text" v-html="formatText(text)" />
</template>

<style scoped>
.formatted-text {
  white-space: pre-line;
}

.formatted-text :deep(a) {
  color: var(--event-accent, var(--color-accent));
  text-decoration: underline;
  text-underline-offset: 2px;
}

.formatted-text :deep(a:hover) {
  opacity: 0.8;
}

.formatted-text :deep(strong) {
  font-weight: var(--font-weight-semibold);
}
</style>

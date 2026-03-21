<script setup>
defineProps({
  links: {
    type: Object,
    default: () => ({}),
  },
})

function instagramUrl(handle) {
  if (!handle) return null
  if (handle.startsWith('http')) return handle
  return `https://instagram.com/${handle.replace('@', '')}`
}

function twitterUrl(handle) {
  if (!handle) return null
  if (handle.startsWith('http')) return handle
  return `https://x.com/${handle.replace('@', '')}`
}

function linkedinUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `https://linkedin.com/in/${url}`
}

function websiteUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `https://${url}`
}
</script>

<template>
  <div class="social-links">
    <a
      v-if="links.instagram"
      :href="instagramUrl(links.instagram)"
      target="_blank"
      rel="noopener noreferrer"
      class="social-links__item"
    >
      <Icon name="lucide:instagram" size="18" />
    </a>
    <a
      v-if="links.twitter"
      :href="twitterUrl(links.twitter)"
      target="_blank"
      rel="noopener noreferrer"
      class="social-links__item"
    >
      <Icon name="lucide:twitter" size="18" />
    </a>
    <a
      v-if="links.linkedin"
      :href="linkedinUrl(links.linkedin)"
      target="_blank"
      rel="noopener noreferrer"
      class="social-links__item"
    >
      <Icon name="lucide:linkedin" size="18" />
    </a>
    <a
      v-if="links.website"
      :href="websiteUrl(links.website)"
      target="_blank"
      rel="noopener noreferrer"
      class="social-links__item"
    >
      <Icon name="lucide:globe" size="18" />
    </a>
  </div>
</template>

<style scoped>
.social-links {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.social-links__item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.social-links__item:hover {
  background: var(--color-accent-bg);
  color: var(--color-accent);
}
</style>

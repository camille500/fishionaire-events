<script setup>
const { t } = useI18n()

const props = defineProps({
  token: {
    type: String,
    required: true,
  },
  eventData: {
    type: Object,
    default: () => ({}),
  },
})

const { posts, loading, posting, fetchPosts, createPost, heartPost } = useGuestSocialWall(props.token)

const postSubmitted = ref(false)

onMounted(() => {
  fetchPosts()
})

async function handleSubmit({ content, file }) {
  const result = await createPost(content, file)
  postSubmitted.value = true
  setTimeout(() => { postSubmitted.value = false }, 3000)
}
</script>

<template>
  <div class="social-wall-guest">
    <SocialWallPostForm
      :posting="posting"
      @submit="handleSubmit"
    />

    <Transition name="fade">
      <div v-if="postSubmitted" class="social-wall-guest__success">
        <Icon name="lucide:check-circle" size="16" />
        {{ t('socialWall.postSubmitted') }}
      </div>
    </Transition>

    <div v-if="loading" class="social-wall-guest__loading">
      <Icon name="lucide:loader-2" size="24" class="social-wall-guest__spinner" />
    </div>

    <div v-else-if="posts.length === 0" class="social-wall-guest__empty">
      <Icon name="lucide:message-circle" size="28" class="social-wall-guest__empty-icon" />
      <AppText size="sm" muted>{{ t('socialWall.empty') }}</AppText>
    </div>

    <div v-else class="social-wall-guest__list">
      <SocialWallPostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @heart="heartPost"
      />
    </div>
  </div>
</template>

<style scoped>
.social-wall-guest {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.social-wall-guest__success {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-success, #27ae60) 10%, transparent);
  color: var(--color-success, #27ae60);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.social-wall-guest__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.social-wall-guest__spinner {
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.social-wall-guest__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8);
  text-align: center;
}

.social-wall-guest__empty-icon {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.social-wall-guest__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

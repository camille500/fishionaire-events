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

const toast = useToast()
const { posts, loading, posting, fetchPosts, createPost, heartPost } = useGuestSocialWall(props.token)

onMounted(() => {
  fetchPosts()
})

async function handleSubmit({ content, file }) {
  try {
    const result = await createPost(content, file)
    if (result.status === 'approved') {
      toast.add({ title: t('toast.socialWallPostApproved'), icon: 'i-lucide-check', color: 'green' })
    } else {
      toast.add({ title: t('toast.socialWallPostPending'), icon: 'i-lucide-clock', color: 'blue' })
    }
  } catch {
    toast.add({ title: t('toast.socialWallPostError'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}
</script>

<template>
  <div class="social-wall-guest">
    <SocialWallPostForm
      :posting="posting"
      @submit="handleSubmit"
    />

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

</style>

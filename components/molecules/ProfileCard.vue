<script setup>
defineProps({
  user: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div :class="['profile-card', { 'profile-card--compact': compact }]">
    <AvatarCircle
      :src="user.avatarUrl || user.imageUrl"
      :name="user.displayName || user.firstName || user.email || ''"
      :size="compact ? 'sm' : 'md'"
      ring
    />
    <div class="profile-card__info">
      <span class="profile-card__name">
        {{ user.displayName || user.firstName || user.email }}
      </span>
      <span v-if="!compact && user.bio" class="profile-card__bio">
        {{ user.bio.length > 80 ? user.bio.slice(0, 80) + '...' : user.bio }}
      </span>
      <ProfileSocialLinks
        v-if="!compact && (user.socialInstagram || user.socialTwitter || user.socialLinkedin || user.website)"
        :links="{
          instagram: user.socialInstagram,
          twitter: user.socialTwitter,
          linkedin: user.socialLinkedin,
          website: user.website,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  transition: background var(--transition-fast);
}

.profile-card:hover {
  background: var(--color-background);
}

.profile-card--compact {
  align-items: center;
  padding: var(--space-2);
}

.profile-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.profile-card__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-card__bio {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}
</style>

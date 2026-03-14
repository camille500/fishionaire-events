<script setup>
const { t } = useI18n()

defineProps({
  member: {
    type: Object,
    required: true,
  },
  canRemove: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['remove'])

function displayName(member) {
  if (member.user?.firstName) {
    return [member.user.firstName, member.user.lastName].filter(Boolean).join(' ')
  }
  return member.invitedEmail || member.user?.email || ''
}
</script>

<template>
  <div class="co-organizer-card">
    <div class="co-organizer-card__avatar">
      <Icon name="lucide:user" size="16" />
    </div>
    <div class="co-organizer-card__info">
      <span class="co-organizer-card__name">{{ displayName(member) }}</span>
      <span v-if="member.user?.email" class="co-organizer-card__email">{{ member.user.email }}</span>
    </div>
    <AppBadge :label="t(`dashboard.roles.${member.role}`)" :variant="member.role === 'owner' ? 'accent' : 'default'" />
    <AppButton
      v-if="canRemove && member.role !== 'owner'"
      variant="ghost"
      size="sm"
      @click="emit('remove', member)"
    >
      <Icon name="lucide:x" size="14" />
    </AppButton>
  </div>
</template>

<style scoped>
.co-organizer-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.co-organizer-card__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-background);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.co-organizer-card__info {
  flex: 1;
  min-width: 0;
}

.co-organizer-card__name {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.co-organizer-card__email {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>

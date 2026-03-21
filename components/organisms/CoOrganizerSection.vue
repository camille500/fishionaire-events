<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: Number,
    required: true,
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
})

const members = ref([])
const confirmRemoveMember = ref(null)

async function fetchMembers() {
  try {
    members.value = await $fetch(`/api/events/${props.eventId}/members`)
  } catch {
    // User may not have permission
  }
}

function onRemove(member) {
  confirmRemoveMember.value = member
}

async function doRemove() {
  if (!confirmRemoveMember.value) return
  const member = confirmRemoveMember.value
  confirmRemoveMember.value = null
  await $fetch(`/api/events/${props.eventId}/co-organizers/${member.userClerkId}`, {
    method: 'DELETE',
  })
  await fetchMembers()
}

onMounted(fetchMembers)
</script>

<template>
  <div class="co-org-section">
    <div class="co-org-section__header">
      <AppHeading :level="3" size="sm">{{ t('dashboard.eventEditor.coOrganizersSection') }}</AppHeading>
      <AppText size="sm" muted>{{ t('dashboard.eventEditor.coOrganizersSubtitle') }}</AppText>
    </div>

    <div class="co-org-section__list">
      <CoOrganizerCard
        v-for="member in members"
        :key="member.id"
        :member="member"
        :can-remove="isOwner"
        @remove="onRemove"
      />
    </div>

    <div v-if="members.length <= 1" class="co-org-section__empty">
      <AppText size="sm" muted>{{ t('dashboard.eventEditor.noCoOrganizers') }}</AppText>
    </div>

    <CoOrganizerInviteForm
      v-if="isOwner"
      :event-id="eventId"
      @invited="fetchMembers"
    />

    <ConfirmModal
      v-if="confirmRemoveMember"
      :title="t('dashboard.eventEditor.confirmRemoveCoOrganizer')"
      :message="confirmRemoveMember.invitedEmail || ''"
      variant="danger"
      @confirm="doRemove"
      @close="confirmRemoveMember = null"
    />
  </div>
</template>

<style scoped>
.co-org-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.co-org-section__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.co-org-section__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.co-org-section__empty {
  padding: var(--space-4);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
}
</style>

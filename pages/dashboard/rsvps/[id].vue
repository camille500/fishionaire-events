<script setup>
definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const { t } = useI18n()
const toast = useToast()

const rsvpId = route.params.id
const { data: rsvp, error, refresh } = await useFetch(`/api/rsvps/${rsvpId}`)

const activeTab = ref('poll')
const tabs = computed(() => [
  { key: 'poll', label: t('rsvp.tabs.poll'), icon: 'lucide:bar-chart-3' },
  { key: 'guests', label: t('rsvp.tabs.guests'), icon: 'lucide:users' },
  { key: 'settings', label: t('rsvp.tabs.settings'), icon: 'lucide:settings' },
])

// Share link
const config = useRuntimeConfig()
const shareUrl = computed(() => {
  if (!rsvp.value?.shareToken) return ''
  return `${config.public.appUrl}/rsvp/${rsvp.value.shareToken}`
})

const linkCopied = ref(false)
async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 2000)
  } catch {
    toast.add({ title: t('rsvp.copyError'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}

// Settings form
const editTitle = ref('')
const editDescription = ref('')
const editDeadline = ref('')
const saving = ref(false)

watch(rsvp, (val) => {
  if (val) {
    editTitle.value = val.title || ''
    editDescription.value = val.description || ''
    editDeadline.value = val.rsvpDeadline ? new Date(val.rsvpDeadline).toISOString().slice(0, 10) : ''
  }
}, { immediate: true })

async function saveSettings() {
  saving.value = true
  try {
    await $fetch(`/api/rsvps/${rsvpId.value}`, {
      method: 'PUT',
      body: {
        title: editTitle.value.trim(),
        description: editDescription.value.trim() || null,
        rsvpDeadline: editDeadline.value || null,
      },
    })
    toast.add({ title: t('rsvp.saved'), icon: 'i-lucide-check', color: 'green' })
    refresh()
  } catch (err) {
    toast.add({ title: err?.data?.statusMessage || t('rsvp.saveError'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="rsvp-manage">
    <!-- Header -->
    <div class="rsvp-manage__header">
      <div class="rsvp-manage__header-left">
        <NuxtLink to="/dashboard/rsvps" class="rsvp-manage__back">
          <Icon name="lucide:arrow-left" size="16" />
        </NuxtLink>
        <div>
          <h1 class="rsvp-manage__title">{{ rsvp?.title }}</h1>
          <div v-if="rsvp?.guestStats" class="rsvp-manage__stats">
            <span class="rsvp-manage__stat rsvp-manage__stat--total">
              <Icon name="lucide:users" size="13" />
              {{ rsvp.guestStats.total }}
            </span>
            <span class="rsvp-manage__stat rsvp-manage__stat--accepted">{{ rsvp.guestStats.accepted }} {{ t('rsvp.stats.accepted') }}</span>
            <span class="rsvp-manage__stat rsvp-manage__stat--declined">{{ rsvp.guestStats.declined }} {{ t('rsvp.stats.declined') }}</span>
            <span class="rsvp-manage__stat rsvp-manage__stat--pending">{{ rsvp.guestStats.pending }} {{ t('rsvp.stats.pending') }}</span>
          </div>
        </div>
      </div>

      <!-- Share link -->
      <div class="rsvp-manage__share">
        <div class="rsvp-manage__share-url">
          <Icon name="lucide:link" size="14" />
          <span class="rsvp-manage__share-text">{{ shareUrl }}</span>
        </div>
        <AppButton variant="outline" size="sm" @click="copyShareLink">
          <Icon :name="linkCopied ? 'lucide:check' : 'lucide:copy'" size="14" />
          {{ linkCopied ? t('rsvp.copied') : t('rsvp.copyLink') }}
        </AppButton>
      </div>
    </div>

    <!-- Tabs -->
    <div class="rsvp-manage__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['rsvp-manage__tab', { 'rsvp-manage__tab--active': activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <Icon :name="tab.icon" size="15" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab content -->
    <div class="rsvp-manage__content">
      <!-- Poll tab -->
      <div v-if="activeTab === 'poll'">
        <DatePollEditor
          v-if="rsvp?.id"
          :event-id="Number(rsvp.id)"
          :editable="true"
          @updated="refresh"
        />
      </div>

      <!-- Guests tab -->
      <div v-if="activeTab === 'guests'">
        <GuestManager
          v-if="rsvp?.id"
          :event-id="Number(rsvp.id)"
          :mode="'rsvp'"
        />
      </div>

      <!-- Settings tab -->
      <div v-if="activeTab === 'settings'" class="rsvp-manage__settings">
        <div class="rsvp-manage__field">
          <label class="rsvp-manage__label">{{ t('rsvp.form.title') }}</label>
          <input v-model="editTitle" type="text" class="rsvp-manage__input" maxlength="200" />
        </div>

        <div class="rsvp-manage__field">
          <label class="rsvp-manage__label">{{ t('rsvp.form.description') }}</label>
          <textarea v-model="editDescription" class="rsvp-manage__textarea" rows="3" maxlength="2000" />
        </div>

        <div class="rsvp-manage__field">
          <label class="rsvp-manage__label">{{ t('rsvp.form.deadline') }}</label>
          <input v-model="editDeadline" type="date" class="rsvp-manage__input" />
        </div>

        <div class="rsvp-manage__settings-actions">
          <AppButton variant="primary" size="md" :loading="saving" @click="saveSettings">
            <Icon name="lucide:save" size="14" />
            {{ t('rsvp.form.save') }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rsvp-manage {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.rsvp-manage__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.rsvp-manage__header-left {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.rsvp-manage__back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  text-decoration: none;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--transition-fast);
}

.rsvp-manage__back:hover {
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.rsvp-manage__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.rsvp-manage__stats {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-manage__stat {
  display: flex;
  align-items: center;
  gap: 3px;
}

.rsvp-manage__stat--accepted { color: var(--color-success); }
.rsvp-manage__stat--declined { color: var(--color-error); }
.rsvp-manage__stat--pending { color: var(--color-warning); }

/* Share */
.rsvp-manage__share {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
}

.rsvp-manage__share-url {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  max-width: 300px;
  overflow: hidden;
}

.rsvp-manage__share-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Tabs */
.rsvp-manage__tabs {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid var(--color-border-light);
}

.rsvp-manage__tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  background: none;
  font: inherit;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all var(--transition-fast);
}

.rsvp-manage__tab:hover {
  color: var(--color-text-primary);
}

.rsvp-manage__tab--active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

/* Settings */
.rsvp-manage__settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: 600px;
}

.rsvp-manage__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.rsvp-manage__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.rsvp-manage__input,
.rsvp-manage__textarea {
  padding: var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-family);
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
  transition: all var(--transition-fast);
}

.rsvp-manage__input:focus,
.rsvp-manage__textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
}

.rsvp-manage__textarea {
  resize: vertical;
  min-height: 80px;
}

.rsvp-manage__settings-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .rsvp-manage__header {
    flex-direction: column;
  }

  .rsvp-manage__share {
    width: 100%;
  }

  .rsvp-manage__share-url {
    max-width: none;
    flex: 1;
  }

  .rsvp-manage__tabs {
    overflow-x: auto;
  }
}
</style>

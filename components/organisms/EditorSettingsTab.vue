<script setup>
const { t } = useI18n()
const route = useRoute()
const { eventData, isOwner } = useEventEditor()

const showTemplateModal = ref(false)
const duplicating = ref(false)
const archiving = ref(false)
const showArchiveConfirm = ref(false)

async function duplicateEvent() {
  duplicating.value = true
  try {
    const result = await $fetch(`/api/events/${route.params.id}/duplicate`, { method: 'POST' })
    navigateTo(`/dashboard/events/${result.id}`)
  } finally {
    duplicating.value = false
  }
}

async function archiveEvent() {
  archiving.value = true
  try {
    await $fetch(`/api/events/${route.params.id}`, { method: 'DELETE' })
    navigateTo('/dashboard/events')
  } finally {
    archiving.value = false
  }
}
</script>

<template>
  <div class="editor-settings">
    <!-- Tier info -->
    <section class="editor-settings__section">
      <h3 class="editor-settings__section-label">{{ t('editor.tabs.settings') }}</h3>
      <div class="editor-settings__tier-badge">
        <Icon name="lucide:crown" size="16" />
        <span>{{ t(`tiers.${eventData?.tier || 'free'}`) }}</span>
      </div>
      <AppText size="sm" muted>
        {{ t('editor.settings.tierDescription') }}
      </AppText>
      <NuxtLink :to="$localePath('pricing')" class="editor-settings__upgrade-link">
        {{ t('editor.settings.upgradePlan') }}
      </NuxtLink>
    </section>

    <!-- Actions (owner only) -->
    <section v-if="isOwner" class="editor-settings__section">
      <h3 class="editor-settings__section-label">{{ t('editor.settings.actionsLabel') }}</h3>

      <div class="editor-settings__actions">
        <button
          type="button"
          class="editor-settings__action"
          :disabled="duplicating"
          @click="duplicateEvent"
        >
          <Icon name="lucide:copy" size="16" />
          <div>
            <span class="editor-settings__action-title">
              {{ duplicating ? t('dashboard.eventEditor.duplicating') : t('dashboard.eventEditor.duplicateEvent') }}
            </span>
            <span class="editor-settings__action-desc">{{ t('editor.settings.duplicateDesc') }}</span>
          </div>
        </button>

        <button
          type="button"
          class="editor-settings__action"
          @click="showTemplateModal = true"
        >
          <Icon name="lucide:bookmark" size="16" />
          <div>
            <span class="editor-settings__action-title">{{ t('dashboard.eventEditor.saveAsTemplate') }}</span>
            <span class="editor-settings__action-desc">{{ t('editor.settings.templateDesc') }}</span>
          </div>
        </button>

        <button
          type="button"
          class="editor-settings__action editor-settings__action--danger"
          @click="showArchiveConfirm = true"
        >
          <Icon name="lucide:archive" size="16" />
          <div>
            <span class="editor-settings__action-title">{{ t('editor.settings.archiveEvent') }}</span>
            <span class="editor-settings__action-desc">{{ t('editor.settings.archiveDesc') }}</span>
          </div>
        </button>
      </div>
    </section>

    <SaveAsTemplateModal
      :event-id="eventData.id"
      :visible="showTemplateModal"
      @close="showTemplateModal = false"
      @saved="showTemplateModal = false"
    />

    <ConfirmModal
      :visible="showArchiveConfirm"
      :title="t('editor.settings.archiveEvent')"
      :message="t('editor.settings.archiveConfirm')"
      variant="danger"
      :confirm-label="t('editor.settings.archiveEvent')"
      @confirm="archiveEvent"
      @close="showArchiveConfirm = false"
    />
  </div>
</template>

<style scoped>
.editor-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.editor-settings__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.editor-settings__section-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  margin: 0;
}

.editor-settings__tier-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-accent-bg);
  color: var(--color-accent);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  width: fit-content;
}

.editor-settings__upgrade-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.editor-settings__upgrade-link:hover {
  opacity: 0.8;
}

.editor-settings__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.editor-settings__action {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-family: var(--font-family);
  text-align: left;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);
}

.editor-settings__action:hover:not(:disabled) {
  border-color: var(--color-border);
  background: var(--color-background);
}

.editor-settings__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-settings__action--danger:hover:not(:disabled) {
  border-color: var(--color-error);
  color: var(--color-error);
}

.editor-settings__action-title {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editor-settings__action--danger:hover .editor-settings__action-title {
  color: var(--color-error);
}

.editor-settings__action-desc {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}
</style>

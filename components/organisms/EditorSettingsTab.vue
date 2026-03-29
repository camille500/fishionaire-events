<script setup>
const { t } = useI18n()
const route = useRoute()
const { eventData, isOwner, form } = useEventEditor()
const { staggerIn } = useEditorAnimations()

const showTemplateModal = ref(false)
const duplicating = ref(false)
const archiving = ref(false)
const showArchiveConfirm = ref(false)
const showUpgrade = ref(false)

// Tour restart
const tour = useTour()
const onboardingSync = useOnboardingSync()
const restartingTour = ref(false)

async function restartEditorTour() {
  restartingTour.value = true
  await onboardingSync.resetTour('event-creation')
  restartingTour.value = false
  // Start tour immediately
  setTimeout(() => {
    tour.startTour('event-creation')
  }, 300)
}

const canUpgrade = computed(() => eventData.value?.tier !== 'pro')

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

const settingsRef = ref(null)
onMounted(() => {
  nextTick(() => staggerIn(settingsRef.value, '.editor-settings__section'))
})
</script>

<template>
  <div ref="settingsRef" class="editor-settings">
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

      <template v-if="canUpgrade">
        <button
          v-if="!showUpgrade"
          type="button"
          class="editor-settings__upgrade-link"
          @click="showUpgrade = true"
        >
          {{ t('editor.settings.upgradeTier') }}
          <Icon name="lucide:arrow-right" size="14" />
        </button>

        <EventUpgradePanel
          v-else
          @close="showUpgrade = false"
        />
      </template>
      <AppText v-else size="sm" muted>
        {{ t('editor.settings.maxTier') }}
      </AppText>
    </section>

    <!-- Feature toggles -->
    <section class="editor-settings__section">
      <h3 class="editor-settings__section-label">{{ t('editor.settings.featuresLabel') }}</h3>
      <AppText size="sm" muted>{{ t('editor.settings.featuresDescription') }}</AppText>
      <FeatureTogglesGrid
        :model-value="form.features"
        :tier-features="eventData?.tierAllowedFeatures || {}"
        :feature-tier-map="eventData?.featureTierMap || {}"
        @update:model-value="form.features = $event"
        @locked-click="showUpgrade = true"
      />
    </section>

    <!-- Tour restart -->
    <section class="editor-settings__section">
      <h3 class="editor-settings__section-label">{{ t('tour.guidedTourLabel') }}</h3>
      <AppText size="sm" muted>{{ t('tour.restartEditorDescription') }}</AppText>
      <AppButton
        variant="outline"
        size="sm"
        :loading="restartingTour"
        @click="restartEditorTour"
      >
        <Icon name="lucide:rotate-ccw" size="14" />
        {{ t('tour.restartEditorTour') }}
      </AppButton>
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
          <div class="editor-settings__action-icon">
            <Icon name="lucide:copy" size="16" />
          </div>
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
          <div class="editor-settings__action-icon">
            <Icon name="lucide:bookmark" size="16" />
          </div>
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
          <div class="editor-settings__action-icon editor-settings__action-icon--danger">
            <Icon name="lucide:archive" size="16" />
          </div>
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
      :confirm-text="t('editor.settings.archiveConfirmText')"
      :confirm-label="t('editor.settings.archiveEvent')"
      variant="danger"
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
  transition: all var(--transition-fast);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: var(--font-family);
}

.editor-settings__upgrade-link:hover {
  opacity: 0.8;
  gap: var(--space-2);
}

.editor-settings__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.editor-settings__action {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-family: var(--font-family);
  text-align: left;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);
  box-shadow: var(--shadow-xs);
}

.editor-settings__action:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.editor-settings__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-settings__action--danger:hover:not(:disabled) {
  border-color: var(--color-error);
  color: var(--color-error);
}

/* Icon backgrounds */
.editor-settings__action-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.editor-settings__action:hover:not(:disabled) .editor-settings__action-icon {
  background: var(--color-accent-bg);
}

.editor-settings__action-icon--danger {
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
  color: var(--color-text-muted);
}

.editor-settings__action--danger:hover:not(:disabled) .editor-settings__action-icon--danger {
  background: color-mix(in srgb, var(--color-error) 15%, transparent);
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

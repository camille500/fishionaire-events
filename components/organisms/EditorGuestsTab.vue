<script setup>
const { t } = useI18n()
const { form, eventData, isOwner, canEdit, role, errors, touched, markTouched } = useEventEditor()
const { staggerIn } = useEditorAnimations()

const guestsRef = ref(null)
onMounted(() => {
  nextTick(() => staggerIn(guestsRef.value, '.editor-guests__section'))
})
</script>

<template>
  <div ref="guestsRef" class="editor-guests">
    <!-- Guest settings -->
    <section class="editor-guests__section">
      <h3 class="editor-guests__section-label">{{ t('dashboard.eventEditor.guestSettingsSection') }}</h3>

      <div class="editor-guests__props">
        <EditorPropertyRow :label="t('dashboard.eventEditor.maxGuestsLabel')" icon="lucide:users">
          <input
            v-model="form.maxGuests"
            type="number"
            min="1"
            class="editor-guests__prop-value editor-guests__prop-value--short"
            :placeholder="t('dashboard.eventEditor.maxGuestsPlaceholder')"
            @blur="markTouched('maxGuests')"
          />
        </EditorPropertyRow>
        <EditorFieldError
          :message="errors.maxGuests"
          :visible="!!(errors.maxGuests && touched.maxGuests)"
        />
      </div>

      <!-- Private toggle card -->
      <div
        class="editor-guests__toggle-card"
        :class="{ 'editor-guests__toggle-card--active': form.isPrivate }"
      >
        <div class="editor-guests__toggle-left">
          <div class="editor-guests__toggle-icon">
            <Icon :name="form.isPrivate ? 'lucide:lock' : 'lucide:globe'" size="16" />
          </div>
          <div class="editor-guests__toggle-text">
            <span class="editor-guests__toggle-title">{{ t('dashboard.eventEditor.isPrivateLabel') }}</span>
            <span class="editor-guests__toggle-desc">{{ t('dashboard.eventEditor.isPrivateDescription') }}</span>
          </div>
        </div>
        <AppSwitch v-model="form.isPrivate" />
      </div>
    </section>

    <!-- Invite guests -->
    <section v-if="canEdit" class="editor-guests__section">
      <h3 class="editor-guests__section-label">{{ t('dashboard.inviteGuests') }}</h3>
      <InviteForm :event-id="eventData.id" />
    </section>

    <!-- Co-organizers (owner only) -->
    <section v-if="isOwner" class="editor-guests__section">
      <CoOrganizerSection
        :event-id="eventData.id"
        :is-owner="isOwner"
      />
    </section>

    <!-- Guest RSVP (for invited guests) -->
    <section v-if="role === 'guest'" class="editor-guests__section">
      <SubEventRsvpSection
        :event-id="eventData.id"
        :email="eventData.guestEmail || ''"
      />
    </section>
  </div>
</template>

<style scoped>
.editor-guests {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.editor-guests__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.editor-guests__section-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  margin: 0;
}

.editor-guests__props {
  display: flex;
  flex-direction: column;
}

.editor-guests__prop-value {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}

.editor-guests__prop-value:hover {
  background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
}

.editor-guests__prop-value:focus {
  background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 25%, transparent);
}

.editor-guests__prop-value--short {
  max-width: 120px;
}

/* Toggle card */
.editor-guests__toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  transition: all var(--transition-fast);
}

.editor-guests__toggle-card:hover {
  border-color: var(--color-border);
}

.editor-guests__toggle-card--active {
  border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}

.editor-guests__toggle-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.editor-guests__toggle-icon {
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

.editor-guests__toggle-card--active .editor-guests__toggle-icon {
  background: var(--color-accent-bg);
}

.editor-guests__toggle-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.editor-guests__toggle-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editor-guests__toggle-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

@media (max-width: 640px) {
  .editor-guests__prop-value {
    width: 100%;
  }

  .editor-guests__toggle-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
}
</style>

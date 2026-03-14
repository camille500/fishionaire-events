<script setup>
const { t } = useI18n()
const { form, eventData, isOwner, canEdit, role } = useEventEditor()
</script>

<template>
  <div class="editor-guests">
    <!-- Guest settings -->
    <section class="editor-guests__section">
      <h3 class="editor-guests__section-label">{{ t('dashboard.eventEditor.guestSettingsSection') }}</h3>
      <div class="editor-guests__props">
        <div class="editor-guests__prop">
          <span class="editor-guests__prop-label">
            <Icon name="lucide:users" size="14" />
            {{ t('dashboard.eventEditor.maxGuestsLabel') }}
          </span>
          <input
            v-model="form.maxGuests"
            type="number"
            min="1"
            class="editor-guests__prop-value editor-guests__prop-value--short"
            :placeholder="t('dashboard.eventEditor.maxGuestsPlaceholder')"
          />
        </div>

        <div class="editor-guests__prop">
          <span class="editor-guests__prop-label">
            <Icon name="lucide:eye-off" size="14" />
            {{ t('dashboard.eventEditor.isPrivateLabel') }}
          </span>
          <label class="editor-guests__toggle">
            <input
              v-model="form.isPrivate"
              type="checkbox"
              class="editor-guests__checkbox"
            />
            <span class="editor-guests__toggle-hint">{{ t('dashboard.eventEditor.isPrivateDescription') }}</span>
          </label>
        </div>
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

.editor-guests__prop {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) 0;
  border-bottom: 1px solid color-mix(in srgb, var(--color-border-light) 50%, transparent);
}

.editor-guests__prop:last-child {
  border-bottom: none;
}

.editor-guests__prop-label {
  width: 160px;
  flex-shrink: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.editor-guests__prop-value {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.editor-guests__prop-value:hover {
  background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
}

.editor-guests__prop-value:focus {
  background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 20%, transparent);
}

.editor-guests__prop-value--short {
  max-width: 120px;
}

.editor-guests__toggle {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  flex: 1;
}

.editor-guests__checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
  cursor: pointer;
  flex-shrink: 0;
}

.editor-guests__toggle-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .editor-guests__prop {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .editor-guests__prop-label {
    width: auto;
  }

  .editor-guests__prop-value {
    width: 100%;
  }
}
</style>

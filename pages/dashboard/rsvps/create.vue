<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const toast = useToast()
const router = useRouter()

const title = ref('')
const description = ref('')
const rsvpDeadline = ref('')
const creating = ref(false)

async function handleCreate() {
  if (!title.value.trim()) {
    toast.add({ title: t('rsvp.validation.titleRequired'), icon: 'i-lucide-alert-circle', color: 'red' })
    return
  }

  creating.value = true
  try {
    const result = await $fetch('/api/rsvps', {
      method: 'POST',
      body: {
        title: title.value.trim(),
        description: description.value.trim() || null,
        rsvpDeadline: rsvpDeadline.value || null,
      },
    })
    toast.add({ title: t('rsvp.created'), icon: 'i-lucide-check', color: 'green' })
    await navigateTo(`/dashboard/rsvps/${result.id}`, { replace: true })
  } catch (err) {
    toast.add({ title: err?.data?.statusMessage || t('rsvp.createError'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="rsvp-create">
    <div class="rsvp-create__header">
      <button class="rsvp-create__back" @click="router.back()">
        <Icon name="lucide:arrow-left" size="16" />
      </button>
      <h1 class="rsvp-create__title">{{ t('rsvp.createNew') }}</h1>
    </div>

    <div class="rsvp-create__form">
      <div class="rsvp-create__field">
        <label class="rsvp-create__label">{{ t('rsvp.form.title') }} *</label>
        <input
          v-model="title"
          type="text"
          class="rsvp-create__input"
          :placeholder="t('rsvp.form.titlePlaceholder')"
          maxlength="200"
          autofocus
        />
      </div>

      <div class="rsvp-create__field">
        <label class="rsvp-create__label">{{ t('rsvp.form.description') }}</label>
        <RichTextEditor
          v-model="description"
          mode="mention"
          :placeholder="t('rsvp.form.descriptionPlaceholder')"
          :max-length="2000"
          :rows="3"
          :mention-items="[
            { id: 'name', label: 'Naam / Name', hint: '#name' },
            { id: 'date', label: 'Datum / Date', hint: '#date' },
          ]"
        />
      </div>

      <div class="rsvp-create__field">
        <label class="rsvp-create__label">{{ t('rsvp.form.deadline') }}</label>
        <input
          v-model="rsvpDeadline"
          type="date"
          class="rsvp-create__input"
        />
        <span class="rsvp-create__hint">{{ t('rsvp.form.deadlineHint') }}</span>
      </div>

      <div class="rsvp-create__actions">
        <AppButton variant="ghost" size="md" @click="router.back()">
          {{ t('rsvp.form.cancel') }}
        </AppButton>
        <AppButton variant="primary" size="md" :loading="creating" @click="handleCreate">
          <Icon name="lucide:check" size="14" />
          {{ t('rsvp.form.createButton') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rsvp-create {
  max-width: 600px;
  margin: 0 auto;
}

.rsvp-create__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

.rsvp-create__back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.rsvp-create__back:hover {
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.rsvp-create__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.rsvp-create__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.rsvp-create__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.rsvp-create__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.rsvp-create__input,
.rsvp-create__textarea {
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

.rsvp-create__input:focus,
.rsvp-create__textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
}

.rsvp-create__textarea {
  resize: vertical;
  min-height: 80px;
}

.rsvp-create__hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-create__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-light);
}
</style>

<script setup>
const { t } = useI18n()

const props = defineProps({
  entry: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const predefinedCategories = ['venue', 'catering', 'decoration', 'entertainment', 'photography', 'attire', 'transport', 'other']

const description = ref(props.entry?.description || '')
const amountEuros = ref(props.entry ? (props.entry.amountCents / 100).toFixed(2) : '')
const selectedCategory = ref(props.entry?.category || 'other')
const customCategory = ref('')
const isCustom = ref(props.entry ? !predefinedCategories.includes(props.entry.category) : false)
const paidAt = ref(props.entry?.paidAt ? new Date(props.entry.paidAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
const notes = ref(props.entry?.notes || '')

if (isCustom.value && props.entry) {
  customCategory.value = props.entry.category
  selectedCategory.value = 'custom'
}

function onCategoryChange(value) {
  if (value === 'custom') {
    isCustom.value = true
  } else {
    isCustom.value = false
    customCategory.value = ''
  }
  selectedCategory.value = value
}

function handleSubmit() {
  const amountCents = Math.round(parseFloat(amountEuros.value) * 100)
  if (!description.value.trim() || isNaN(amountCents) || amountCents <= 0) return

  const category = isCustom.value ? customCategory.value.trim() : selectedCategory.value
  if (!category) return

  emit('submit', {
    description: description.value.trim(),
    amountCents,
    category,
    paidAt: paidAt.value,
    notes: notes.value.trim() || undefined,
  })
}
</script>

<template>
  <form class="budget-form" @submit.prevent="handleSubmit">
    <div class="budget-form__field">
      <label class="budget-form__label">{{ t('budget.form.description') }}</label>
      <input
        v-model="description"
        type="text"
        class="budget-form__input"
        :placeholder="t('budget.form.descriptionPlaceholder')"
        required
      />
    </div>

    <div class="budget-form__row">
      <div class="budget-form__field budget-form__field--amount">
        <label class="budget-form__label">{{ t('budget.form.amount') }}</label>
        <input
          v-model="amountEuros"
          type="number"
          step="0.01"
          min="0.01"
          class="budget-form__input"
          placeholder="0.00"
          required
        />
      </div>

      <div class="budget-form__field">
        <label class="budget-form__label">{{ t('budget.form.category') }}</label>
        <select
          :value="selectedCategory"
          class="budget-form__select"
          @change="onCategoryChange($event.target.value)"
        >
          <option
            v-for="cat in predefinedCategories"
            :key="cat"
            :value="cat"
          >
            {{ t(`budget.categories.${cat}`) }}
          </option>
          <option value="custom">{{ t('budget.categories.custom') }}</option>
        </select>
      </div>
    </div>

    <div v-if="isCustom" class="budget-form__field">
      <input
        v-model="customCategory"
        type="text"
        class="budget-form__input"
        placeholder="Category name..."
        required
      />
    </div>

    <div class="budget-form__row">
      <div class="budget-form__field">
        <label class="budget-form__label">{{ t('budget.form.date') }}</label>
        <input
          v-model="paidAt"
          type="date"
          class="budget-form__input"
        />
      </div>

      <div class="budget-form__field">
        <label class="budget-form__label">{{ t('budget.form.notes') }}</label>
        <input
          v-model="notes"
          type="text"
          class="budget-form__input"
          :placeholder="t('budget.form.notesPlaceholder')"
        />
      </div>
    </div>

    <div class="budget-form__actions">
      <AppButton type="submit" variant="primary" size="sm" :disabled="saving">
        {{ entry ? t('budget.form.save') : t('budget.form.add') }}
      </AppButton>
      <AppButton variant="ghost" size="sm" @click="emit('cancel')">
        {{ t('dashboard.cancel') }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.budget-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.budget-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.budget-form__field--amount {
  max-width: 200px;
}

.budget-form__row {
  display: flex;
  gap: var(--space-4);
}

.budget-form__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.budget-form__input,
.budget-form__select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  background: var(--color-background);
  transition: border-color var(--transition-fast);
}

.budget-form__input:focus,
.budget-form__select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.budget-form__actions {
  display: flex;
  gap: var(--space-2);
}

@media (max-width: 768px) {
  .budget-form__row {
    flex-direction: column;
  }

  .budget-form__field--amount {
    max-width: none;
  }
}
</style>

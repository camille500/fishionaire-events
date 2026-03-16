<script setup>
const { t } = useI18n()

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const commonRestrictions = [
  'vegetarian',
  'vegan',
  'glutenFree',
  'halal',
  'kosher',
  'nutAllergy',
  'lactoseIntolerant',
]

const selected = ref(new Set(
  props.initialData?.restrictions
    ? props.initialData.restrictions.split(',').map((s) => s.trim())
    : []
))
const notes = ref(props.initialData?.notes || '')

function toggle(restriction) {
  if (selected.value.has(restriction)) {
    selected.value.delete(restriction)
  } else {
    selected.value.add(restriction)
  }
}

function onSubmit() {
  emit('submit', {
    restrictions: Array.from(selected.value).join(', '),
    notes: notes.value || null,
  })
}
</script>

<template>
  <form class="dietary-form" @submit.prevent="onSubmit">
    <div class="dietary-form__grid">
      <label
        v-for="restriction in commonRestrictions"
        :key="restriction"
        class="dietary-form__option"
        :class="{ 'dietary-form__option--active': selected.has(restriction) }"
      >
        <input
          type="checkbox"
          :checked="selected.has(restriction)"
          class="dietary-form__checkbox"
          @change="toggle(restriction)"
        />
        {{ t(`editor.dietary.${restriction}`) }}
      </label>
    </div>

    <div class="dietary-form__field">
      <label class="dietary-form__label">{{ t('editor.dietary.notes') }}</label>
      <AppTextarea
        v-model="notes"
        :placeholder="t('editor.dietary.notesPlaceholder')"
        :rows="2"
        :disabled="loading"
      />
    </div>

    <AppButton
      variant="primary"
      size="sm"
      :disabled="loading || selected.size === 0"
    >
      {{ t('editor.dietary.submit') }}
    </AppButton>
  </form>
</template>

<style scoped>
.dietary-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.dietary-form__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.dietary-form__option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.dietary-form__option:hover {
  border-color: var(--color-border);
}

.dietary-form__option--active {
  border-color: var(--color-accent);
  background: var(--color-accent-dim);
  color: var(--color-accent);
}

.dietary-form__checkbox {
  display: none;
}

.dietary-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.dietary-form__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}
</style>

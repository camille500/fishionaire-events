<script setup>
const props = defineProps({
  item: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])
const { t } = useI18n()

const form = reactive({
  title: props.item?.title || '',
  description: props.item?.description || '',
  imageUrl: props.item?.imageUrl || '',
  externalUrl: props.item?.externalUrl || '',
  priceCents: props.item?.priceCents ? props.item.priceCents / 100 : null,
  category: props.item?.category || '',
  priority: props.item?.priority || 0,
  isPoolable: props.item?.isPoolable || false,
  poolTargetCents: props.item?.poolTargetCents ? props.item.poolTargetCents / 100 : null,
})

const categories = [
  'electronics', 'books', 'home', 'kitchen', 'fashion', 'beauty', 'experiences', 'toys',
]

function handleSubmit() {
  if (!form.title.trim()) return

  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim() || null,
    imageUrl: form.imageUrl.trim() || null,
    externalUrl: form.externalUrl.trim() || null,
    priceCents: form.priceCents ? Math.round(form.priceCents * 100) : null,
    category: form.category || null,
    priority: form.priority,
    isPoolable: form.isPoolable,
    poolTargetCents: form.isPoolable && form.poolTargetCents ? Math.round(form.poolTargetCents * 100) : null,
  })
}
</script>

<template>
  <form class="wishlist-form" @submit.prevent="handleSubmit">
    <div class="wishlist-form__field">
      <label class="wishlist-form__label">{{ t('wishlist.form.title') }} *</label>
      <AppInput v-model="form.title" :placeholder="t('wishlist.form.titlePlaceholder')" />
    </div>

    <div class="wishlist-form__field">
      <label class="wishlist-form__label">{{ t('wishlist.form.description') }}</label>
      <AppTextarea v-model="form.description" :placeholder="t('wishlist.form.descriptionPlaceholder')" :rows="2" />
    </div>

    <div class="wishlist-form__row">
      <div class="wishlist-form__field wishlist-form__field--half">
        <label class="wishlist-form__label">{{ t('wishlist.form.price') }}</label>
        <AppInput v-model.number="form.priceCents" type="number" step="0.01" min="0" placeholder="€ 0,00" />
      </div>

      <div class="wishlist-form__field wishlist-form__field--half">
        <label class="wishlist-form__label">{{ t('wishlist.form.category') }}</label>
        <select v-model="form.category" class="wishlist-form__select">
          <option value="">{{ t('wishlist.form.noCategory') }}</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ t(`wishlist.categories.${cat}`, cat) }}
          </option>
        </select>
      </div>
    </div>

    <div class="wishlist-form__field">
      <label class="wishlist-form__label">{{ t('wishlist.form.imageUrl') }}</label>
      <AppInput v-model="form.imageUrl" :placeholder="t('wishlist.form.imageUrlPlaceholder')" />
    </div>

    <div class="wishlist-form__field">
      <label class="wishlist-form__label">{{ t('wishlist.form.externalUrl') }}</label>
      <AppInput v-model="form.externalUrl" :placeholder="t('wishlist.form.externalUrlPlaceholder')" />
    </div>

    <div class="wishlist-form__field">
      <label class="wishlist-form__label">{{ t('wishlist.form.priority') }}</label>
      <PriorityStars v-model="form.priority" />
    </div>

    <div class="wishlist-form__field">
      <label class="wishlist-form__toggle">
        <AppSwitch v-model="form.isPoolable" />
        <span>{{ t('wishlist.form.poolable') }}</span>
      </label>
      <p class="wishlist-form__hint">{{ t('wishlist.form.poolableHint') }}</p>
    </div>

    <div v-if="form.isPoolable" class="wishlist-form__field">
      <label class="wishlist-form__label">{{ t('wishlist.form.poolTarget') }}</label>
      <AppInput v-model.number="form.poolTargetCents" type="number" step="0.01" min="0" placeholder="€ 0,00" />
    </div>

    <div class="wishlist-form__actions">
      <AppButton type="submit" variant="primary" :loading="saving">
        <Icon :name="item ? 'lucide:check' : 'lucide:plus'" />
        {{ item ? t('wishlist.form.save') : t('wishlist.form.add') }}
      </AppButton>
      <AppButton variant="ghost" @click="emit('cancel')">
        {{ t('wishlist.cancel') }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.wishlist-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.wishlist-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.wishlist-form__field--half {
  flex: 1;
}

.wishlist-form__row {
  display: flex;
  gap: var(--space-3);
}

.wishlist-form__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.wishlist-form__select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
}

.wishlist-form__select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.wishlist-form__toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
}

.wishlist-form__hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

.wishlist-form__actions {
  display: flex;
  gap: var(--space-2);
  padding-top: var(--space-2);
}

@media (max-width: 640px) {
  .wishlist-form__row {
    flex-direction: column;
  }
}
</style>

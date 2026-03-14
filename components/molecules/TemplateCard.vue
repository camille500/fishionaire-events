<script setup>
const { t } = useI18n()

defineProps({
  template: {
    type: Object,
    required: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select', 'delete'])

const eventTypeIcons = {
  birthday: 'cake',
  wedding: 'heart',
  baby_shower: 'baby',
  dinner: 'utensils',
  corporate: 'briefcase',
  other: 'calendar',
}
</script>

<template>
  <div class="template-card" @click="emit('select', template)">
    <div class="template-card__icon">
      <Icon :name="'lucide:' + (eventTypeIcons[template.eventType] || 'calendar')" size="20" />
    </div>
    <div class="template-card__content">
      <h4 class="template-card__name">{{ template.name }}</h4>
      <p v-if="template.description" class="template-card__description">{{ template.description }}</p>
      <div v-if="template.subEventTemplates?.length" class="template-card__parts">
        <span v-for="(part, i) in template.subEventTemplates.slice(0, 3)" :key="i" class="template-card__part">
          {{ part.title }}
        </span>
        <span v-if="template.subEventTemplates.length > 3" class="template-card__part template-card__part--more">
          +{{ template.subEventTemplates.length - 3 }}
        </span>
      </div>
    </div>
    <div class="template-card__actions">
      <AppButton variant="ghost" size="sm" @click.stop="emit('select', template)">
        {{ t('dashboard.templates.useTemplate') }}
      </AppButton>
      <AppButton
        v-if="!isSystem"
        variant="ghost"
        size="sm"
        @click.stop="emit('delete', template)"
      >
        <Icon name="lucide:trash-2" size="14" />
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.template-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.template-card:hover {
  border-color: var(--color-accent-light);
  box-shadow: var(--shadow-sm);
}

.template-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
  flex-shrink: 0;
}

.template-card__content {
  flex: 1;
  min-width: 0;
}

.template-card__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--color-text-primary);
}

.template-card__description {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: var(--space-1) 0 0;
}

.template-card__parts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-2);
}

.template-card__part {
  font-size: var(--text-xs);
  padding: 2px var(--space-2);
  background: var(--color-background);
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
}

.template-card__part--more {
  font-weight: var(--font-weight-medium);
}

.template-card__actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}
</style>

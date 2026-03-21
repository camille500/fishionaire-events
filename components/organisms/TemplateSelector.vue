<script setup>
const { t } = useI18n()

const emit = defineEmits(['select', 'skip'])

const templates = ref({ system: [], user: [] })
const activeTab = ref('system')
const confirmDeleteTemplate = ref(null)

async function fetchTemplates() {
  try {
    templates.value = await $fetch('/api/templates')
  } catch {
    // Ignore
  }
}

function onDeleteTemplate(template) {
  confirmDeleteTemplate.value = template
}

async function doDeleteTemplate() {
  if (!confirmDeleteTemplate.value) return
  const template = confirmDeleteTemplate.value
  confirmDeleteTemplate.value = null
  await $fetch(`/api/templates/${template.id}`, { method: 'DELETE' })
  await fetchTemplates()
}

onMounted(fetchTemplates)
</script>

<template>
  <div class="template-selector">
    <div class="template-selector__header">
      <AppHeading :level="3" size="sm">{{ t('dashboard.templates.title') }}</AppHeading>
      <AppText size="sm" muted>{{ t('dashboard.templates.subtitle') }}</AppText>
    </div>

    <div class="template-selector__tabs">
      <button
        class="template-selector__tab"
        :class="{ 'template-selector__tab--active': activeTab === 'system' }"
        @click="activeTab = 'system'"
      >
        {{ t('dashboard.templates.systemTemplates') }}
      </button>
      <button
        class="template-selector__tab"
        :class="{ 'template-selector__tab--active': activeTab === 'user' }"
        @click="activeTab = 'user'"
      >
        {{ t('dashboard.templates.myTemplates') }}
      </button>
    </div>

    <div class="template-selector__list">
      <template v-if="activeTab === 'system'">
        <TemplateCard
          v-for="tmpl in templates.system"
          :key="tmpl.id"
          :template="tmpl"
          :is-system="true"
          @select="emit('select', $event)"
        />
      </template>
      <template v-else>
        <TemplateCard
          v-for="tmpl in templates.user"
          :key="tmpl.id"
          :template="tmpl"
          @select="emit('select', $event)"
          @delete="onDeleteTemplate"
        />
        <AppText v-if="templates.user.length === 0" size="sm" muted class="template-selector__empty">
          {{ t('dashboard.templates.noUserTemplates') }}
        </AppText>
      </template>
    </div>

    <div class="template-selector__footer">
      <AppButton variant="ghost" @click="emit('skip')">
        {{ t('dashboard.templates.startFromScratch') }}
      </AppButton>
    </div>

    <ConfirmModal
      v-if="confirmDeleteTemplate"
      :title="t('dashboard.templates.confirmDeleteTemplate')"
      :message="confirmDeleteTemplate.name || ''"
      variant="danger"
      @confirm="doDeleteTemplate"
      @close="confirmDeleteTemplate = null"
    />
  </div>
</template>

<style scoped>
.template-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.template-selector__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.template-selector__tabs {
  display: flex;
  gap: var(--space-1);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--space-1);
}

.template-selector__tab {
  flex: 1;
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.template-selector__tab--active {
  background: var(--color-surface);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}

.template-selector__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 400px;
  overflow-y: auto;
}

.template-selector__empty {
  text-align: center;
  padding: var(--space-6);
}

.template-selector__footer {
  display: flex;
  justify-content: center;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-light);
}
</style>

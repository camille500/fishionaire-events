<script setup>
const { t } = useI18n()
const { form, eventData } = useEventEditor()
const { staggerIn } = useEditorAnimations()

const themeRef = ref(null)
onMounted(() => {
  nextTick(() => staggerIn(themeRef.value, '.editor-theme__group'))
})
</script>

<template>
  <div ref="themeRef" class="editor-theme">
    <h3 class="editor-theme__heading">{{ t('editor.theme.title') }}</h3>
    <p class="editor-theme__desc">{{ t('editor.theme.description') }}</p>

    <!-- Dual color palette -->
    <div class="editor-theme__group">
      <label class="editor-theme__label">{{ t('editor.theme.primaryColor') }}</label>
      <ColorPicker v-model="form.themeColor" />
    </div>

    <div class="editor-theme__group">
      <label class="editor-theme__label">{{ t('editor.theme.secondaryColor') }}</label>
      <ColorPicker v-model="form.themeColorSecondary" />
    </div>

    <div v-if="form.themeColor && form.themeColorSecondary" class="editor-theme__group">
      <label class="editor-theme__label">{{ t('editor.theme.gradientAngle') }}</label>
      <div class="editor-theme__angle-row">
        <input
          v-model.number="form.gradientAngle"
          type="range"
          min="0"
          max="360"
          step="15"
          class="editor-theme__angle-slider"
        />
        <span class="editor-theme__angle-value">{{ form.gradientAngle }}°</span>
        <div
          class="editor-theme__gradient-preview"
          :style="{
            background: `linear-gradient(${form.gradientAngle}deg, ${form.themeColor}, ${form.themeColorSecondary})`,
          }"
        />
      </div>
    </div>

    <!-- Font pairing -->
    <div class="editor-theme__group">
      <label class="editor-theme__label">{{ t('editor.theme.fontPairing') }}</label>
      <FontPairingPicker v-model="form.fontPairing" />
    </div>

    <!-- Card style -->
    <div class="editor-theme__group">
      <label class="editor-theme__label">{{ t('editor.theme.cardStyle') }}</label>
      <div class="editor-theme__styles">
        <button
          v-for="style in ['glass', 'solid', 'outlined']"
          :key="style"
          type="button"
          class="editor-theme__style-btn"
          :class="{ 'editor-theme__style-btn--active': form.cardStyle === style }"
          @click="form.cardStyle = style"
        >
          <Icon :name="style === 'glass' ? 'lucide:sparkles' : style === 'solid' ? 'lucide:square' : 'lucide:frame'" size="16" />
          {{ t(`editor.theme.cardStyles.${style}`) }}
        </button>
      </div>
    </div>

    <!-- Welcome message -->
    <div class="editor-theme__group">
      <label class="editor-theme__label">{{ t('editor.theme.welcomeMessage') }}</label>
      <p class="editor-theme__desc">{{ t('editor.theme.welcomeMessageHint') }}</p>
      <RichTextEditor
        v-model="form.welcomeMessage"
        mode="mention"
        :rows="3"
        :placeholder="t('editor.theme.welcomeMessagePlaceholder')"
        :mention-items="[
          { id: 'name', label: 'Naam / Name', hint: '#name' },
        ]"
      />
    </div>

    <!-- Hero animation -->
    <div class="editor-theme__group">
      <label class="editor-theme__label">{{ t('editor.theme.heroAnimation') }}</label>
      <AnimationPicker v-model="form.heroAnimation" />
    </div>

    <!-- Background pattern -->
    <div class="editor-theme__group">
      <label class="editor-theme__label">{{ t('editor.theme.backgroundPattern') }}</label>
      <PatternPicker v-model="form.backgroundPattern" />
    </div>

    <!-- Color mode -->
    <div class="editor-theme__group">
      <label class="editor-theme__label">{{ t('editor.theme.colorMode') }}</label>
      <div class="editor-theme__styles">
        <button
          v-for="mode in ['auto', 'light', 'dark']"
          :key="mode"
          type="button"
          class="editor-theme__style-btn"
          :class="{ 'editor-theme__style-btn--active': form.colorMode === mode }"
          @click="form.colorMode = mode"
        >
          <Icon :name="mode === 'auto' ? 'lucide:monitor' : mode === 'light' ? 'lucide:sun' : 'lucide:moon'" size="16" />
          {{ t(`editor.theme.colorModes.${mode}`) }}
        </button>
      </div>
    </div>

    <!-- Hide branding -->
    <div class="editor-theme__group">
      <div class="editor-theme__toggle-card" :class="{ 'editor-theme__toggle-card--active': form.hideBranding }">
        <div class="editor-theme__toggle-left">
          <div class="editor-theme__toggle-icon">
            <Icon name="lucide:eye-off" size="16" />
          </div>
          <div class="editor-theme__toggle-text">
            <span class="editor-theme__toggle-title">{{ t('editor.theme.hideBranding') }}</span>
            <span class="editor-theme__toggle-desc">{{ t('editor.theme.hideBrandingDesc') }}</span>
          </div>
        </div>
        <AppSwitch v-model="form.hideBranding" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-theme {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.editor-theme__heading {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  margin: 0;
}

.editor-theme__desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.editor-theme__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-light);
}

.editor-theme__group:first-of-type {
  border-top: none;
  padding-top: 0;
}

.editor-theme__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.editor-theme__angle-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.editor-theme__angle-slider {
  flex: 1;
  accent-color: var(--color-accent);
}

.editor-theme__angle-value {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  min-width: 36px;
  text-align: right;
}

.editor-theme__gradient-preview {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.editor-theme__styles {
  display: flex;
  gap: var(--space-2);
}

.editor-theme__style-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.editor-theme__style-btn :deep(.iconify) {
  color: var(--color-text-muted);
}

.editor-theme__style-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.editor-theme__style-btn--active {
  border-color: var(--color-accent);
  background: var(--color-accent-bg);
  color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}

.editor-theme__style-btn--active :deep(.iconify) {
  color: var(--color-accent);
}

.editor-theme__textarea {
  width: 100%;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--input-bg);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  padding: var(--space-3);
  resize: vertical;
  min-height: 80px;
  line-height: var(--line-height-relaxed);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
}

.editor-theme__textarea:hover:not(:disabled) {
  border-color: var(--color-border);
}

.editor-theme__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--input-focus-ring);
  background: var(--color-surface);
}

.editor-theme__textarea::placeholder {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.editor-theme__toggle-card {
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

.editor-theme__toggle-card:hover {
  border-color: var(--color-border);
}

.editor-theme__toggle-card--active {
  border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}

.editor-theme__toggle-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.editor-theme__toggle-icon {
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

.editor-theme__toggle-card--active .editor-theme__toggle-icon {
  background: var(--color-accent-bg);
}

.editor-theme__toggle-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.editor-theme__toggle-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editor-theme__toggle-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

@media (max-width: 640px) {
  .editor-theme__styles {
    flex-wrap: wrap;
  }
}
</style>

<script setup>
const { t } = useI18n()

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const name = ref('')

function onSubmit() {
  if (name.value.trim()) {
    emit('submit', name.value.trim())
    name.value = ''
  }
}
</script>

<template>
  <form class="plus-one-form" @submit.prevent="onSubmit">
    <AppInput
      v-model="name"
      :placeholder="t('editor.plusOne.namePlaceholder')"
      :disabled="loading"
      icon="lucide:user-plus"
    />
    <AppButton variant="primary" size="sm" :disabled="loading || !name.trim()">
      {{ t('editor.plusOne.request') }}
    </AppButton>
  </form>
</template>

<style scoped>
.plus-one-form {
  display: flex;
  gap: var(--space-2);
  align-items: flex-end;
}

.plus-one-form :deep(.app-input) {
  flex: 1;
}
</style>

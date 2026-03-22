<script setup>
const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:page'])
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <AppText size="sm" color="muted">
      {{ total }} results
    </AppText>
    <div class="pagination__controls">
      <AppButton
        size="sm"
        variant="outline"
        :disabled="page <= 0"
        @click="emit('update:page', page - 1)"
      >
        <Icon name="lucide:chevron-left" size="14" />
        Previous
      </AppButton>
      <AppText size="sm">
        {{ page + 1 }} / {{ totalPages }}
      </AppText>
      <AppButton
        size="sm"
        variant="outline"
        :disabled="page >= totalPages - 1"
        @click="emit('update:page', page + 1)"
      >
        Next
        <Icon name="lucide:chevron-right" size="14" />
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
</style>

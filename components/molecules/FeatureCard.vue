<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="feature-card glass tilt-card">
    <div class="feature-card__icon">
      <Icon :name="'lucide:' + icon" size="24" />
    </div>
    <h3 class="feature-card__title">{{ title }}</h3>
    <p class="feature-card__desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.feature-card {
  padding: 32px;
  transition: border-color 0.3s ease, background 0.3s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
  cursor: default;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  border-color: var(--card-border);
  background: var(--card-bg-hover);
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.feature-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  color: var(--color-accent);
  background: var(--color-accent-bg);
  border: 1px solid rgba(0, 184, 148, 0.15);
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover .feature-card__icon {
  transform: scale(1.05);
}

.feature-card__title {
  font-size: 1.15rem;
  margin-bottom: 10px;
  font-weight: 600;
  position: relative;
  color: var(--text-primary);
  font-family: var(--font-family-heading);
}

.feature-card__desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.65;
  position: relative;
}
</style>

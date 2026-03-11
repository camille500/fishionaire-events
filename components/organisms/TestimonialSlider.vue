<script setup>
defineProps({
  testimonials: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="testimonial-slider">
    <div class="testimonial-slider__container">
      <div class="testimonial-slider__track">
        <TestimonialCard
          v-for="(testimonial, index) in testimonials"
          :key="index"
          :quote="testimonial.quote"
          :author="testimonial.author"
          :role="testimonial.role"
          class="animate-on-scroll scale-in"
          :class="`stagger-${index + 1}`"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonial-slider__container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.testimonial-slider__track {
  display: flex;
  gap: var(--space-6);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-4) 0;
  scrollbar-width: none;
}

.testimonial-slider__track::-webkit-scrollbar {
  display: none;
}

.testimonial-slider__track > * {
  scroll-snap-align: start;
}
</style>

<script setup>
const props = defineProps({
  testimonials: {
    type: Array,
    required: true,
  },
})

const currentIndex = ref(0)
let autoPlayTimer = null

function goTo(index) {
  currentIndex.value = index
}

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.testimonials.length
}

onMounted(() => {
  autoPlayTimer = setInterval(next, 5000)
})

onUnmounted(() => {
  clearInterval(autoPlayTimer)
})
</script>

<template>
  <section class="testimonial-slider">
    <div class="testimonial-slider__container">
      <div class="testimonial-slider__track">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="index"
          v-motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :visible-once="{ opacity: 1, scale: 1, transition: { delay: index * 150, duration: 400 } }"
          class="testimonial-slider__card-wrap"
        >
          <TestimonialCard
            :quote="testimonial.quote"
            :author="testimonial.author"
            :role="testimonial.role"
          />
        </div>
      </div>
      <div v-if="testimonials.length > 1" class="testimonial-slider__dots">
        <button
          v-for="(_, index) in testimonials"
          :key="index"
          class="testimonial-slider__dot"
          :class="{ 'testimonial-slider__dot--active': index === currentIndex }"
          @click="goTo(index)"
          :aria-label="`Testimonial ${index + 1}`"
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

.testimonial-slider__card-wrap {
  scroll-snap-align: start;
  min-width: 320px;
  flex: 1;
}

.testimonial-slider__dots {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

.testimonial-slider__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  padding: 0;
}

.testimonial-slider__dot--active {
  background: var(--color-accent);
  transform: scale(1.3);
}

.testimonial-slider__dot:hover {
  background: var(--color-accent-light);
}
</style>

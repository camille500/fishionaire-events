<script setup>
definePageMeta({ layout: false })

const route = useRoute()
const { t, locale } = useI18n()
const token = computed(() => route.params.token)

const { data: rsvp, error } = await useFetch(() => `/api/rsvp/${token.value}`)

// Guest identification
const guestName = ref('')
const guestEmail = ref('')
const identified = ref(false)

// RSVP state
const rsvpStatus = ref(null) // 'accepted' | 'declined'
const rsvpSubmitting = ref(false)
const rsvpDone = ref(false)

// Voting state
const votes = ref({}) // { optionId: { status, attendFrom, attendUntil } }
const voteSaving = ref(false)
const votesDone = ref(false)

function setVote(optionId, status) {
  votes.value[optionId] = {
    ...(votes.value[optionId] || {}),
    status,
  }
}

function setAttendance(optionId, from, until) {
  votes.value[optionId] = {
    ...(votes.value[optionId] || {}),
    attendFrom: from,
    attendUntil: until,
  }
}

async function submitRsvp(status) {
  if (!guestName.value.trim() || !guestEmail.value.trim()) return
  rsvpSubmitting.value = true
  try {
    await $fetch(`/api/rsvp/${token.value}/rsvp`, {
      method: 'POST',
      body: { status },
    })
    rsvpStatus.value = status
    rsvpDone.value = true
  } catch {
    // silent for now
  } finally {
    rsvpSubmitting.value = false
  }
}

async function submitVotes() {
  if (!guestName.value.trim() || !guestEmail.value.trim()) return

  const voteArray = Object.entries(votes.value)
    .filter(([, v]) => v.status)
    .map(([optionId, v]) => ({
      optionId,
      status: v.status,
      attendFrom: v.attendFrom || null,
      attendUntil: v.attendUntil || null,
    }))

  if (voteArray.length === 0) return

  voteSaving.value = true
  try {
    await $fetch(`/api/rsvp/${token.value}/vote`, {
      method: 'POST',
      body: { votes: voteArray },
    })
    votesDone.value = true
  } catch {
    // silent
  } finally {
    voteSaving.value = false
  }
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
}

// OG meta
useHead(() => ({
  title: rsvp.value?.title ? `${rsvp.value.title} — RSVP` : 'RSVP',
  meta: [
    { property: 'og:title', content: rsvp.value?.title || 'RSVP' },
    { property: 'og:description', content: rsvp.value?.description || '' },
    { property: 'og:type', content: 'website' },
    ...(rsvp.value?.coverImageUrl ? [{ property: 'og:image', content: rsvp.value.coverImageUrl }] : []),
  ],
}))
</script>

<template>
  <div class="rsvp-page">
    <!-- Error state -->
    <div v-if="error" class="rsvp-page__error">
      <Icon name="lucide:alert-circle" size="48" />
      <h2>{{ t('rsvp.guest.notFound') }}</h2>
      <p>{{ t('rsvp.guest.notFoundDesc') }}</p>
    </div>

    <template v-else-if="rsvp">
      <!-- Hero -->
      <div class="rsvp-hero" :class="{ 'rsvp-hero--has-cover': rsvp.coverImageUrl }">
        <div
          v-if="rsvp.coverImageUrl"
          class="rsvp-hero__cover"
          :style="{ backgroundImage: `url(${rsvp.coverImageUrl})` }"
        />
        <div class="rsvp-hero__overlay" />
        <div class="rsvp-hero__content">
          <h1 class="rsvp-hero__title">{{ rsvp.title }}</h1>
          <p v-if="rsvp.description" class="rsvp-hero__description">{{ rsvp.description }}</p>
        </div>
      </div>

      <!-- Main card -->
      <div class="rsvp-card">
        <!-- Guest identification -->
        <div v-if="!identified" class="rsvp-card__identify">
          <h2 class="rsvp-card__heading">{{ t('rsvp.guest.whoAreYou') }}</h2>
          <div class="rsvp-card__field">
            <input
              v-model="guestName"
              type="text"
              class="rsvp-card__input"
              :placeholder="t('rsvp.guest.namePlaceholder')"
            />
          </div>
          <div class="rsvp-card__field">
            <input
              v-model="guestEmail"
              type="email"
              class="rsvp-card__input"
              :placeholder="t('rsvp.guest.emailPlaceholder')"
            />
          </div>
          <AppButton
            variant="primary"
            size="md"
            :disabled="!guestName.trim() || !guestEmail.trim()"
            @click="identified = true"
          >
            {{ t('rsvp.guest.continue') }}
          </AppButton>
        </div>

        <template v-else>
          <!-- Date Poll -->
          <div v-if="rsvp.poll?.options?.length" class="rsvp-card__section">
            <h2 class="rsvp-card__heading">
              <Icon name="lucide:calendar" size="18" />
              {{ t('rsvp.guest.pickDates') }}
            </h2>

            <div v-if="votesDone" class="rsvp-card__success">
              <Icon name="lucide:check-circle" size="24" />
              <span>{{ t('rsvp.guest.voteSaved') }}</span>
            </div>

            <div v-else class="rsvp-poll">
              <div
                v-for="option in rsvp.poll.options"
                :key="option.id"
                class="rsvp-poll__option"
              >
                <div class="rsvp-poll__date">
                  <span class="rsvp-poll__date-text">{{ formatDate(option.date) }}</span>
                  <span v-if="option.startTime" class="rsvp-poll__time">
                    {{ formatTime(option.startTime) }}
                    <template v-if="option.endTime"> — {{ formatTime(option.endTime) }}</template>
                  </span>
                </div>

                <div class="rsvp-poll__votes">
                  <button
                    :class="['rsvp-poll__btn', 'rsvp-poll__btn--yes', { 'rsvp-poll__btn--active': votes[option.id]?.status === 'yes' }]"
                    @click="setVote(option.id, 'yes')"
                  >
                    <Icon name="lucide:check" size="16" />
                  </button>
                  <button
                    :class="['rsvp-poll__btn', 'rsvp-poll__btn--maybe', { 'rsvp-poll__btn--active': votes[option.id]?.status === 'maybe' }]"
                    @click="setVote(option.id, 'maybe')"
                  >
                    <Icon name="lucide:help-circle" size="16" />
                  </button>
                  <button
                    :class="['rsvp-poll__btn', 'rsvp-poll__btn--no', { 'rsvp-poll__btn--active': votes[option.id]?.status === 'no' }]"
                    @click="setVote(option.id, 'no')"
                  >
                    <Icon name="lucide:x" size="16" />
                  </button>
                </div>

                <!-- Vote counts -->
                <div class="rsvp-poll__counts">
                  <span class="rsvp-poll__count rsvp-poll__count--yes">{{ option.yesCount }}</span>
                  <span class="rsvp-poll__count rsvp-poll__count--maybe">{{ option.maybeCount }}</span>
                  <span class="rsvp-poll__count rsvp-poll__count--no">{{ option.noCount }}</span>
                </div>

                <!-- Partial attendance (shown when yes voted and time range exists) -->
                <div
                  v-if="votes[option.id]?.status === 'yes' && option.startTime && option.endTime"
                  class="rsvp-poll__partial"
                >
                  <span class="rsvp-poll__partial-label">{{ t('rsvp.guest.availableFrom') }}</span>
                  <input
                    type="time"
                    class="rsvp-poll__time-input"
                    :value="votes[option.id]?.attendFrom || formatTime(option.startTime)"
                    @input="setAttendance(option.id, $event.target.value, votes[option.id]?.attendUntil || formatTime(option.endTime))"
                  />
                  <span class="rsvp-poll__partial-label">{{ t('rsvp.guest.until') }}</span>
                  <input
                    type="time"
                    class="rsvp-poll__time-input"
                    :value="votes[option.id]?.attendUntil || formatTime(option.endTime)"
                    @input="setAttendance(option.id, votes[option.id]?.attendFrom || formatTime(option.startTime), $event.target.value)"
                  />
                </div>
              </div>

              <div class="rsvp-poll__legend">
                <span class="rsvp-poll__legend-item"><span class="rsvp-poll__dot rsvp-poll__dot--yes" /> {{ t('rsvp.guest.yes') }}</span>
                <span class="rsvp-poll__legend-item"><span class="rsvp-poll__dot rsvp-poll__dot--maybe" /> {{ t('rsvp.guest.maybe') }}</span>
                <span class="rsvp-poll__legend-item"><span class="rsvp-poll__dot rsvp-poll__dot--no" /> {{ t('rsvp.guest.no') }}</span>
              </div>

              <AppButton
                variant="primary"
                size="md"
                :loading="voteSaving"
                :disabled="Object.keys(votes).length === 0"
                @click="submitVotes"
              >
                {{ t('rsvp.guest.submitVotes') }}
              </AppButton>
            </div>
          </div>

          <!-- RSVP Accept/Decline -->
          <div v-if="rsvp.rsvpEnabled" class="rsvp-card__section">
            <h2 class="rsvp-card__heading">
              <Icon name="lucide:calendar-check" size="18" />
              {{ t('rsvp.guest.willYouCome') }}
            </h2>

            <div v-if="rsvpDone" class="rsvp-card__success">
              <Icon name="lucide:check-circle" size="24" />
              <span>{{ rsvpStatus === 'accepted' ? t('rsvp.guest.accepted') : t('rsvp.guest.declined') }}</span>
            </div>

            <div v-else class="rsvp-card__rsvp-buttons">
              <AppButton
                variant="primary"
                size="lg"
                :loading="rsvpSubmitting"
                @click="submitRsvp('accepted')"
              >
                <Icon name="lucide:check" size="18" />
                {{ t('rsvp.guest.accept') }}
              </AppButton>
              <AppButton
                variant="outline"
                size="lg"
                :loading="rsvpSubmitting"
                @click="submitRsvp('declined')"
              >
                <Icon name="lucide:x" size="18" />
                {{ t('rsvp.guest.decline') }}
              </AppButton>
            </div>
          </div>

          <!-- CTA: create account -->
          <div class="rsvp-card__cta">
            <Icon name="lucide:user-plus" size="16" />
            <span>{{ t('rsvp.guest.createAccountCta') }}</span>
            <NuxtLink to="/sign-up" class="rsvp-card__cta-link">{{ t('rsvp.guest.signUp') }}</NuxtLink>
          </div>
        </template>
      </div>

      <!-- Branding -->
      <div class="rsvp-page__branding">
        <span>Powered by</span>
        <NuxtLink to="/" class="rsvp-page__brand-link">Fishionaire Events</NuxtLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
.rsvp-page {
  min-height: 100vh;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rsvp-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 60vh;
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-6);
}

.rsvp-page__error h2 { color: var(--color-text-primary); margin: 0; }
.rsvp-page__error p { margin: 0; }

/* Hero */
.rsvp-hero {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--space-10) var(--space-6);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.rsvp-hero--has-cover { min-height: 280px; }

.rsvp-hero__cover {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.rsvp-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
}

.rsvp-hero__content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 600px;
}

.rsvp-hero__title {
  font-family: var(--font-family-heading);
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  color: white;
  margin: 0;
  line-height: 1.2;
}

.rsvp-hero__description {
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--text-base);
  margin: var(--space-3) 0 0;
  line-height: 1.6;
}

/* Main card */
.rsvp-card {
  width: 100%;
  max-width: 640px;
  margin: calc(-1 * var(--space-8)) auto 0;
  position: relative;
  z-index: 2;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.rsvp-card__identify {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.rsvp-card__heading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-family-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.rsvp-card__field {
  display: flex;
  flex-direction: column;
}

.rsvp-card__input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-family);
  background: var(--color-background);
  color: var(--color-text-primary);
  outline: none;
  transition: all var(--transition-fast);
}

.rsvp-card__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 12%, transparent);
}

.rsvp-card__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-bottom: var(--space-6);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border-light);
}

.rsvp-card__section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.rsvp-card__success {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  border-radius: var(--radius-md);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.rsvp-card__rsvp-buttons {
  display: flex;
  gap: var(--space-3);
}

/* Poll */
.rsvp-poll {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.rsvp-poll__option {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

.rsvp-poll__option:hover {
  border-color: var(--color-border);
}

.rsvp-poll__date {
  flex: 1;
  min-width: 160px;
}

.rsvp-poll__date-text {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
}

.rsvp-poll__time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-poll__votes {
  display: flex;
  gap: var(--space-2);
}

.rsvp-poll__btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.rsvp-poll__btn:hover { border-color: var(--color-border); }

.rsvp-poll__btn--yes.rsvp-poll__btn--active {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.rsvp-poll__btn--maybe.rsvp-poll__btn--active {
  background: var(--color-warning);
  border-color: var(--color-warning);
  color: white;
}

.rsvp-poll__btn--no.rsvp-poll__btn--active {
  background: var(--color-error);
  border-color: var(--color-error);
  color: white;
}

.rsvp-poll__counts {
  display: flex;
  gap: var(--space-2);
  font-size: var(--text-xs);
}

.rsvp-poll__count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.rsvp-poll__count--yes { background: color-mix(in srgb, var(--color-success) 12%, transparent); color: var(--color-success); }
.rsvp-poll__count--maybe { background: color-mix(in srgb, var(--color-warning) 12%, transparent); color: var(--color-warning); }
.rsvp-poll__count--no { background: color-mix(in srgb, var(--color-error) 12%, transparent); color: var(--color-error); }

/* Partial attendance */
.rsvp-poll__partial {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-poll__partial-label {
  white-space: nowrap;
}

.rsvp-poll__time-input {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-family: var(--font-family);
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
}

.rsvp-poll__time-input:focus {
  border-color: var(--color-accent);
}

.rsvp-poll__legend {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-poll__legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.rsvp-poll__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.rsvp-poll__dot--yes { background: var(--color-success); }
.rsvp-poll__dot--maybe { background: var(--color-warning); }
.rsvp-poll__dot--no { background: var(--color-error); }

/* Account CTA */
.rsvp-card__cta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-6);
  padding: var(--space-3) var(--space-4);
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.rsvp-card__cta-link {
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  margin-left: auto;
}

.rsvp-card__cta-link:hover { text-decoration: underline; }

/* Branding */
.rsvp-page__branding {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) 0;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-page__brand-link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.rsvp-page__brand-link:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .rsvp-card {
    margin-top: calc(-1 * var(--space-4));
    margin-left: var(--space-3);
    margin-right: var(--space-3);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
  }

  .rsvp-poll__option {
    flex-direction: column;
    align-items: flex-start;
  }

  .rsvp-poll__votes {
    width: 100%;
    justify-content: flex-start;
  }

  .rsvp-card__rsvp-buttons {
    flex-direction: column;
  }
}
</style>

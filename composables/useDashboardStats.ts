import type { Ref } from 'vue'

interface EventItem {
  date?: string
  invitationCount?: number
}

interface EventsData {
  owned: EventItem[]
  invited: EventItem[]
}

interface StatItem {
  icon: string
  label: string
  value: number | string
  color: string
}

export function useDashboardStats(events: Ref<EventsData | null>) {
  const { t } = useI18n()

  const stats = computed(() => {
    const owned = events.value?.owned || []
    const invited = events.value?.invited || []

    return [
      {
        icon: 'calendar',
        label: t('dashboard.stats.totalEvents'),
        value: owned.length,
        color: 'var(--color-accent)',
      },
      {
        icon: 'inbox',
        label: t('dashboard.stats.invitations'),
        value: invited.length,
        color: 'var(--color-event-corporate)',
      },
      {
        icon: 'users',
        label: t('dashboard.stats.totalGuests'),
        value: owned.reduce((sum, e) => sum + (e.invitationCount || 0), 0),
        color: 'var(--color-event-birthday)',
      },
      {
        icon: 'trending-up',
        label: t('dashboard.stats.upcomingEvents'),
        value: owned.filter((e) => e.date && new Date(e.date) > new Date()).length || '—',
        color: 'var(--color-success)',
      },
    ]
  })

  return { stats }
}

import type { MaybeRefOrGetter } from 'vue'

interface EventTheme {
  icon: string
  accentColor: string
  gradient: string
}

const EVENT_THEMES: Record<string, EventTheme> = {
  birthday: {
    icon: 'lucide:cake',
    accentColor: '#9b59b6',
    gradient: 'linear-gradient(135deg, #9b59b6, #d2b4de)',
  },
  wedding: {
    icon: 'lucide:heart',
    accentColor: '#e91e63',
    gradient: 'linear-gradient(135deg, #e91e63, #f48fb1)',
  },
  baby_shower: {
    icon: 'lucide:baby',
    accentColor: '#4caf50',
    gradient: 'linear-gradient(135deg, #4caf50, #a5d6a7)',
  },
  dinner: {
    icon: 'lucide:utensils',
    accentColor: '#ff9800',
    gradient: 'linear-gradient(135deg, #ff9800, #ffe0b2)',
  },
  corporate: {
    icon: 'lucide:briefcase',
    accentColor: '#2196f3',
    gradient: 'linear-gradient(135deg, #2196f3, #90caf9)',
  },
  other: {
    icon: 'lucide:calendar',
    accentColor: '#00b894',
    gradient: 'linear-gradient(135deg, #00b894, #6c5ce7)',
  },
}

export function useEventTheme(eventType: MaybeRefOrGetter<string>) {
  const type = computed(() => toValue(eventType) || 'other')

  const theme = computed(() => EVENT_THEMES[type.value] || EVENT_THEMES.other)

  const icon = computed(() => theme.value.icon)
  const accentColor = computed(() => theme.value.accentColor)
  const gradient = computed(() => theme.value.gradient)
  const dataAttr = computed(() => type.value && type.value !== 'other' ? type.value : undefined)

  return {
    icon,
    accentColor,
    gradient,
    dataAttr,
    allThemes: EVENT_THEMES,
  }
}

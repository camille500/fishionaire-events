import type { SubEventTypeValue } from '~/server/entities/SubEvent'

export interface SubEventTypeConfig {
  key: SubEventTypeValue
  icon: string
  color: string
  bgColor: string
  borderColor: string
  features: string[]
}

export function useSubEventTypes() {
  const { t } = useI18n()

  const types: SubEventTypeConfig[] = [
    {
      key: 'ceremony',
      icon: 'lucide:book-open',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.08)',
      borderColor: 'rgba(139, 92, 246, 0.2)',
      features: ['richContent', 'speakers'],
    },
    {
      key: 'dinner',
      icon: 'lucide:utensils',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
      features: ['menu', 'dietary'],
    },
    {
      key: 'party',
      icon: 'lucide:music',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.08)',
      borderColor: 'rgba(236, 72, 153, 0.2)',
      features: ['plusOnes', 'dressCode', 'musicRequests'],
    },
    {
      key: 'activity',
      icon: 'lucide:dumbbell',
      color: '#14b8a6',
      bgColor: 'rgba(20, 184, 166, 0.08)',
      borderColor: 'rgba(20, 184, 166, 0.2)',
      features: ['capacity', 'materials', 'skillLevel'],
    },
    {
      key: 'generic',
      icon: 'lucide:layers',
      color: '#6b7280',
      bgColor: 'rgba(107, 114, 128, 0.08)',
      borderColor: 'rgba(107, 114, 128, 0.2)',
      features: [],
    },
  ]

  function getType(key: SubEventTypeValue): SubEventTypeConfig {
    return types.find((t) => t.key === key) ?? types[4]
  }

  function getLabel(key: SubEventTypeValue): string {
    return t(`editor.subEventTypes.${key}`)
  }

  function getDescription(key: SubEventTypeValue): string {
    return t(`editor.subEventTypes.${key}Desc`)
  }

  function getPreview(subEvent: Record<string, unknown>): string | null {
    const type = subEvent.type as SubEventTypeValue
    const config = subEvent.typeConfig as Record<string, unknown> || {}

    switch (type) {
      case 'dinner': {
        const sections = config.menuSections as unknown[] || []
        if (sections.length > 0) return t('editor.subEventPreview.menuItems', { count: sections.length })
        return t('editor.subEventPreview.dinnerDefault')
      }
      case 'party': {
        const parts: string[] = []
        if (config.allowPlusOnes) parts.push(t('editor.subEventPreview.plusOnesAllowed'))
        if (config.musicRequestsEnabled !== false) parts.push(t('editor.subEventPreview.musicRequests'))
        return parts.length > 0 ? parts.join(' · ') : null
      }
      case 'activity': {
        const parts: string[] = []
        if (subEvent.capacity) parts.push(t('editor.subEventPreview.capacity', { count: subEvent.capacity }))
        if (config.skillLevel) parts.push(t(`editor.skillLevel.${config.skillLevel}`))
        return parts.length > 0 ? parts.join(' · ') : null
      }
      case 'ceremony':
        return subEvent.richContent ? t('editor.subEventPreview.hasContent') : null
      default:
        return null
    }
  }

  return {
    types,
    getType,
    getLabel,
    getDescription,
    getPreview,
  }
}

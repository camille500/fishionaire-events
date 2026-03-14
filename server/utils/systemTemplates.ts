interface SubEventTemplate {
  title: string
  durationMinutes: number
}

interface SystemTemplate {
  name: string
  description: string
  eventType: string
  settings: { isPrivate: boolean }
  subEventTemplates: SubEventTemplate[]
}

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    name: 'Birthday Party',
    description: 'A classic birthday celebration with dinner and party',
    eventType: 'birthday',
    settings: { isPrivate: true },
    subEventTemplates: [
      { title: 'Welcome & Drinks', durationMinutes: 30 },
      { title: 'Dinner', durationMinutes: 60 },
      { title: 'Cake & Presents', durationMinutes: 30 },
      { title: 'Party & Dancing', durationMinutes: 120 },
    ],
  },
  {
    name: 'Wedding Day',
    description: 'A full wedding day from ceremony to party',
    eventType: 'wedding',
    settings: { isPrivate: true },
    subEventTemplates: [
      { title: 'Ceremony', durationMinutes: 45 },
      { title: 'Group Photos', durationMinutes: 30 },
      { title: 'Cocktail Hour', durationMinutes: 60 },
      { title: 'Dinner & Speeches', durationMinutes: 90 },
      { title: 'First Dance & Party', durationMinutes: 180 },
    ],
  },
  {
    name: 'Baby Shower',
    description: 'A warm celebration to welcome the new arrival',
    eventType: 'baby_shower',
    settings: { isPrivate: true },
    subEventTemplates: [
      { title: 'Arrival & Welcome', durationMinutes: 20 },
      { title: 'Games & Activities', durationMinutes: 45 },
      { title: 'Gift Opening', durationMinutes: 30 },
      { title: 'Refreshments', durationMinutes: 30 },
    ],
  },
  {
    name: 'Dinner Party',
    description: 'An elegant multi-course dinner experience',
    eventType: 'dinner',
    settings: { isPrivate: true },
    subEventTemplates: [
      { title: 'Aperitif', durationMinutes: 30 },
      { title: 'Starter', durationMinutes: 20 },
      { title: 'Main Course', durationMinutes: 40 },
      { title: 'Dessert & Coffee', durationMinutes: 30 },
    ],
  },
  {
    name: 'Corporate Event',
    description: 'A professional gathering with presentations and networking',
    eventType: 'corporate',
    settings: { isPrivate: false },
    subEventTemplates: [
      { title: 'Registration & Coffee', durationMinutes: 30 },
      { title: 'Keynote', durationMinutes: 45 },
      { title: 'Break', durationMinutes: 15 },
      { title: 'Workshop / Sessions', durationMinutes: 90 },
      { title: 'Networking Lunch', durationMinutes: 60 },
    ],
  },
]

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      secondary: 'violet',
      success: 'green',
      warning: 'amber',
      error: 'red',
      neutral: 'slate',
    },
    tabs: {
      slots: {
        trigger: [
          'group relative inline-flex items-center min-w-0 font-medium rounded-md disabled:cursor-not-allowed disabled:opacity-75',
          'data-[state=inactive]:text-default/70 hover:data-[state=inactive]:not-disabled:text-default',
          'transition-colors',
        ],
      },
    },
    input: {
      slots: { root: 'w-full' },
    },
    inputMenu: {
      slots: { root: 'w-full' },
    },
    textarea: {
      slots: { root: 'w-full' },
    },
    select: {
      slots: { base: 'w-full' },
    },
    selectMenu: {
      slots: { base: 'w-full' },
    },
  },
})

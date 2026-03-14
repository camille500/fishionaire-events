export function useSidebar() {
  const collapsed = useCookie('sidebar-collapsed', { default: () => false })
  const mobileOpen = ref(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  function toggle(): void {
    if (isMobile.value) {
      mobileOpen.value = !mobileOpen.value
    } else {
      collapsed.value = !collapsed.value
    }
  }

  function collapse(): void {
    collapsed.value = true
  }

  function expand(): void {
    collapsed.value = false
  }

  function openMobile(): void {
    mobileOpen.value = true
  }

  function closeMobile(): void {
    mobileOpen.value = false
  }

  // Close mobile sidebar on route change
  const route = useRoute()
  watch(() => route.path, () => {
    mobileOpen.value = false
  })

  return {
    collapsed,
    mobileOpen,
    isMobile,
    toggle,
    collapse,
    expand,
    openMobile,
    closeMobile,
  }
}

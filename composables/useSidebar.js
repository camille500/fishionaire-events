export function useSidebar() {
  const collapsed = useCookie('sidebar-collapsed', { default: () => false })
  const mobileOpen = ref(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  function toggle() {
    if (isMobile.value) {
      mobileOpen.value = !mobileOpen.value
    } else {
      collapsed.value = !collapsed.value
    }
  }

  function collapse() {
    collapsed.value = true
  }

  function expand() {
    collapsed.value = false
  }

  function openMobile() {
    mobileOpen.value = true
  }

  function closeMobile() {
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

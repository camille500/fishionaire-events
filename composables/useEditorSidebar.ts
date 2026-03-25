export function useEditorSidebar() {
  const editorSidebarOpen = ref(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  function toggleEditorSidebar(): void {
    editorSidebarOpen.value = !editorSidebarOpen.value
  }

  function closeEditorSidebar(): void {
    editorSidebarOpen.value = false
  }

  // Close on route change
  const route = useRoute()
  watch(() => route.path, () => {
    editorSidebarOpen.value = false
  })

  return {
    editorSidebarOpen,
    isMobile,
    toggleEditorSidebar,
    closeEditorSidebar,
  }
}

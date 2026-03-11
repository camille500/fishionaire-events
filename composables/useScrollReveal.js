export function useScrollReveal() {
  if (import.meta.server) return

  let io

  onMounted(() => {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('is-hidden')
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    const observe = () => {
      document.querySelectorAll('.animate-on-scroll:not(.is-visible)').forEach((el) => {
        el.classList.add('is-hidden')
        io.observe(el)
      })
    }

    nextTick(observe)
  })

  onUnmounted(() => {
    io?.disconnect()
  })
}

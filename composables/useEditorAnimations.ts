let _gsap: typeof import('gsap')['gsap'] | null = null

async function getGsap() {
  if (!_gsap) {
    const mod = await import('gsap')
    _gsap = mod.gsap
  }
  return _gsap
}

export function useEditorAnimations() {
  async function animateTabChange(el: HTMLElement, direction: string = 'right'): Promise<void> {
    const gsap = await getGsap()
    const xFrom = direction === 'right' ? 20 : -20

    gsap.fromTo(el, {
      opacity: 0,
      x: xFrom,
    }, {
      opacity: 1,
      x: 0,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  async function animateNewItem(el: HTMLElement): Promise<void> {
    const gsap = await getGsap()
    gsap.fromTo(el, {
      opacity: 0,
      y: 8,
      scale: 0.97,
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: 'power2.out',
    })
  }

  async function animateReorderStart(el: HTMLElement): Promise<void> {
    const gsap = await getGsap()
    gsap.to(el, {
      scale: 1.02,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      duration: 0.2,
      ease: 'power2.out',
    })
  }

  async function animateReorderEnd(el: HTMLElement): Promise<void> {
    const gsap = await getGsap()
    gsap.to(el, {
      scale: 1,
      boxShadow: 'none',
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  async function staggerIn(container: HTMLElement | null, selector: string, delay: number = 0.05): Promise<void> {
    const items = container?.querySelectorAll(selector)
    if (!items?.length) return

    const gsap = await getGsap()
    gsap.fromTo(items, {
      opacity: 0,
      y: 10,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      stagger: delay,
      ease: 'power2.out',
    })
  }

  async function pulseElement(el: HTMLElement): Promise<void> {
    const gsap = await getGsap()
    gsap.fromTo(el, {
      scale: 1,
    }, {
      scale: 1.05,
      duration: 0.15,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    })
  }

  async function revealField(el: HTMLElement): Promise<void> {
    const gsap = await getGsap()
    gsap.fromTo(el, {
      opacity: 0,
      y: -8,
      maxHeight: 0,
    }, {
      opacity: 1,
      y: 0,
      maxHeight: 200,
      duration: 0.4,
      ease: 'power2.out',
    })
  }

  async function animateTabChangeVertical(el: HTMLElement, direction: string = 'down'): Promise<void> {
    const gsap = await getGsap()
    const yFrom = direction === 'down' ? 12 : -12

    gsap.fromTo(el, {
      opacity: 0,
      y: yFrom,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  return {
    animateTabChange,
    animateTabChangeVertical,
    animateNewItem,
    animateReorderStart,
    animateReorderEnd,
    staggerIn,
    pulseElement,
    revealField,
  }
}

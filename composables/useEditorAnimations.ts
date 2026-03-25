import { gsap } from 'gsap'

export function useEditorAnimations() {
  function animateTabChange(el: HTMLElement, direction: string = 'right'): void {
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

  function animateNewItem(el: HTMLElement): void {
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

  function animateReorderStart(el: HTMLElement): void {
    gsap.to(el, {
      scale: 1.02,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      duration: 0.2,
      ease: 'power2.out',
    })
  }

  function animateReorderEnd(el: HTMLElement): void {
    gsap.to(el, {
      scale: 1,
      boxShadow: 'none',
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  function staggerIn(container: HTMLElement | null, selector: string, delay: number = 0.05): void {
    const items = container?.querySelectorAll(selector)
    if (!items?.length) return

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

  function pulseElement(el: HTMLElement): void {
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

  function revealField(el: HTMLElement): void {
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

  function animateTabChangeVertical(el: HTMLElement, direction: string = 'down'): void {
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

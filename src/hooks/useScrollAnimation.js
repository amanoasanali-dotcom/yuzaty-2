import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useScrollAnimation = (modelRef, camera) => {
  useLayoutEffect(() => {
    if (!modelRef.current || !camera) return

    // HIGH ALTITUDE START: Standing very high as requested
    camera.position.set(0, 150, 300)
    camera.rotation.set(-0.6, 0, 0)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2,
      },
    })

    // Cinematic sweep from extreme height
    tl.to(camera.position, {
      x: 100,
      y: 120,
      z: 200,
      duration: 2,
      ease: "power1.inOut",
      onUpdate: () => camera.lookAt(0, -20, 0)
    })
    
    // Changing perspective to look across the massive field
    .to(camera.position, {
      x: -100,
      y: 80,
      z: 150,
      duration: 2,
      ease: "sine.inOut",
      onUpdate: () => camera.lookAt(20, -10, -50)
    })

    // Final ascent to the sky
    .to(camera.position, {
      x: 0,
      y: 300,
      z: 100,
      duration: 3,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.lookAt(600, 600, -1000)
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [modelRef, camera])
}

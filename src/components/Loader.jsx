import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'

const Loader = () => {
  const { progress } = useProgress()
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => setShow(false), 800)
      return () => clearTimeout(timer)
    }
  }, [progress])

  if (!show) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-1000"
      style={{ 
        background: 'radial-gradient(circle, #a5d6e7 0%, #87ceeb 100%)',
        opacity: progress === 100 ? 0 : 1
      }}
    >
      <div className="relative w-64 h-1 bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-300 ease-out shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-6 text-white font-bold tracking-[0.3em] text-xs uppercase animate-pulse">
        Initializing World {Math.round(progress)}%
      </p>
    </div>
  )
}

export default Loader

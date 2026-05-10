import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const videos = [
  '/assets/videos/video1.mp4',
  '/assets/videos/video2.mp4',
  '/assets/videos/video3.mp4'
]

const hallPhotos = [
  '/assets/photos/hall1.jpg',
  '/assets/photos/hall2.jpg',
  '/assets/photos/hall3.jpg',
  '/assets/photos/hall4.jpg',
  '/assets/photos/hall5.jpg'
]

const MAX_VOLUME = 0.35

function App() {
  const [step, setStep] = useState('intro')
  const [name, setName] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [attendance, setAttendance] = useState('')
  const [withSpouse, setWithSpouse] = useState('')
  const [userName, setUserName] = useState('')
  const [submitCount, setSubmitCount] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [isStarted, setIsStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  
  const mainRef = useRef(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const petalsRef = useRef([])
  const musicBtnRef = useRef(null)
  const overlayRef = useRef(null)
  const revealRef = useRef({ radius: 0 })

  const [readyStates, setReadyStates] = useState({ video: false, audio: false })

  // Countdown Logic
  useEffect(() => {
    const targetDate = new Date('August 1, 2026 19:00:00').getTime()
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now
      if (distance < 0) {
        clearInterval(interval)
        return
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio('/assets/music.m4a')
    audio.loop = true
    audio.volume = 0
    audioRef.current = audio

    const checkAudioReady = () => setReadyStates(prev => ({ ...prev, audio: true }))
    audio.addEventListener('canplaythrough', checkAudioReady)
    
    // Fail-safe: if audio doesn't load in 4s, proceed anyway
    const timer = setTimeout(() => setReadyStates(prev => ({ ...prev, audio: true })), 4000)

    return () => {
      audio.removeEventListener('canplaythrough', checkAudioReady)
      clearTimeout(timer)
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    }
  }, [])

  // Listen for video readiness
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const checkVideoReady = () => setReadyStates(prev => ({ ...prev, video: true }))
    
    // Fail-safe: if video doesn't load in 4s, proceed anyway
    const timer = setTimeout(() => setReadyStates(prev => ({ ...prev, video: true })), 4000)

    if (video.readyState >= 3) {
      checkVideoReady()
    } else {
      video.addEventListener('canplaythrough', checkVideoReady)
    }
    return () => {
      video.removeEventListener('canplaythrough', checkVideoReady)
      clearTimeout(timer)
    }
  }, [])

  // Remove loader when both are ready (or timed out)
  useEffect(() => {
    if (readyStates.video && readyStates.audio) {
      gsap.to('.loader-screen', {
        opacity: 0,
        duration: 0.8,
        onComplete: () => setIsLoading(false)
      })
    }
  }, [readyStates])

  const startSite = () => {
    if (!audioRef.current || isStarted) return
    setIsStarted(true)
    setIsMuted(false)
    
    // Force play both
    audioRef.current.play().catch(() => {})
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }

    gsap.to(audioRef.current, { volume: MAX_VOLUME, duration: 3, ease: 'power1.inOut' })
    
    const isMobile = window.innerWidth <= 500
    const targetRight = isMobile ? 24 : (window.innerWidth / 2) - 250 + 24
    const targetX = (window.innerWidth / 2) - targetRight - 24
    const targetY = (window.innerHeight / 2) - 32 - 24
    
    gsap.to(musicBtnRef.current, { x: targetX, y: -targetY, width: '48px', height: '48px', scale: 1, duration: 1.5, ease: 'expo.inOut' })
    gsap.to('.music-icon', { width: '20px', height: '20px', duration: 1.5, ease: 'expo.inOut' })
    
    gsap.to(revealRef.current, {
      radius: 150, duration: 2.2, ease: 'power2.inOut',
      onUpdate: () => {
        if (overlayRef.current) {
          const val = revealRef.current.radius
          overlayRef.current.style.webkitMaskImage = `radial-gradient(circle at center, transparent ${val}%, black ${val + 10}%)`
          overlayRef.current.style.maskImage = `radial-gradient(circle at center, transparent ${val}%, black ${val + 10}%)`
        }
      },
      onComplete: () => { if (overlayRef.current) overlayRef.current.style.display = 'none' }
    })
  }

  useEffect(() => {
    petalsRef.current.forEach((petal, i) => {
      gsap.to(petal, { y: '100vh', x: `+=${Math.random() * 100 - 50}`, rotation: 360, duration: 10 + Math.random() * 20, repeat: -1, ease: 'none', delay: -Math.random() * 20 })
    })
    if (isStarted) {
      gsap.fromTo('.intro-title', { opacity: 0, y: 100, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'power3.out', delay: 0.5 })
      gsap.fromTo('.intro-subtitle', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: 1, ease: 'power3.out' })
    }
  }, [isStarted])

  useEffect(() => {
    if (!isStarted) return
    const photoItems = document.querySelectorAll('.hall-photo-item')
    photoItems.forEach((photo) => {
      gsap.fromTo(photo, { opacity: 0, scale: 0.8, y: 50 }, {
        opacity: 1, scale: 1, y: 0,
        scrollTrigger: { trigger: photo, start: 'top 85%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' }
      })
    })
    gsap.fromTo('.rsvp-section-content', { opacity: 0, y: 100 }, {
      opacity: 1, y: 0, duration: 1,
      scrollTrigger: { trigger: '.rsvp-section', start: 'top 60%', toggleActions: 'play none none reverse' }
    })
  }, [isStarted])

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (isMuted) {
      audioRef.current.play()
      setIsMuted(false)
      gsap.to(audioRef.current, { volume: MAX_VOLUME, duration: 2, ease: 'power1.inOut' })
    } else {
      gsap.to(audioRef.current, {
        volume: 0, duration: 2, ease: 'power1.inOut',
        onComplete: () => { if (audioRef.current) { audioRef.current.pause(); setIsMuted(true); } }
      })
    }
  }

  const handleNameSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      setUserName(name)
      gsap.to('.name-form', { opacity: 0, y: -50, duration: 0.8, onComplete: () => setStep('attendance') })
    }
  }

  const handleAttendanceSubmit = (status) => {
    setAttendance(status)
    if (status === 'no') {
      finalizeRSVP(name, 'no', 'no', '0')
    } else {
      gsap.to('.attendance-selector', { opacity: 0, scale: 0.8, duration: 0.8, onComplete: () => setStep('spouse') })
    }
  }

  const handleSpouseSubmit = (choice) => {
    setWithSpouse(choice)
    gsap.to('.spouse-selector', { opacity: 0, scale: 0.8, duration: 0.8, onComplete: () => setStep('guests') })
  }

  const handleGuestSubmit = (count) => {
    setGuestCount(count)
    finalizeRSVP(name, attendance, withSpouse, count)
  }

  const finalizeRSVP = async (name, att, spouse, count) => {
    setSubmitCount(prev => prev + 1)
    const token = '8702257119:AAEDlbzQ46yFtnpi_qrC72JFmIoWr0fO09Q'
    const chatId = '-5076655439'
    const message = `🆕 *Жаңа жауап:*\n👤 *Есімі:* ${name}\n✅ *Келе ме?:* ${att === 'yes' ? 'Иә, келеді' : 'Жоқ, келе алмайды'}\n💑 *Жұбайымен:* ${spouse === 'yes' ? 'Иә' : 'Жоқ'}\n👥 *Қонақ саны:* ${count}`.trim()
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }) })
    } catch (err) { console.error("Telegram Error:", err) }
    setStep('success')
  }

  const handleVideoEnd = () => { setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length) }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center">
      {isLoading && (
        <div className="loader-screen fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-white/10 border-t-white/80 rounded-full animate-spin mb-6"></div>
          <p className="text-white/40 text-[9px] uppercase tracking-[0.5em] animate-pulse">Жүктелуде</p>
        </div>
      )}
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none flex justify-center">
        <div className="relative w-full max-w-[500px] h-full overflow-hidden bg-[#0a0a0a]">
          <video ref={videoRef} key={videos[currentVideoIndex]} autoPlay muted playsInline preload="auto" onEnded={handleVideoEnd} className="absolute min-w-full min-h-full object-cover opacity-60 scale-105">
            <source src={videos[currentVideoIndex]} type="video/mp4" />
          </video>
          {[...Array(15)].map((_, i) => (
            <div key={i} ref={el => petalsRef.current[i] = el} className="absolute -top-10 w-1.5 h-1.5 bg-white/20 rounded-full blur-[1px] pointer-events-none" style={{ left: `${Math.random() * 100}%` }} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        </div>
      </div>

      {!isStarted && (
        <div ref={overlayRef} className="fixed inset-0 z-[60] flex flex-col items-center justify-center backdrop-blur-3xl bg-black/60" />
      )}

      {!isLoading && (
        <button
          ref={musicBtnRef}
          onClick={isStarted ? toggleMusic : startSite}
          className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5 backdrop-blur-2xl flex items-center justify-center hover:bg-white/10 shadow-2xl border border-white/10 scale-110"
        >
          {isMuted ? (
            <svg className="music-icon w-10 h-10 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="music-icon w-10 h-10 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      )}

      <div ref={mainRef} className={`relative w-full max-w-[500px] z-10 bg-transparent no-scrollbar overflow-x-hidden ${!isStarted ? 'h-screen overflow-hidden' : ''}`}>
        {isStarted && (
          <>
            <section className="h-screen flex flex-col items-center justify-center p-6 text-center">
              <h1 className="intro-title text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl mb-4 leading-tight">Сізді Қыз Ұзату<br />тойына шақырамыз</h1>
              <p className="intro-subtitle text-xl text-white/90 mb-2 font-light drop-shadow-lg">Аделияға арналған арманша кеш</p>
              <p className="text-base text-white/70 mb-12 max-w-[280px] drop-shadow-lg">Ресторан Fiesta Hall<br />1 тамыз 2026 ж.</p>
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"><div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-1"><div className="w-1 h-2 bg-white rounded-full animate-pulse"></div></div></div>
            </section>
            <section className="py-20 px-6 flex flex-col gap-12 bg-gradient-to-b from-transparent via-black/80 to-black/40 backdrop-blur-sm">
              <h2 className="text-white text-3xl font-bold text-center drop-shadow-lg uppercase tracking-widest">Fiesta Hall</h2>
              {hallPhotos.map((photo, i) => (
                <div key={i} className="hall-photo-item w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10"><img src={photo} alt={`Hall ${i + 1}`} className="w-full h-full object-cover" /></div>
              ))}
            </section>
            <section className="rsvp-section min-h-screen flex flex-col items-center justify-center p-8 relative">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
              <div className="rsvp-section-content relative z-10 w-full flex flex-col items-center">
                {step === 'intro' && (
                  <div className="text-center animate-fadeIn flex flex-col items-center gap-12">
                    <button onClick={() => setStep('name')} className="group relative px-12 py-4 overflow-hidden rounded-full border-2 border-white transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl">
                      <span className="relative z-10 text-white text-lg font-bold uppercase tracking-widest transition-colors duration-500 group-hover:text-black">Тойға жауап беру</span>
                      <div className="absolute inset-0 z-0 bg-white translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                    </button>
                  </div>
                )}
                {step === 'name' && (
                  <form onSubmit={handleNameSubmit} className="name-form text-center w-full">
                    <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-lg">Кімдер келеді?</h2>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Есімдерді жазыңыз" className="w-full px-6 py-4 text-center bg-white/10 backdrop-blur-md rounded-full border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white focus:bg-white/20 transition-all duration-300" autoFocus />
                    <button type="submit" className="w-full mt-8 py-4 bg-white/20 hover:bg-white/30 border border-white/40 rounded-full text-white font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg">Жалғастыру</button>
                  </form>
                )}
                {step === 'attendance' && (
                  <div className="attendance-selector text-center w-full">
                    <h2 className="text-2xl font-bold text-white mb-10 drop-shadow-lg">Тойға келесіз бе?</h2>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => handleAttendanceSubmit('yes')} className="w-full py-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 text-white text-xl font-medium hover:bg-white/20">Әрине, келемін!</button>
                      <button onClick={() => handleAttendanceSubmit('no')} className="w-full py-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 text-white text-xl font-medium hover:bg-white/20">Өкінішке орай, келе алмаймын</button>
                    </div>
                  </div>
                )}
                {step === 'spouse' && (
                  <div className="spouse-selector text-center w-full">
                    <h2 className="text-2xl font-bold text-white mb-10 drop-shadow-lg">Жұбайыңызбен келесіз бе?</h2>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => handleSpouseSubmit('yes')} className="w-full py-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 text-white text-xl font-medium hover:bg-white/20">Иә, жұбайыммен</button>
                      <button onClick={() => handleSpouseSubmit('no')} className="w-full py-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 text-white text-xl font-medium hover:bg-white/20">Жалғыз келемін</button>
                    </div>
                  </div>
                )}
                {step === 'guests' && (
                  <div className="guest-selector text-center w-full">
                    <h2 className="text-2xl font-bold text-white mb-10 drop-shadow-lg">Қанша адам болып келесіздер?</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {['1', '2', '3', '4', '5+'].map(count => (
                        <button key={count} onClick={() => handleGuestSubmit(count)} className="py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 text-white text-xl font-bold hover:bg-white/20">{count}</button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 'success' && (
                  <div className="success-message text-center">
                    <div className="mb-6"><svg className="w-20 h-20 mx-auto text-white/80 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Рахмет, {userName}!</h2>
                    <p className="text-lg text-white/80 mb-2 drop-shadow-lg">{attendance === 'yes' ? 'Жауабыңыз қабылданды, тойда кездескенше!' : 'Жауабыңыз қабылданды'}</p>
                    {submitCount < 2 && (
                      <button onClick={() => { setStep('intro'); setName(''); setGuestCount(''); setAttendance(''); setWithSpouse(''); setUserName(''); }} className="mt-10 px-8 py-3 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-bold uppercase tracking-wider border border-white/30 hover:bg-white/20 transition-all duration-300">Қайталау</button>
                    )}
                  </div>
                )}
              </div>
            </section>
            <section className="py-24 px-8 bg-black flex flex-col items-center">
              <h2 className="text-white/60 text-sm uppercase tracking-[0.3em] mb-10">Тойға дейін қалды:</h2>
              <div className="flex gap-4">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="flex flex-col items-center min-w-[70px]">
                    <div className="text-4xl font-black text-white mb-1">{value}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest">{unit === 'days' ? 'күн' : unit === 'hours' ? 'сағат' : unit === 'minutes' ? 'мин' : 'сек'}</div>
                  </div>
                ))}
              </div>
              <p className="mt-16 text-white/30 text-[10px] uppercase tracking-widest">Кездескенше асыға күтеміз!</p>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default App
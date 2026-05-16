import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const videos = [
  '/assets/videos/video2.mp4'
]

const hallPhotos = [
  '/assets/photos/hall2.jpg', // Swapped with 1
  '/assets/photos/hall1.jpg',
  '/assets/photos/hall3.jpg',
  '/assets/photos/hall4.jpg',
  '/assets/photos/hall5.jpg'
]

const MAX_VOLUME = 0.02 // Reduced by another 15% from 0.024

function App() {
  const [step, setStep] = useState('intro')
  const [name, setName] = useState('')
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
    const targetDate = new Date('August 1, 2026 17:00:00').getTime()
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
    const timer = setTimeout(() => setReadyStates(prev => ({ ...prev, audio: true })), 4000)
    return () => {
      audio.removeEventListener('canplaythrough', checkAudioReady)
      clearTimeout(timer)
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    }
  }, [])

  // Video readiness
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const checkVideoReady = () => setReadyStates(prev => ({ ...prev, video: true }))
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

  // Remove loader
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
      gsap.fromTo('.intro-content > *', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, stagger: 0.2, ease: 'power3.out', delay: 0.5 })
    }
  }, [isStarted])

  useEffect(() => {
    if (!isStarted) return
    gsap.set(['.hall-section', '.calendar-section', '.location-section', '.countdown-section'], { opacity: 1, y: 0 })
    gsap.fromTo('.rsvp-section-content', { opacity: 0, y: 100 }, {
      opacity: 1, y: 0, duration: 1,
      scrollTrigger: {
        trigger: '.rsvp-section',
        start: 'top 60%',
        toggleActions: 'play none none reverse'
      }
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
    if (status === 'no') { finalizeRSVP(name, 'no', 'no') }
    else { gsap.to('.attendance-selector', { opacity: 0, scale: 0.8, duration: 0.8, onComplete: () => setStep('spouse') }) }
  }

  const handleSpouseSubmit = (choice) => {
    setWithSpouse(choice)
    finalizeRSVP(name, attendance, choice)
  }

  const finalizeRSVP = async (name, att, spouse) => {
    setSubmitCount(prev => prev + 1)
    const token = '8702257119:AAEDlbzQ46yFtnpi_qrC72JFmIoWr0fO09Q'
    const chatId = '-5076655439'
    const message = `🆕 *Жаңа жауап:*\n👤 *Есімі:* ${name}\n✅ *Келе ме?:* ${att === 'yes' ? 'Иә, келеді' : 'Жоқ, келе алмайды'}\n💑 *Жұбайымен:* ${spouse === 'yes' ? 'Иә' : 'Жоқ'}`.trim()
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }) })
    } catch (err) { console.error("Telegram Error:", err) }
    setStep('success')
  }

  const handleVideoEnd = () => { setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length) }

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const weekdays = ['ДС', 'СС', 'СР', 'БС', 'ЖМ', 'СБ', 'ЖБ']

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center font-serif-elegant">
      {isLoading && (
        <div className="loader-screen fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-white/10 border-t-white/80 rounded-full animate-spin mb-6"></div>
          <p className="text-white/40 text-[9px] uppercase tracking-[0.5em] animate-pulse">Жүктелуде</p>
        </div>
      )}
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none flex justify-center">
        <div className="relative w-full max-w-[500px] h-full overflow-hidden bg-[#0a0a0a]">
          <video 
            ref={videoRef} 
            key={videos[currentVideoIndex]} 
            autoPlay 
            muted 
            playsInline 
            loop 
            preload="auto" 
            onEnded={handleVideoEnd} 
            className="absolute min-w-full min-h-full object-cover opacity-80 scale-105 blur-[8px]"
          >
            <source src={videos[currentVideoIndex]} type="video/mp4" />
          </video>
          {[...Array(15)].map((_, i) => (
            <div key={i} ref={el => petalsRef.current[i] = el} className="absolute -top-10 w-1.5 h-1.5 bg-white/20 rounded-full blur-[1px] pointer-events-none" style={{ left: `${Math.random() * 100}%` }} />
          ))}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </div>

      {!isStarted && (
        <div ref={overlayRef} className="fixed inset-0 z-[60] flex flex-col items-center justify-center backdrop-blur-3xl bg-black/60" />
      )}

      {!isLoading && (
        <button ref={musicBtnRef} onClick={isStarted ? toggleMusic : startSite} className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5 backdrop-blur-2xl flex items-center justify-center hover:bg-white/10 shadow-2xl border border-white/10 scale-110">
          {isMuted ? (
            <svg className="music-icon w-12 h-12 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="music-icon w-12 h-12 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      )}

      <div ref={mainRef} className={`relative w-full max-w-[500px] z-10 bg-transparent no-scrollbar overflow-x-hidden ${!isStarted ? 'h-screen overflow-hidden' : ''}`}>
        {isStarted && (
          <div className="flex flex-col w-full">
            <section className="intro-content min-h-screen flex flex-col items-center justify-center p-6 py-20 text-center">
              <div className="flex flex-col gap-2 mb-10 text-white/60 uppercase tracking-[0.3em] text-[14px] font-sans">
                <p>ҚҰРМЕТТІ</p>
                <p>АҒАЙЫН-ТУЫС, БАУЫРЛАР,</p>
                <p>ҚҰДА-ЖЕКЖАТ, НАҒАШЫ-ЖИЕН,</p>
                <p>БӨЛЕЛЕР, ҚҰРБЫ-ҚҰРДАС,</p>
                <p>ДОС-ЖАРАНДАР, ӘРІПТЕСТЕР,</p>
                <p>КӨРШІЛЕР!</p>
              </div>
              
              <h2 className="text-white font-['Marck_Script'] text-8xl md:text-9xl mb-8 drop-shadow-2xl drop-shadow-white/20">Аделия</h2>
              
              <div className="flex flex-col gap-2 text-base md:text-lg font-light text-white/90 tracking-[0.15em] leading-relaxed uppercase">
                <p className="text-lg tracking-[0.3em] mb-4">СІЗДЕРДІ</p>
                <p>ҚЫЗЫМЫЗДЫҢ QYZ UZATU</p>
                <p>ТОЙЫНА АРНАЛҒАН</p>
                <p>САЛТАНАТТЫ</p>
                <p>АҚ ДАСТАРХАНЫМЫЗДЫҢ</p>
                <p>ҚАДІРЛІ ҚОНАҒЫ БОЛУҒА</p>
                <p className="mt-4 tracking-[0.4em]">ШАҚЫРАМЫЗ!</p>
              </div>

              <div className="mt-16 w-px h-24 bg-gradient-to-b from-white/40 to-transparent"></div>
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce font-sans"><div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-1 text-white/40">↓</div></div>
            </section>

            <section className="hall-section py-20 px-6 flex flex-col gap-12 bg-black/20 backdrop-blur-sm text-center">
              <h2 className="text-white text-3xl font-bold drop-shadow-lg uppercase tracking-widest">Fiesta Hall</h2>
              {hallPhotos.map((photo, i) => (
                <div key={i} className="hall-photo-item w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10"><img src={photo} alt={`Hall ${i + 1}`} className="w-full h-full object-cover" /></div>
              ))}
            </section>

            <section className="location-section py-12 px-8 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border-white/5 text-center">
              <a 
                href="https://2gis.kz/astana/geo/70000001046438689/71.388985,51.147780" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-4 py-8 px-12 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-500 hover:scale-105 shadow-2xl"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(40,161,23,0.4)] group-hover:animate-bounce">
                  <img src="/assets/2gis.webp" alt="2GIS" className="w-full h-full object-cover" />
                </div>
                <div className="text-center">
                  <span className="block text-white/40 text-[10px] uppercase tracking-[0.3em] mb-1 font-sans">Локация</span>
                  <span className="block text-white text-xl font-bold tracking-widest uppercase">2ГИС ПЕН АШУ</span>
                </div>
              </a>
              <p className="mt-6 text-white font-medium tracking-widest text-center drop-shadow-lg">Шоссе Коргалжын, 13/9</p>
            </section>

            <section className="calendar-section py-24 px-8 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border-y border-white/5">
              <h3 className="font-['Great_Vibes'] text-5xl text-white mb-10 text-center">Той салтанаты:</h3>
              <div className="text-center mb-10">
                <p className="text-2xl text-white tracking-[0.2em] font-light">1 ТАМЫЗ 2026 ЖЫЛ</p>
              </div>
              <div className="w-full max-w-[320px]">
                <div className="grid grid-cols-7 mb-4 text-center">
                  {weekdays.map(d => <div key={d} className="text-[10px] text-white/40 font-sans font-bold">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-4">
                  {[...Array(5)].map((_, i) => <div key={`empty-${i}`} />)}
                  {days.map(d => (
                    <div key={d} className="relative flex items-center justify-center aspect-square">
                      {d === 1 && (
                        <div className="absolute inset-0 flex items-center justify-center scale-150 text-red-500/80 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </div>
                      )}
                      <span className={`relative z-10 text-lg ${d === 1 ? 'text-white font-bold' : 'text-white/80'}`}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-12 text-center border-t border-white/10 pt-8 w-full uppercase">
                <p className="text-white/60 tracking-widest text-sm font-light uppercase text-center">САҒАТ 17:00 - ДЕ БАСТАЛАДЫ</p>
              </div>
            </section>

            <section className="rsvp-section min-h-screen flex flex-col items-center justify-center p-8 relative">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
              <div className="rsvp-section-content relative z-10 w-full flex flex-col items-center">
                {step === 'intro' && (
                  <div className="text-center animate-fadeIn flex flex-col items-center gap-12">
                    <button onClick={() => setStep('name')} className="group relative px-12 py-4 overflow-hidden rounded-full border-2 border-white transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl font-sans">
                      <span className="relative z-10 text-white text-lg font-bold uppercase tracking-widest transition-colors duration-500 group-hover:text-black">Тойға жауап беру</span>
                      <div className="absolute inset-0 z-0 bg-white translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                    </button>
                  </div>
                )}
                {step === 'name' && (
                  <form onSubmit={handleNameSubmit} className="name-form text-center w-full">
                    <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-lg">Кімдер келеді?</h2>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Есімдерді жазыңыз" className="w-full px-6 py-4 text-center bg-white/10 backdrop-blur-md rounded-full border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white focus:bg-white/20 transition-all duration-300 font-sans" autoFocus />
                    <button type="submit" className="w-full mt-8 py-4 bg-white/20 hover:bg-white/30 border border-white/40 rounded-full text-white font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg font-sans">Жалғастыру</button>
                  </form>
                )}
                {step === 'attendance' && (
                  <div className="attendance-selector text-center w-full font-sans">
                    <h2 className="text-2xl font-bold text-white mb-10 drop-shadow-lg">Тойға келесіз бе?</h2>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => handleAttendanceSubmit('yes')} className="w-full py-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 text-white text-xl font-medium hover:bg-white/20">Әрине, келемін!</button>
                      <button onClick={() => handleAttendanceSubmit('no')} className="w-full py-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 text-white text-xl font-medium hover:bg-white/20">Өкінішке орай, келе алмаймын</button>
                    </div>
                  </div>
                )}
                {step === 'spouse' && (
                  <div className="spouse-selector text-center w-full font-sans">
                    <h2 className="text-2xl font-bold text-white mb-10 drop-shadow-lg">Жұбайыңызбен келесіз бе?</h2>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => handleSpouseSubmit('yes')} className="w-full py-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 text-white text-xl font-medium hover:bg-white/20">Иә, жұбайыммен</button>
                      <button onClick={() => handleSpouseSubmit('no')} className="w-full py-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 text-white text-xl font-medium hover:bg-white/20">Жалғыз келемін</button>
                    </div>
                  </div>
                )}
                {step === 'success' && (
                  <div className="success-message text-center">
                    <div className="mb-6"><svg className="w-20 h-20 mx-auto text-white/80 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg font-sans">Рахмет, {userName}!</h2>
                    <p className="text-lg text-white/80 mb-2 drop-shadow-lg font-sans">{attendance === 'yes' ? 'Жауабыңыз қабылданды, тойда кездескенше!' : 'Жауабыңыз қабылданды'}</p>
                    {submitCount < 2 && (
                      <button onClick={() => { setStep('intro'); setName(''); setAttendance(''); setWithSpouse(''); setUserName(''); }} className="mt-10 px-8 py-3 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-bold uppercase tracking-wider border border-white/30 hover:bg-white/20 transition-all duration-300 font-sans">Қайталау</button>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="countdown-section py-24 px-8 bg-black flex flex-col items-center text-center">
              <h2 className="text-white/60 text-sm uppercase tracking-[0.3em] mb-10 font-sans">Тойға дейін қалды:</h2>
              <div className="flex gap-4 font-sans justify-center">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="flex flex-col items-center min-w-[70px]">
                    <div className="text-4xl font-black text-white mb-1">{value}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest">{unit === 'days' ? 'күн' : unit === 'hours' ? 'сағат' : unit === 'minutes' ? 'мин' : 'сек'}</div>
                  </div>
                ))}
              </div>
              <p className="mt-16 text-white/30 text-[10px] uppercase tracking-widest font-sans tracking-[0.5em]">Кездескенше асыға күтеміз!</p>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
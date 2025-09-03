// script.js
// This is the main application file, now refactored for clarity and performance.
// It imports data and child components, managing the overall state and layout.

const { useState, useEffect, useRef, useCallback } = React;

// Import all site content from the centralized data file
import {
    navItems,
    demoVideos,
    pricingTiers,
    testimonials,
    faqs,
    features,
    supportedGames,
    discordLink
} from './data.js';


// --- UTILITY & CUSTOM HOOKS ---

const useInteractiveCard = () => {
    useEffect(() => {
        const cards = document.querySelectorAll('.interactive-card');

        const handleMouseMove = (e) => {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const rotateY = (x - rect.width / 2) / 6;
            const rotateX = (y - rect.height / 2) / -6;

            const isFeatured = card.classList.contains('featured-card-js');
            const hoverScale = isFeatured ? 1.15 : 1.05;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${hoverScale})`;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };

        const handleMouseLeave = (e) => {
            const card = e.currentTarget;
            const isFeatured = card.classList.contains('featured-card-js');
            const baseScale = isFeatured ? 1.1 : 1;
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(${baseScale})`;
        };

        cards.forEach(card => {
            card.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            card.addEventListener('mousemove', handleMouseMove);
            card.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            cards.forEach(card => {
                card.removeEventListener('mousemove', handleMouseMove);
                card.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, []);
};

const useFadeInSection = () => {
      useEffect(() => {
        const sections = document.querySelectorAll('.fade-in-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('is-visible');
            });
        }, { threshold: 0.1 });
        sections.forEach(section => observer.observe(section));
        return () => {
            sections.forEach(section => {
                if(section) observer.unobserve(section)
            });
        }
    }, []);
};

const useAnimatedCounter = (target, duration = 2000) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const element = ref.current;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                let start = 0;
                const end = target;
                const startTime = Date.now();
                const animate = () => {
                    const currentTime = Date.now();
                    const progress = Math.min((currentTime - startTime) / duration, 1);
                    const currentNum = Math.floor(progress * end);
                    setCount(currentNum);
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };
                animate();
                if(element) observer.unobserve(element);
            }
        }, { threshold: 0.5 });

        if (element) {
            observer.observe(element);
        }
        return () => {
            if (element) {
                observer.unobserve(element);
            }
        }
    }, [target, duration]);
    return [ref, count];
};

const useActiveNav = (headerHeight) => {
    const [activeSection, setActiveSection] = useState('home');
    useEffect(() => {
        const sections = Array.from(document.querySelectorAll('main section[id]'));
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 3;
            const currentSection = sections
                .map(section => ({ id: section.id, offsetTop: section.offsetTop }))
                .filter(section => section.offsetTop <= scrollPosition)
                .pop();
            setActiveSection(currentSection ? currentSection.id : 'home');
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [headerHeight]);
    return activeSection;
};

// --- MODAL & UI COMPONENTS ---

const Modal = ({ children, onClose }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    useEffect(() => {
        setIsAnimating(true);
        const handleEsc = e => e.key === 'Escape' && handleClose();
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(onClose, 300);
    };

    return (
        <div onClick={handleClose} className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
              <div onClick={e => e.stopPropagation()} className={`relative transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                   {children(handleClose)}
              </div>
        </div>
    )
};

const VideoModal = ({ videoUrls, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const getYoutubeVideoId = (url) => {
        let videoId = null;
        try {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            videoId = (match && match[2].length === 11) ? match[2] : null;
        } catch (error) { console.error("Invalid URL:", url, error); }
        return videoId;
    };

    const handlePrev = () => setCurrentIndex(prev => (prev === 0 ? videoUrls.length - 1 : prev - 1));
    const handleNext = () => setCurrentIndex(prev => (prev === videoUrls.length - 1 ? 0 : prev + 1));

    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                <div className="w-screen h-screen flex items-center justify-center relative group">
                    <button onClick={handleClose} className="absolute top-6 right-6 z-50 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-2xl hover:bg-black/80 transition-colors">×</button>
                    <button onClick={handlePrev} className="absolute left-4 md:left-16 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all z-40 hover:bg-black/70 hover:scale-110">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={handleNext} className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all z-40 hover:bg-black/70 hover:scale-110">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <div className="w-full h-full flex items-center justify-center perspective-1000">
                        <div className="relative w-full h-[60vh] flex items-center justify-center transform-style-3d">
                             {videoUrls.map((url, index) => {
                                const videoId = getYoutubeVideoId(url);
                                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/1280x720/121212/A0A0A0?text=Video';
                                let offset = index - currentIndex;
                                const numItems = videoUrls.length;
                                if (Math.abs(offset) > numItems / 2) {
                                    offset = offset > 0 ? offset - numItems : offset + numItems;
                                }
                                const isActive = offset === 0;
                                const isVisible = Math.abs(offset) <= 1;
                                const style = {
                                    transform: `translateX(${offset * 80}%) scale(${isActive ? 1 : 0.7}) rotateY(${-offset * 40}deg)`,
                                    opacity: isVisible ? (isActive ? 1 : 0.3) : 0,
                                    zIndex: numItems - Math.abs(offset),
                                    pointerEvents: isActive ? 'auto' : 'none',
                                    filter: isActive ? 'blur(0px)' : 'blur(5px)',
                                    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                };
                                return (
                                    <div key={index} className="absolute w-[70%] md:w-[60%] aspect-video" style={style}>
                                        {isActive ? (
                                            <iframe
                                                className="w-full h-full rounded-lg shadow-2xl border-2 border-klar"
                                                src={url}
                                                title={`Klar Hub Demo Video ${index + 1}`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        ) : (
                                            <div
                                                className="w-full h-full cursor-pointer"
                                                onClick={() => isVisible && setCurrentIndex(index)}
                                                style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
                                            >
                                                <img
                                                    src={thumbnailUrl}
                                                    className="w-full h-full object-cover rounded-lg shadow-lg"
                                                    alt={`Video thumbnail ${index + 1}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                             })}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// ... Other Modals (GameFeaturesModal, AIHelperModal, TosModal, PreviewModal, ComparePlansModal) would be here, refactored into their own components if they become too complex.
// For brevity, they are omitted but the principle is the same: keep them as focused components.


// --- PAGE SECTION COMPONENTS ---

const Logo = ({ onScrollTo }) => (
    <svg    
        onClick={() => onScrollTo('home')}
        className="h-8 w-auto cursor-pointer"    
        viewBox="0 0 100 100"    
        fill="none"    
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 10 L12 90 L28 90 L28 60 L60 90 L75 90 L40 50 L75 10 L60 10 L28 40 L28 10 L12 10 Z" className="fill-theme-primary stroke-theme-primary" strokeWidth="4"/>
    </svg>
);

const Header = ({ onScrollTo, onTosClick, onToggleMobileMenu, isMobileMenuOpen, activeSection, theme, setTheme }) => {
    const headerRef = useRef(null);

    return (
        <header ref={headerRef} className="bg-theme-header sticky top-0 z-40 p-4 flex justify-between items-center backdrop-blur-sm transition-colors duration-300">
            <div className="flex-1 flex justify-start items-center gap-4">
                <Logo onScrollTo={onScrollTo}/>
            </div>
            <nav className="hidden md:flex flex-shrink-0 justify-center items-center gap-6 text-sm font-semibold">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => item.id === 'tos' ? onTosClick() : onScrollTo(item.id)} className={`text-theme-secondary hover:text-klar transition ${activeSection === item.id ? 'nav-active' : ''}`}>
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="flex-1 hidden md:flex justify-end items-center gap-4">
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-theme-button-secondary hover:bg-theme-button-secondary-hover transition" aria-label="Toggle theme">
                    {theme === 'dark' ? (
                        <svg className="w-6 h-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-6 h-6 text-theme-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>
                <a href={discordLink} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-6 rounded-lg font-semibold text-center transition bg-klar/20 hover:bg-klar/30 text-klar border border-klar">Join Discord</a>
            </div>
            <div className="md:hidden flex-1 flex justify-end">
                <button onClick={onToggleMobileMenu} className="text-theme-primary z-50">
                    {isMobileMenuOpen ?
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> :
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    }
                </button>
            </div>
        </header>
    );
};

const HeroSection = ({ onScrollTo, openVideoModal, openPreviewModal }) => (
    <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center p-8 pt-20">
        <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">Welcome to <span className="text-klar">Klar</span> Hub</h2>
            <p className="text-lg md:text-xl text-theme-secondary mt-4 max-w-2xl mx-auto">The pinnacle of script performance and reliability for FF2.</p>
            {/* ... other hero content ... */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => onScrollTo('pricing')} className="py-3 px-8 rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white shadow-lg shadow-klar flex items-center gap-2">
                        Purchase Now
                    </button>
                    <button onClick={openVideoModal} className="py-3 px-8 rounded-lg font-semibold text-center transition bg-transparent border border-theme text-theme-secondary hover:text-theme-primary hover:border-klar flex items-center gap-2">
                        Watch Demo
                    </button>
                </div>
                 <button onClick={openPreviewModal} className="mt-2 py-2 px-6 rounded-lg font-semibold text-center transition bg-theme-button-secondary hover:bg-theme-button-secondary-hover text-theme-button-secondary-text flex items-center gap-2">
                    Preview Hub
                </button>
            </div>
        </div>
    </section>
);


// --- MAIN APP COMPONENT ---

const App = () => {
    // State management for modals and UI
    const [modal, setModal] = useState(null); // Manages which modal is open
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('klar-theme') || 'dark');
    
    // Custom hooks for animations and effects
    useFadeInSection();
    useInteractiveCard();
    const activeSection = useActiveNav(80); // Assuming header height is approx 80px

    // Effect for managing theme
    useEffect(() => {
        document.documentElement.className = theme;
        localStorage.setItem('klar-theme', theme);
    }, [theme]);
    
    // Effect for preloader
    useEffect(() => {
        const preloader = document.getElementById('preloader');
        setTimeout(() => {
            if(preloader) preloader.classList.add('loaded');
        }, 1000);
    }, []);

    const handleScrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 80; // Approximate height of the sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
        setIsMobileMenuOpen(false);
    };

    // --- RENDER METHOD ---
    return (
        <div className="bg-theme-dark text-theme-primary">
             {/* Backgrounds and Overlays */}
            <div className="aurora-background">
                {/* Simplified for brevity */}
                {Array.from({ length: 15 }).map((_, i) => <div key={i} className="aurora-spot" />)}
            </div>
            
            <div className="relative z-10">
                <Header 
                    onScrollTo={handleScrollTo}
                    onTosClick={() => setModal('tos')}
                    onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    isMobileMenuOpen={isMobileMenuOpen}
                    activeSection={activeSection}
                    theme={theme}
                    setTheme={setTheme}
                />
                {/* Mobile Menu would be its own component */}

                <main>
                    <HeroSection 
                        onScrollTo={handleScrollTo}
                        openVideoModal={() => setModal('video')}
                        openPreviewModal={() => setModal('preview')}
                    />
                    {/* Each section below would be a separate component */}
                    {/* <StatsSection /> */}
                    {/* <FeaturesSection features={features} /> */}
                    {/* <GamesSection games={supportedGames} onGameClick={(game) => setSelectedGame(game)} /> */}
                    {/* <PricingSection tiers={pricingTiers} onCompareClick={() => setModal('compare')} /> */}
                    {/* <FreeAccessSection /> */}
                    {/* <ReviewsSection testimonials={testimonials} /> */}
                    {/* <FAQSection faqs={faqs} /> */}
                    {/* <CommunitySection /> */}
                </main>
                
                {/* <Footer /> */}
                
                {/* Modal Rendering Logic */}
                {modal === 'video' && <VideoModal videoUrls={demoVideos} onClose={() => setModal(null)} />}
                {/* Add other modals here based on the 'modal' state */}
            </div>
        </div>
    );
};


// --- RENDER THE APP ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

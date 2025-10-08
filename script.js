const { useState, useEffect, useRef, useCallback, useMemo } = React;

// --- ALL COMPONENTS DEFINED BEFORE App ---
const SnowfallEffect = () => {
    useEffect(() => {
        const container = document.getElementById('snow-container');
        if (!container) return;

        const createSnowflake = () => {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';

            const size = Math.random() * 3 + 1;
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${Math.random() * 100}%`;
            const duration = Math.random() * 5 + 10;
            snowflake.style.animationDuration = `${duration}s`;
            const delay = Math.random() * -15;
            snowflake.style.animationDelay = `${delay}s`;

            container.appendChild(snowflake);
        };

        const snowflakeCount = 50;
        for (let i = 0; i < snowflakeCount; i++) {
            createSnowflake();
        }

        const setContainerHeight = () => {
            container.style.height = `${document.documentElement.scrollHeight}px`;
        };
        setContainerHeight();
        window.addEventListener('resize', setContainerHeight);
        window.addEventListener('load', setContainerHeight);

        return () => {
            window.removeEventListener('resize', setContainerHeight);
            window.removeEventListener('load', setContainerHeight);
            if (container) container.innerHTML = '';
        };
    }, []);
    return null;
};

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

const useMarqueeInteraction = () => {
    useEffect(() => {
        const marquees = document.querySelectorAll('.marquee-content');
        marquees.forEach(marquee => {
            const cards = marquee.querySelectorAll('.interactive-card');
            const handleMouseEnter = () => marquee.style.animationPlayState = 'paused';
            const handleMouseLeave = () => marquee.style.animationPlayState = 'running';
            cards.forEach(card => {
                card.addEventListener('mouseenter', handleMouseEnter);
                card.addEventListener('mouseleave', handleMouseLeave);
            });
            return () => {
                cards.forEach(card => {
                    card.removeEventListener('mouseenter', handleMouseEnter);
                    card.removeEventListener('mouseleave', handleMouseLeave);
                });
            };
        });
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
                    if (progress < 1) requestAnimationFrame(animate);
                };
                animate();
                if(element) observer.unobserve(element);
            }
        }, { threshold: 0.5 });
        if (element) observer.observe(element);
        return () => {
            if (element) observer.unobserve(element);
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

const Logo = () => (
    <a href="#home" className="cursor-pointer">
        <svg className="h-8 w-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 10 L12 90 L28 90 L28 60 L60 90 L75 90 L40 50 L75 10 L60 10 L28 40 L28 10 L12 10 Z" className="fill-theme-primary stroke-theme-primary" strokeWidth="4"/>
        </svg>
    </a>
);

const AuroraBackground = () => {
    const [spots] = useState(() =>
        Array.from({ length: 15 }).map(() => ({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: `${Math.floor(Math.random() * 300 + 200)}px`,
            parallaxFactor: Math.random() * 0.5 + 0.2,
        }))
    );
    const spotRefs = useRef(spots.map(() => React.createRef()));
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            spotRefs.current.forEach((ref, i) => {
                if (ref.current) ref.current.style.transform = `translateY(${scrollY * spots[i].parallaxFactor}px)`;
            });
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [spots]);
    return (
        <div className="aurora-background">
            {spots.map((spot, i) => (
                <div key={i} ref={spotRefs.current[i]} className="aurora-spot" style={{ top: spot.top, left: spot.left, width: spot.size, height: spot.size }} />
            ))}
        </div>
    );
};

const GlowingText = ({ text }) => {
    const words = text.split(' ');
    return (
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
            {words.map((word, wordIndex) => (
                <span key={wordIndex} className="mr-4">
                    {word.split('').map((char, charIndex) => (
                        <span key={charIndex} className={`glowing-letter ${word === 'Klar' ? 'text-klar' : ''}`}>{char}</span>
                    ))}
                </span>
            ))}
        </h2>
    );
};

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
    );
};

const VideoModal = ({ videoUrls, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const getYoutubeVideoId = (url) => {
        let videoId = null;
        try {
            const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            videoId = (match && match[1].length === 11) ? match[1] : null;
        } catch (error) { console.error("Invalid URL:", url, error); }
        return videoId;
    };
    const handlePrev = () => setCurrentIndex(prev => (prev === 0 ? videoUrls.length - 1 : prev - 1));
    const handleNext = () => setCurrentIndex(prev => (prev === videoUrls.length - 1 ? 0 : prev + 1));
    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/50 w-[95vw] h-[95vh] lg:w-[85vw] max-w-7xl border border-klar flex flex-col p-4 md:p-6 relative">
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                        <button onClick={handleClose} className="text-theme-secondary hover:text-klar text-3xl transition-colors" aria-label="Close video player">×</button>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-center text-theme-primary mb-4">Klar Hub Demo Videos</h3>
                    <div className="flex-grow relative flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-2xl shadow-klar/40 p-2">
                        <iframe className="w-full h-full aspect-video" src={videoUrls[currentIndex]} title={`Klar Hub Demo Video ${currentIndex + 1}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all hover:bg-klar hover:scale-110 opacity-80 hover:opacity-100 z-10" aria-label="Previous Video">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all hover:bg-klar hover:scale-110 opacity-80 hover:opacity-100 z-10" aria-label="Next Video">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                    <div className="mt-4 flex justify-center gap-3 overflow-x-auto custom-scrollbar flex-shrink-0 py-2">
                        {videoUrls.map((url, index) => {
                            const videoId = getYoutubeVideoId(url);
                            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 'https://placehold.co/320x180/121212/A0A0A0?text=Video';
                            return (
                                <div key={index} className={`flex-shrink-0 w-48 h-28 cursor-pointer rounded-lg overflow-hidden transition-all duration-300 relative group ${currentIndex === index ? 'ring-2 ring-klar scale-105' : 'opacity-70 hover:opacity-100'}`} onClick={() => setCurrentIndex(index)}>
                                    <img src={thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={`Video thumbnail ${index + 1}`} onError={(e) => e.target.src = 'https://placehold.co/320x180/121212/A0A0A0?text=Video'}/>
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <svg className={`w-8 h-8 text-white ${currentIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </Modal>
    );
};

const GameFeaturesModal = ({ game, onClose }) => {
    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                <div className="bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/50 w-full max-w-4xl border border-white/10">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-theme-primary">{game.name} Features</h3>
                        <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl transition-colors" aria-label="Close features modal">×</button>
                    </div>
                    <div className="p-6">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-theme-secondary">
                            {game.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3 p-4 rounded-md transition-colors hover:bg-white/5">
                                    <svg className="w-6 h-6 text-klar flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </Modal>
    );
};

const AIHelperModal = ({ onClose }) => {
    const [input, setInput] = useState('');
    const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: 'Hello! I am Klaro, the official AI assistant for Klar Hub. How can I help you dominate the field today? Feel free to ask about features, pricing, or anything else!' }]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

    const callGeminiAPI = async (userPrompt) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userPrompt, history: chatHistory })
            });
            if (!response.ok) throw new Error('Network response was not ok.');
            const result = await response.json();
            if (result.text) {
                setChatHistory(prev => [...prev, { role: 'ai', text: result.text }]);
            } else {
                throw new Error("Received an empty response from the AI assistant.");
            }
        } catch (err) {
            console.error("AI Helper Error:", err);
            setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, the AI assistant is currently experiencing issues. Please try again later or join our Discord for help.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = (prompt) => {
        if (!prompt.trim() || isLoading) return;
        setChatHistory(prev => [...prev, { role: 'user', text: prompt }]);
        callGeminiAPI(prompt);
        setInput('');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const quickQuestions = ["What are the features for FF2?", "How much is lifetime access?", "Is Klar Hub safe to use?"];

    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                <div className="bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/50 w-full max-w-2xl h-[80vh] flex flex-col border border-white/10">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                        <h3 className="text-lg font-bold text-theme-primary">AI Script Helper</h3>
                        <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl" aria-label="Close AI helper">×</button>
                    </div>
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-klar text-white' : 'bg-theme-button-secondary text-theme-button-secondary-text'}`}>
                                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^- (.*?)(?:\n|$)/gm, '<li>$1</li>').replace(/<li>/g, '<ul class="list-disc ml-4"><li>').replace(/<\/li>(\s*)<ul/g, '</li></ul><ul').replace(/<\/li>\s*$/g, '</li></ul>') }}></p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-theme-button-secondary text-theme-button-secondary p-3 rounded-lg flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    {chatHistory.length === 1 && (
                        <div className="p-4 border-t border-white/10 flex-shrink-0">
                            <p className="text-sm text-theme-secondary mb-2 text-center">Or try one of these:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {quickQuestions.map(q => (
                                    <button key={q} onClick={() => sendMessage(q)} className="bg-theme-button-secondary hover:bg-theme-button-secondary-hover text-theme-button-secondary-text text-sm px-3 py-1 rounded-full transition">{q}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleFormSubmit} className="p-4 border-t border-white/10 flex gap-2 flex-shrink-0">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." className="w-full bg-theme-button-secondary border border-theme rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-klar p-3 transition-shadow duration-300 focus:shadow-[0_0_15px_var(--klar-primary)]" aria-label="Ask a question to AI helper" />
                        <button type="submit" className="bg-klar hover:bg-klar-light text-white font-bold p-3 rounded-lg flex items-center justify-center transition-transform hover:scale-105" disabled={isLoading} aria-label="Send message">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                        </button>
                    </form>
                </div>
            )}
        </Modal>
    );
};

// ... (Other components like TosModal, ChangelogModal, Toast, Header, MobileMenu, BackToTopButton, AIHelperButton, Footer remain the same)
// ... existing code ...
const TosModal = ({ onClose }) => {
    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                   <div className="bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/50 w-full max-w-2xl border border-white/10">
                       <div className="p-4 border-b border-white/10 flex justify-between items-center">
                           <h3 className="text-xl font-bold text-theme-primary">Terms & Conditions</h3>
                           <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl" aria-label="Close terms and conditions">&times;</button>
                       </div>
                       <div className="p-6 space-y-4 text-theme-secondary max-h-[70vh] overflow-y-auto custom-scrollbar">
                           <p><strong className="text-theme-primary">Refund Policy:</strong> All sales are final. Due to the digital nature of our products, we do not offer refunds once a purchase is completed. Please review all features and compatibility information before buying.</p>
                           <p><strong className="text-theme-primary">License Agreement:</strong> Your license is for personal use only. Account or script sharing is strictly prohibited. Violation of this rule may result in a permanent suspension of your access without a refund.</p>
                           <p><strong className="text-theme-primary">Software Use:</strong> Any attempt to reverse-engineer, decompile, or crack our software is a violation of these terms and applicable laws. We reserve the right to pursue appropriate action and terminate access for such activities.</p>
                           <p><strong className="text-theme-primary">Disclaimer:</strong> Our software is provided 'as-is'. While we strive for 100% uptime and safety, we are not liable for any account actions or issues that may arise from its use. Use at your own discretion.</p>
                       </div>
                   </div>
            )}
        </Modal>
    );
};

const ChangelogModal = ({ onClose }) => {
    const updates = [
        {
            version: "v0.02",
            date: "Oct 08, 2025",
            changes: [
                {type: "NEW", text: "Introducing support for Flag Football!"},
                {type: "IMPROVEMENT", text: "Added a full suite of features for Flag Football, including advanced Magnet, QB Aimbot, Auto-Catch, and more to dominate the field."},
            ]
        },
        {
            version: "v0.01",
            date: "Oct 06, 2025",
            changes: [
                {type: "FIX", text: "Fixed everything with QB Aimbot related to mobile rewrote the calculation, and fixed mobile bugs."},
                {type: "FIX", text: "Fixed some issues with mags."},
                {type: "IMPROVEMENT", text: "Bypassed To Latest Anti Cheat and works for Volcano now I’m pretty sure!"},
                {type: "FIX", text: "Fixed the Position the Auto Rush Cards for PC."},
                {type: "NEW", text: "New Slider Design!"},
                {type: "NEW", text: "Block Reach Added Back!"}
            ]
        }
    ];

    const tagColors = { "FIX": "bg-red-500", "NEW": "bg-green-500", "IMPROVEMENT": "bg-blue-500" };
    const tagShadows = { "FIX": "shadow-[0_0_8px_#ef4444]", "NEW": "shadow-[0_0_8px_#22c55e]", "IMPROVEMENT": "shadow-[0_0_8px_#3b82f6]" };

    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                <div className="bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/50 w-full max-w-2xl border border-white/10">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-theme-primary">What's New</h3>
                        <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl" aria-label="Close changelog">&times;</button>
                    </div>
                    <div className="p-6 space-y-6 text-theme-secondary max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-4 text-xs pb-4 border-b border-white/10">
                            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${tagColors.NEW} ${tagShadows.NEW}`}></div><span>New</span></div>
                            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${tagColors.IMPROVEMENT} ${tagShadows.IMPROVEMENT}`}></div><span>Improvement</span></div>
                            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${tagColors.FIX} ${tagShadows.FIX}`}></div><span>Fix</span></div>
                        </div>
                        {updates.map(update => (
                            <div key={update.version}>
                                <div className="flex items-baseline gap-3">
                                    <h4 className="text-lg font-bold text-theme-primary">{update.version}</h4>
                                    <p className="text-sm text-gray-400">{update.date}</p>
                                </div>
                                <ul className="mt-2 space-y-2">
                                    {update.changes.map((change, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 mt-1.5 w-2 h-2 rounded-full ${tagColors[change.type]} ${tagShadows[change.type]}`}></div>
                                            <span className="flex-1">{change.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Modal>
    );
};

const Toast = ({ message }) => {
    if (!message) return null;
    return <div className="toast-notification">{message}</div>;
};

const Header = ({ headerRef, onToggleMobileMenu, onTosClick, onChangelogClick, activeSection, isMobileMenuOpen, theme, setTheme, isScrolled }) => {
    const discordLink = "https://discord.gg/bGmGSnW3gQ";
    const navItems = [
        { id: 'features', label: 'Features' },
        { id: 'games', label: 'Supported Games' },
        { id: 'pricing', label: 'Pricing' },
        { id: 'free', label: 'Free Access' },
        { id: 'reviews', label: 'Reviews' },
        { id: 'faq', label: 'FAQ' }
    ];
    return (
        <header ref={headerRef} className={`bg-theme-header sticky top-0 z-40 p-4 grid grid-cols-3 items-center backdrop-blur-sm transition-shadow duration-300 ${isScrolled ? 'shadow-lg shadow-black/10' : ''}`}>
            <div className="flex justify-start items-center gap-4"><Logo /></div>
            <nav className="hidden md:flex justify-center items-center gap-6 text-sm font-semibold">
                {navItems.map(item => (<a key={item.id} href={`#${item.id}`} className={`text-theme-secondary hover:text-klar transition ${activeSection === item.id ? 'nav-active' : ''}`}>{item.label}</a>))}
                <button onClick={onChangelogClick} className="text-theme-secondary hover:text-klar transition">What's New</button>
            </nav>
            <div className="hidden md:flex justify-end items-center gap-4">
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-theme-button-secondary hover:bg-theme-button-secondary-hover transition" aria-label="Toggle theme">
                    {theme === 'dark' ? (
                        <svg className="w-6 h-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-6 h-6 text-theme-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>
                <a href={discordLink} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-6 rounded-lg font-semibold text-center transition bg-klar/20 hover:bg-klar/30 text-klar border border-klar">Join Discord</a>
            </div>
            <div className="md:hidden col-start-3 flex justify-end">
                <button onClick={onToggleMobileMenu} className="text-theme-primary z-50" aria-label="Toggle mobile menu">
                    {isMobileMenuOpen ?
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> :
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    }
                </button>
            </div>
        </header>
    );
};

const MobileMenu = ({ isOpen, onTosClick, onClose }) => {
    if (!isOpen) return null;
    const discordLink = "https://discord.gg/bGmGSnW3gQ";
    const navItems = [
        { id: 'features', label: 'Features' },
        { id: 'games', label: 'Supported Games' },
        { id: 'pricing', label: 'Pricing' },
        { id: 'free', label: 'Free Access' },
        { id: 'reviews', label: 'Reviews' },
        { id: 'faq', label: 'FAQ' },
        { id: 'tos', label: 'Terms' }
    ];
    return (
        <div className="fixed top-0 left-0 w-full h-full z-30 bg-theme-dark/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 text-2xl font-bold md-hidden">
            {navItems.map(item => {
                if (item.id === 'tos') {
                    return (<button key={item.id} onClick={() => { onTosClick(); onClose(); }} className="text-theme-secondary hover:text-klar transition">{item.label}</button>)
                }
                return (<a key={item.id} href={`#${item.id}`} onClick={onClose} className="text-theme-secondary hover:text-klar transition">{item.label}</a>)
            })}
            <div className="mt-4"><a href={discordLink} target="_blank" rel="noopener noreferrer" className="inline-block py-3 px-8 text-xl rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white">Join Discord</a></div>
        </div>
    );
};

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) setIsVisible(true);
            else setIsVisible(false);
        };
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);
    return (
        <a href="#home" id="back-to-top" className={`fixed bottom-8 left-8 bg-klar/80 hover:bg-klar text-white w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} aria-label="Back to top">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
        </a>
    );
};

const AIHelperButton = ({ onClick }) => {
    const [showTooltip, setShowTooltip] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowTooltip(false), 7000);
        return () => clearTimeout(timer);
    }, []);
    return (
        <div className="action-button-wrapper fixed bottom-8 right-8 z-40">
            {showTooltip && (
                <div className="initial-tooltip absolute bottom-full mb-3 right-0 w-max bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 pointer-events-none">
                    Have questions? Ask our AI!
                    <div className="absolute right-4 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                </div>
            )}
            <button id="ai-helper-button" onClick={onClick} className="bg-klar/80 hover:bg-klar text-white w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto shadow-lg shadow-klar" aria-label="Open AI Helper">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5m0 16.5v-1.5m3.75-12H21M12 21v-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v16.5M16.5 4.5l-9 15M16.5 19.5l-9-15" /></svg>
            </button>
        </div>
    );
};

const Footer = () => (
    <footer className="w-full p-8 text-center text-gray-500 text-sm">
        <p>© 2025 Klar Hub. All rights reserved.</p>
        <p className="mt-2 font-semibold text-theme-secondary">made by <a href="#" className="hover:text-klar transition-colors">auaqa</a></p>
        <div className="flex justify-center gap-6 mt-4">
            <a href="https://discord.gg/bGmGSnW3gQ" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-klar transition-colors" aria-label="Discord">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.36981C18.7915 3.74873 17.189 3.28434 15.5298 3.00003C15.5298 3.00003 15.1518 3.42189 14.865 3.76878C13.0476 3.22018 11.1492 3.22018 9.423 3.76878C9.135 3.42189 8.7582 3 8.7582 3C7.09901 3.28434 5.49652 3.74873 3.97017 4.36981C0.324569 9.87328 -0.463321 15.1072 0.871542 20.2078C2.6516 21.6213 4.59436 22.548 6.65283 23C7.26284 22.3486 7.80165 21.631 8.256 20.8522C7.38573 20.4866 6.58162 20.021 5.84279 19.4515C6.11591 19.2633 6.3802 19.0664 6.6346 18.8608C10.0322 20.6453 14.2523 20.6453 17.6487 18.8608C17.9031 19.0664 18.1674 19.2633 18.4405 19.4515C17.7017 20.021 16.9064 20.4866 16.0273 20.8522C16.4817 21.631 17.0205 22.3486 17.6305 23C19.689 22.548 21.6317 21.6213 23.4118 20.2078C24.5828 14.2458 23.5938 8.81315 20.317 4.36981ZM8.02004 16.5392C6.88337 16.5392 6.00004 15.503 6.00004 14.1682C6.00004 12.8334 6.88337 11.7972 8.02004 11.7972C9.15671 11.7972 10.04 12.8334 10.0203 14.1682C10.0203 15.503 9.15671 16.5392 8.02004 16.5392ZM16.2687 16.5392C15.132 16.5392 14.2487 15.503 14.2487 14.1682C14.2487 12.8334 15.132 11.7972 16.2687 11.7972C17.4054 11.7972 18.2887 12.8334 18.2689 14.1682C18.2689 15.503 17.4054 16.5392 16.2687 16.5392Z" /></svg>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); console.log('Link not available.'); }} className="text-gray-400 hover:text-klar transition-colors" aria-label="Telegram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 24a12 12 0 1 1 12-12 12.013 12.013 0 0 1-12 12Zm5.74-15.652L6.44 12.27c-.88.39-1.01.76-.23 1.1l2.58 1.12 6.09-3.79c.33-.2.62-.09.35.13l-4.93 4.45-1.15 3.39c.83 0 .81-.38 1.12-.66l1.79-1.63 3.4 2.45c.6.35 1.01.16 1.18-.52l2.1-9.84c.21-.83-.3-1.18-1.04-.84Z"/></svg>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); console.log('Link not available.'); }} className="text-gray-400 hover:text-klar transition-colors" aria-label="Youtube">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" /></svg>
            </a>
        </div>
    </footer>
);

const App = () => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [selectedGame, setSelectedGame] = useState(null);
    const [isTosModalOpen, setIsTosModalOpen] = useState(false);
    const [isChangelogOpen, setIsChangelogOpen] = useState(false);
    const [freeKey, setFreeKey] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('klar-theme') || 'dark');
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('loaded');
            }, 500);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('klar-theme', theme);
        document.body.className = `antialiased ${theme}`;
    }, [theme]);

    useFadeInSection();
    useInteractiveCard();
    useMarqueeInteraction();

    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(80);
    const activeSection = useActiveNav(headerHeight);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if(headerRef.current) {
            const newHeaderHeight = headerRef.current.offsetHeight;
            setHeaderHeight(newHeaderHeight);
            document.documentElement.style.setProperty('--header-height', `${newHeaderHeight}px`);
        }
    }, []);

    const [usersRef, usersCount] = useAnimatedCounter(800);
    const [updatesRef, updatesCount] = useAnimatedCounter(20);
    const [uptimeRef, uptimeCount] = useAnimatedCounter(99);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleCopyScript = () => {
        const keyToUse = freeKey || "insert key";
        const scriptText = `script_key="${keyToUse}";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/50da22b3657a22c353b0dde631cb1dcf.lua"))()`;
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = scriptText;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
            showToast('Script copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy script: ', err);
            showToast('Failed to copy script.');
        } finally {
            document.body.removeChild(tempTextArea);
        }
    };

    const getYoutubeEmbedUrl = (url) => {
        let videoId = null;
        try {
            const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            if (match && match[1].length === 11) videoId = match[1];
        } catch (error) { console.error("Error parsing YouTube URL:", url, error); }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    };

    const initialDemoVideos = [
        "https://www.youtube.com/embed/d2hR2gRhME0", "https://www.youtube.com/embed/97osD4zLYpA", "https://www.youtube.com/embed/03Y0NuUEOV8",
        "https://youtu.be/uxACs35iIsM", "https://youtu.be/4IDALzbt9Iw", "https://youtu.be/gOLeCPYVsyE", "https://youtu.be/BdZbtyQccuY"
    ];

    const demoVideos = useMemo(() => {
        const seenVideoIds = new Set();
        return initialDemoVideos.reduce((acc, url) => {
            const embedUrl = getYoutubeEmbedUrl(url);
            if (embedUrl) {
                const videoId = embedUrl.split('/')[4].split('?')[0];
                if (!seenVideoIds.has(videoId)) {
                    seenVideoIds.add(videoId);
                    acc.push(embedUrl);
                }
            }
            return acc;
        }, []);
    }, []);

    const pricingTiers = [
        { name: '1 Week Klar Access', price: '$1.50', url: 'https://klarhub.sellhub.cx/product/1-Week/', specialTag: 'Most Popular'},
        { name: 'Lifetime Klar', price: '$15.00', url: 'https://klarhub.sellhub.cx/product/New-product/', isFeatured: true },
        { name: 'Extreme Alt Gen', price: '$1.00', url: 'https://klarhub.sellhub.cx/product/Extreme-Alt-Gen/', specialTag: 'On Sale' },
        { name: '1 Month Klar Access', price: '$2.50', url: 'https://klarhub.sellhub.cx/product/1-Month-Klar-Access/', robuxPrice: '450', robuxUrl: 'https://www.roblox.com/catalog/116340932269907/KLAR-1-month' },
        { name: '3 Month Klar Access', price: '$3.75', url: 'https://klarhub.sellhub.cx/product/3-Month-Access/', robuxPrice: '800', robuxUrl: 'https://www.roblox.com/catalog/71184399134072/KLAR-3-Month' },
        { name: '6 Month Klar Access', price: '$5.50', url: 'https://klarhub.sellhub.cx/product/6-Month-Klar-Access/', robuxPrice: '1225', robuxUrl: 'https://www.roblox.com/catalog/134764715699815/KLAR-6-Month' },
    ];

    const allTestimonials = [
        { name: 'Customer', stars: 5, text: "BEST HUB OUT THERE BUY NOW", date: "Sat Sep 27 2025" }, { name: 'Customer', stars: 5, text: "10/10 go buy now 'best script'", date: "Fri Jun 06 2025" },
        { name: 'Customer', stars: 5, text: "best script out there cop now", date: "Fri Jun 06 2025" }, { name: 'Customer', stars: 5, text: "quick asf", date: "Fri Sep 26 2025" },
        { name: 'Customer', stars: 5, text: "good script", date: "Sat Sep 13 2025" }, { name: 'Customer', stars: 5, text: "easiest checkout", date: "Wed Jul 23 2025" },
        { name: 'Customer', stars: 5, text: "Amazing and easy", date: "Wed Jul 16 2025" }, { name: 'Customer', stars: 4, text: "purchase was quick but how do i get it in game and is it safe to use on my main account", date: "Sun Jun 29 2025" }
    ];

    const faqs = [
        { q: "Is Klar Hub a one-time purchase?", a: "We offer both subscription and lifetime access plans. You can choose the one that best suits your needs." },
        { q: "What payment methods are accepted?", a: "We accept all major payment methods through our secure online storefront, including credit cards, PayPal, and more." },
        { q: "What executors are compatible?", a: "Our scripts are designed to be compatible with all major, high-quality executors on the market." },
        { q: "How often are the scripts updated?", a: "We update our scripts regularly to ensure compatibility with the latest Roblox updates and to add new features. Updates are always free for active subscribers or lifetime members." }
    ];
    const features = [
        { title: "Perfect Kicking & Throwing", description: "Achieve perfect accuracy and power on every kick and throw with our kicking aimbot.", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" /></svg> },
        { title: "QB Aimbot", description: "Never miss a throw with our precise quarterback aimbot, featuring prediction and sensitivity controls.", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56v4.82a6 6 0 0 1-1.292 3.536l-1.992-1.992a4.5 4.5 0 0 0-6.364-6.364l-1.992-1.992A6 6 0 0 1 15.59 14.37z" /></svg> },
        { title: "Ball Magnets", description: "Automatically catch passes with our intelligent ball magnet, ensuring you never drop the ball.", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" /></svg> }
    ];
    const supportedGames = [
        { name: "Football Fusion 2", abbr: "FF2", features: ["Ball Magnets", "Pull Vector", "QB Aimbot", "Perfect Kicking", "Enhanced Movement", "No Jump Cooldown", "Tackle Aura", "Anti-AFK"] },
        { name: "Ultimate Football", abbr: "UF", features: ["Football Size Manipulation", "Arm Resize", "Player ESP", "Infinite Stamina", "No-Clip"] },
        { name: "Murders VS Sheriffs Duels", abbr: "MVSD", features: ["Advanced Triggerbot", "Hitbox Extender", "Silent Aim", "Rapid Fire", "Player ESP"] },
        { name: "Arsenal", abbr: "Arsenal", features: ["Silent Aim", "Advanced Hitbox Manipulation", "Unlock All Skins", "Infinite Ammo", "Visual Tags"] },
        { name: "Flag Football", abbr: "New!", features: ["Full Magnet & Aimbot Suite", "Player Enhancements (Speed, Jump)", "Full Auto-Play Suite (Catch, Rush)", "Visual Helpers (ESP, Paths)", "And much more!"] }
    ];

    return (
        <div className="bg-theme-dark text-theme-primary">
            <Toast message={toastMessage} />
            <SnowfallEffect />
            <AuroraBackground />
            <div className="relative z-10">
                <Header headerRef={headerRef} onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} onTosClick={() => setIsTosModalOpen(true)} onChangelogClick={() => setIsChangelogOpen(true)} isMobileMenuOpen={isMobileMenuOpen} activeSection={activeSection} theme={theme} setTheme={setTheme} isScrolled={isScrolled} />
                <MobileMenu isOpen={isMobileMenuOpen} onTosClick={() => { setIsTosModalOpen(true); setIsMobileMenuOpen(false); }} onClose={() => setIsMobileMenuOpen(false)} />
                <main>
                    <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center p-8 pt-20">
                        <div className="relative z-10 fade-in-section">
                            <GlowingText text="Welcome to Klar Hub" />
                            <p className="text-lg md:text-xl text-theme-secondary mt-4 max-w-2xl mx-auto">The most reliable and feature-rich script for FF2, updated constantly to keep you ahead of the competition.</p>
                            <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6 text-theme-secondary">
                                <div className="flex items-center gap-2"><svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>100% Undetected</span></div>
                                <div className="flex items-center gap-2"><svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg><span>Lightning Fast</span></div>
                                <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg><span>Premium Quality</span></div>
                            </div>
                            <div className="mt-8 flex flex-col items-center justify-center gap-4">
                               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                   <a href="#pricing" className="py-3 px-8 rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white shadow-lg shadow-klar flex items-center gap-2 hero-button"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>Purchase Now</a>
                                   <button onClick={() => setIsVideoModalOpen(true)} className="py-3 px-8 rounded-lg font-semibold text-center transition bg-transparent border border-theme text-theme-secondary hover:text-theme-primary hover:border-klar flex items-center gap-2 hero-button"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" /></svg>Watch Demo</button>
                               </div>
                                <p className="text-lg text-theme-secondary mt-4">Join our active community on Discord!</p>
                            </div>
                        </div>
                    </section>
                    <div className="w-full max-w-6xl mx-auto px-4 space-y-24">
                        <section id="stats" className="py-12 fade-in-section">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div ref={usersRef}><p className="text-5xl font-extrabold text-klar">{usersCount.toLocaleString()}+</p><p className="text-lg text-theme-secondary mt-2">Active Users</p></div>
                                <div ref={updatesRef}><p className="text-5xl font-extrabold text-klar">{updatesCount}+</p><p className="text-lg text-theme-secondary mt-2">Monthly Updates</p></div>
                                <div ref={uptimeRef}><p className="text-5xl font-extrabold text-klar">{uptimeCount}%</p><p className="text-lg text-theme-secondary mt-2">Guaranteed Uptime</p></div>
                            </div>
                        </section>
                        <section id="features" className="py-12 text-center fade-in-section">
                            <h3 className="text-4xl font-bold">Core Features</h3>
                            <div className="mt-12 grid md:grid-cols-3 gap-8">
                                {features.map(f => (
                                    <div key={f.title} className="bg-theme-card p-6 rounded-lg border border-theme text-left interactive-card">
                                        <div className="w-8 h-8 text-klar mb-4">{f.icon}</div>
                                        <h4 className="text-xl font-semibold">{f.title}</h4>
                                        <p className="text-theme-secondary mt-2">{f.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section id="games" className="py-12 text-center fade-in-section">
                            <h3 className="text-4xl font-bold">Supported Games</h3>
                            <div className="mt-12 marquee">
                                <div className="marquee-content">{[...supportedGames, ...supportedGames].map((game, index) => (<div key={`${game.name}-${index}`} className="mx-4 flex-shrink-0 w-64 bg-theme-card p-8 rounded-lg border border-theme text-center interactive-card flex flex-col justify-between"><div><h4 className="text-2xl font-bold">{game.name}</h4><p className="text-klar font-semibold text-lg">{game.abbr}</p></div><button onClick={() => setSelectedGame(game)} className="mt-6 w-full py-2 px-4 rounded-lg font-semibold text-center transition bg-klar/20 hover:bg-klar/30 text-klar border border-klar">View Features</button></div>))}</div>
                            </div>
                        </section>
                        <section id="pricing" className="py-12 text-center fade-in-section">
                            <h3 className="text-4xl font-bold">Choose Your Access</h3>
                            <div className="mt-12 grid md:grid-cols-3 gap-8 items-center">
                                {pricingTiers.map(tier => (<div key={tier.name} className={`relative bg-theme-card p-8 rounded-lg border text-center interactive-card flex flex-col ${tier.isFeatured ? 'border-klar shadow-2xl shadow-klar/40 featured-card-js' : 'border-theme'}`}>{(tier.isFeatured || tier.specialTag) && (<div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 text-sm font-semibold text-white rounded-full shadow-md ${tier.isFeatured ? 'bg-klar' : tier.specialTag === 'On Sale' ? 'bg-red-500' : 'bg-indigo-500'}`}>{tier.isFeatured ? 'Best Value' : tier.specialTag}</div>)}<h4 className="text-xl font-bold mb-2 h-12 flex items-center justify-center">{tier.name}</h4><div className="flex justify-center items-end gap-2 mb-4"><p className="text-4xl font-extrabold text-klar">{tier.price}</p>{tier.robuxPrice && (<><span className="text-xl text-theme-secondary pb-1">or</span><p className="text-4xl font-extrabold text-klar">R${tier.robuxPrice}</p></>)}</div><div className="flex flex-col gap-2 mt-auto"><a href={tier.url} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-2 px-4 rounded-lg font-semibold text-center transition-all duration-300 bg-klar/20 hover:bg-klar/30 text-klar border border-klar hover:shadow-[0_0_15px_var(--klar-primary)]">Purchase (USD)</a>{tier.robuxUrl && (<a href={tier.robuxUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-2 px-4 rounded-lg font-semibold text-center transition bg-[#00A2FF]/20 hover:bg-[#00A2FF]/30 text-[#00A2FF] border border-[#00A2FF]">Purchase (Robux)</a>)}</div></div>))}
                            </div>
                        </section>
                        <section id="free" className="py-12 fade-in-section">
                            <div className="text-center"><h3 className="text-4xl font-bold">Get Free Access</h3><p className="text-lg text-theme-secondary mt-4 max-w-2xl mx-auto">Follow these three simple steps to get a free key and start using Klar Hub.</p></div>
                            <div className="mt-12 max-w-3xl mx-auto">
                                <div className="relative pl-12">
                                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-theme"></div>
                                    <div className="relative mb-12">
                                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center"><div className="z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl bg-gradient-to-br from-klar to-klar-darker text-white shadow-[0_0_15px_rgba(85,134,214,0.4)]">1</div></div>
                                        <div className="ml-4 p-6 bg-theme-card border border-theme rounded-lg"><h4 className="text-2xl font-semibold">Get Your Key</h4><p className="text-theme-secondary mt-2">Choose an option below and complete the required steps on our partner's site to receive your script key.</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4"><a href="https://ads.luarmor.net/get_key?for=Free_Klar_Access_Linkvertise-vdVzClkaaLyp" target="_blank" rel="noopener noreferrer" className="py-3 px-4 rounded-lg font-semibold text-white text-center transition bg-klar hover:bg-klar-light get-key-button">Get Key (Linkvertise)</a><a href="https://ads.luarmor.net/get_key?for=Free_Klar_Access-jfTfOGvFxqSh" target="_blank" rel="noopener noreferrer" className="py-3 px-4 rounded-lg font-semibold text-white text-center transition bg-klar hover:bg-klar-light get-key-button">Get Key (Lootlabs)</a><a href="https://ads.luarmor.net/get_key?for=Free_Klar_Access_Workink-dULHAjlXrxDx" target="_blank" rel="noopener noreferrer" className="py-3 px-4 rounded-lg font-semibold text-white text-center transition bg-klar hover:bg-klar-light get-key-button">Get Key (Workink)</a></div></div>
                                    </div>
                                    <div className="relative mb-12">
                                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center"><div className="z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl bg-gradient-to-br from-klar to-klar-darker text-white shadow-[0_0_15px_rgba(85,134,214,0.4)]">2</div></div>
                                        <div className="ml-4 p-6 bg-theme-card border border-theme rounded-lg"><h4 className="text-2xl font-semibold">Prepare Your Script</h4><p className="text-theme-secondary mt-2">Paste the key you received from Step 1 into the box below. Then, click the copy button to get your final script.</p><div className="mt-4 bg-theme-dark p-4 rounded-lg relative"><pre className="text-gray-300 overflow-x-auto custom-scrollbar"><code>{'script_key="'}<span className="text-klar">{freeKey || "insert key"}</span>{'";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/50da22b3657a22c353b0dde631cb1dcf.lua"))()'}</code></pre><div className="mt-4 flex flex-col sm:flex-row gap-2"><input type="text" value={freeKey} onChange={(e) => setFreeKey(e.target.value)} placeholder="Paste your key here" className="w-full bg-theme-button-secondary border border-theme rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-klar p-2" aria-label="Paste your script key" /><button onClick={handleCopyScript} className="flex-shrink-0 bg-klar hover:bg-klar-light text-white px-4 py-2 text-sm font-semibold rounded-lg transition relative overflow-hidden">Copy Script</button></div></div></div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center"><div className="z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl bg-gradient-to-br from-klar to-klar-darker text-white shadow-[0_0_15px_rgba(85,134,214,0.4)]">3</div></div>
                                        <div className="ml-4 p-6 bg-theme-card border border-theme rounded-lg"><h4 className="text-2xl font-semibold">Execute</h4><p className="text-theme-secondary mt-2">You're all set! Now just paste the full script you copied into your executor and run it in-game.</p></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section id="reviews" className="py-12 text-center fade-in-section">
                            <h3 className="text-4xl font-bold">Trusted by Players Worldwide</h3>
                            <div className="mt-12 marquee">
                                <div className="marquee-content">{[...allTestimonials, ...allTestimonials].map((t, i) => (<div key={i} className="mx-4 flex-shrink-0 w-80 bg-theme-card p-6 rounded-lg border border-theme text-left interactive-card flex flex-col h-full"><div className="flex-grow"><p className="text-theme-secondary italic text-lg">"{t.text}"</p></div><div className="mt-4 pt-4 border-t border-theme"><div className="flex justify-between items-center"><span className="text-klar font-semibold">{t.name}</span><div className="flex">{Array(t.stars).fill(0).map((_, starIndex) => <svg key={starIndex} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}</div></div><p className="text-gray-500 text-sm mt-1">{t.date}</p></div></div>))}</div>
                            </div>
                        </section>
                        <section id="faq" className="py-12 max-w-3xl mx-auto fade-in-section">
                            <h3 className="text-4xl font-bold text-center">Frequently Asked Questions</h3>
                            <div className="mt-12 space-y-4">{faqs.map((faq, index) => (<div key={index} className="bg-theme-card border border-theme rounded-lg faq-item"><button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full flex justify-between items-center p-6 text-left"><span className="text-lg font-semibold">{faq.q}</span><svg className={`w-6 h-6 text-theme-secondary transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button><div className="grid transition-all duration-500 ease-in-out" style={{gridTemplateRows: activeFaq === index ? '1fr' : '0fr'}}><div className="overflow-hidden"><p className="p-6 pt-0 text-theme-secondary">{faq.a}</p></div></div></div>))}</div>
                        </section>
                        <section id="community" className="py-12 text-center fade-in-section">
                            <div className="bg-theme-card border border-theme rounded-2xl p-8">
                                <h3 className="text-4xl font-bold">Still Have Questions?</h3>
                                <p className="text-lg text-theme-secondary mt-4">Join our active community on Discord for support and updates.</p>
                                <div className="mt-8 max-w-xs mx-auto"><a href="https://discord.gg/bGmGSnW3gQ" target="_blank" rel="noopener noreferrer" className="block py-3 px-8 rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white hero-button">Join our Community</a></div>
                            </div>
                        </section>
                    </div>
                </main>
                <Footer />
                {isVideoModalOpen && <VideoModal videoUrls={demoVideos} onClose={() => setIsVideoModalOpen(false)} />}
                <AIHelperButton onClick={() => setIsAiHelperOpen(true)} />
                {isAiHelperOpen && <AIHelperModal onClose={() => setIsAiHelperOpen(false)} />}
                {selectedGame && <GameFeaturesModal game={selectedGame} onClose={() => setSelectedGame(null)} />}
                {isTosModalOpen && <TosModal onClose={() => setIsTosModalOpen(false)} />}
                {isChangelogOpen && <ChangelogModal onClose={() => setIsChangelogOpen(false)} />}
                <BackToTopButton />
            </div>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

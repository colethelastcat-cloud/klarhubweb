import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, setLogLevel } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

const { useState, useEffect, useRef, useCallback } = React;

const useCustomCursor = (dependencies) => {
    const cursorDotRef = useRef(null);

    useEffect(() => {
        const dot = cursorDotRef.current;
        if (!dot) return;

        const moveCursor = e => {
            const posX = e.clientX;
            const posY = e.clientY;
            dot.style.left = `${posX}px`;
            dot.style.top = `${posY}px`;
        };
        window.addEventListener("mousemove", moveCursor);

        const addHover = () => dot.classList.add('hover');
        const removeHover = () => dot.classList.remove('hover');
        
        const interactiveElements = document.querySelectorAll('a, button, .interactive-card, .faq-item, [role="button"], [onclick], input, select, textarea, svg');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseover', addHover);
            el.addEventListener('mouseout', removeHover);
        });

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseover', addHover);
                el.removeEventListener('mouseout', removeHover);
            });
        };
    }, dependencies);

    return { cursorDotRef };
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

const DiscordCounter = () => {
    const [onlineCount, setOnlineCount] = useState(null);
    const serverId = '1357439616877072545';

    useEffect(() => {
        const fetchCount = () => {
            const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://discord.com/api/guilds/${serverId}/widget.json`)}`;

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok.');
                    return response.json();
                })
                .then(data => {
                    const discordData = JSON.parse(data.contents);

                    if (discordData.code && discordData.message) {
                        setOnlineCount('N/A');
                    } else if (discordData.presence_count !== undefined) {
                        setOnlineCount(discordData.presence_count);
                    } else {
                        setOnlineCount('N/A');
                    }
                })
                .catch(error => {
                    console.error("Error fetching Discord data:", error);
                    setOnlineCount('Error');
                });
        };

        fetchCount();
        const interval = setInterval(fetchCount, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-4 text-lg text-theme-secondary">
            Join <span className="font-bold text-klar">{onlineCount === null ? '...' : onlineCount}</span> members online now!
        </div>
    );
};

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
                if (ref.current) {
                    ref.current.style.transform = `translateY(${scrollY * spots[i].parallaxFactor}px)`;
                }
            });
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [spots]);

    return (
        <div className="aurora-background">
            {spots.map((spot, i) => (
                <div
                    key={i}
                    ref={spotRefs.current[i]}
                    className="aurora-spot"
                    style={{ top: spot.top, left: spot.left, width: spot.size, height: spot.size }}
                />
            ))}
        </div>
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
                    <button onClick={handlePrev} className="absolute left-4 md:left-16 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all z-40 hover:bg-black/70 hover:scale-110" aria-label="Previous Video">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={handleNext} className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all z-40 hover:bg-black/70 hover:scale-110" aria-label="Next Video">
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
                                                     onError={(e) => e.target.src = 'https://placehold.co/1280x720/121212/A0A0A0?text=Video+Not+Available'}
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

const GameFeaturesModal = ({ game, onClose }) => {
    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                 <div className="bg-theme-modal-card rounded-lg shadow-2xl w-full max-w-lg border border-theme">
                     <div className="p-4 border-b border-theme flex justify-between items-center">
                         <h3 className="text-xl font-bold text-theme-primary">{game.name} Features</h3>
                         <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl" aria-label="Close features modal">×</button>
                     </div>
                     <div className="p-6">
                         <ul className="space-y-3 text-theme-secondary">
                             {game.features.map((feature, index) => (
                                 <li key={index} className="flex items-center gap-3">
                                     <svg className="w-5 h-5 text-klar flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
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
    const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: 'Hello! I am the Klar Hub AI assistant. How can I help you today? Feel free to ask about features, pricing, or anything else.' }]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);
    const callGeminiAPI = async (prompt) => {
        setIsLoading(true);
        if (window.location.protocol === 'file:') {
            setChatHistory(prev => [...prev, { role: 'ai', text: "The AI assistant only works on the live website (klarhub.store). Please visit the site to use this feature." }]);
            setIsLoading(false);
            return;
        }
        const apiUrl = '/api/gemini';
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });
            if (!response.ok) {
                const errorBody = await response.text();
                console.error("API proxy error:", errorBody);
                throw new Error("The AI assistant is experiencing issues.");
            }
            const result = await response.json();
            const text = result.text;
            if (text) {
                setChatHistory(prev => [...prev, { role: 'ai', text }]);
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
                <div className="bg-theme-modal-card rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-theme">
                    <div className="p-4 border-b border-theme flex justify-between items-center flex-shrink-0">
                        <h3 className="text-lg font-bold text-theme-primary">AI Script Helper</h3>
                        <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl" aria-label="Close AI helper">×</button>
                    </div>
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-klar text-white' : 'bg-theme-button-secondary text-theme-button-secondary-text'}`}>
                                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\* (.*?)(?:\n|$)/g, '<li>$1</li>').replace(/<li>/g, '<li class="list-disc ml-4">') }}></p>
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
                         <div className="p-4 border-t border-theme flex-shrink-0">
                             <p className="text-sm text-theme-secondary mb-2 text-center">Or try one of these:</p>
                             <div className="flex flex-wrap justify-center gap-2">
                                 {quickQuestions.map(q => (
                                     <button key={q} onClick={() => sendMessage(q)} className="bg-theme-button-secondary hover:bg-theme-button-secondary-hover text-theme-button-secondary-text text-sm px-3 py-1 rounded-full transition">{q}</button>
                                 ))}
                             </div>
                         </div>
                    )}
                    <form onSubmit={handleFormSubmit} className="p-4 border-t border-theme flex gap-2 flex-shrink-0">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full bg-theme-button-secondary border border-theme rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-klar p-3"
                            aria-label="Ask a question to AI helper"
                        />
                        <button type="submit" className="bg-klar hover:bg-klar-light text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center" disabled={isLoading} aria-label="Send message">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086L2.279 16.76a.75.75 0 00.95.826l1.425-3.562a.75.75 0 000-1.406L3.105 2.289z" /></svg>
                        </button>
                    </form>
                </div>
            )}
        </Modal>
    );
};

const TosModal = ({ onClose }) => {
    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                <div className="bg-theme-modal-card rounded-lg shadow-2xl w-full max-w-2xl border border-theme">
                    <div className="p-4 border-b border-theme flex justify-between items-center">
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

const PreviewAnimation = ({ onAnimationEnd }) => {
    useEffect(() => {
        const timer = setTimeout(onAnimationEnd, 1200);
        return () => clearTimeout(timer);
    }, [onAnimationEnd]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="preview-animation-container">
                <div className="scanner-line"></div>
                <div className="text-lg text-white font-bold tracking-widest uppercase">Initializing Preview</div>
            </div>
        </div>
    );
};

const PreviewModal = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('player');
    const [isFading, setIsFading] = useState(false);
    const [previewState, setPreviewState] = useState({
        football_magnet: false,
        mag_type: 'Normal',
        radius: 50,
        chance: 100,
        mag_mode: 'Regular',
        show_hitbox: false,
        hitbox_type: 'Circle',
        pull_vector: false,
        vector_mode: 'Drag',
        power: 50,
        arm_resize: false,
        arm_size: 50,
        football_resize: false,
        football_size: 50,
        freeze_tech: false,
        freeze_mode: 'Custom',
        qb_aimbot: false,
        auto_angle: false,
        beam_mode: false,
        lead_distance: 50,
        height_distance: 50,
        speed: false,
        speed_type: 'None',
        walk_speed: 50,
        cframe_speed: 50,
        jump_power: false,
        custom_jump_power: 50,
        hip_height: false,
        custom_height: 50,
        angle_enhancer: false,
        custom_ae_power: 50,
        s_check: false,
        no_jump_cooldown: false,
        gravity: 50,
        auto_guard_nearest: false,
        guard_delay: 50,
        auto_qb: false,
        auto_qb_type: 'Blatant',
        auto_rush: false,
        rush_prediction: false,
        rush_delay: 50,
        auto_boost: false,
        boost_power: 50,
        auto_getup: false,
        getup_delay: 50,
        auto_reset: false,
        auto_swat: false,
        swat_reach: 50,
        auto_catch: false,
        catch_distance: 50,
        auto_jump: false,
        tackle_reach_toggle: false,
        custom_tackle_reach: 50,
        endzone_reach_toggle: false,
        custom_endzone_reach: 50,
        dive_power_toggle: false,
        custom_dive_power: 50,
        click_tackle_toggle: false,
        click_tackle_range: 50,
        head_resizement: false,
        resize_head: 50,
        headsize_transparency: 50,
        quick_tp_toggle: false,
        tp_distance: 50,
        visualize_path: false,
        football_highlight: false,
        no_texture: false,
        destroy_stadium: false,
        no_weather: false,
        time_of_day_toggle: false,
        time_of_day_type: 'Morning',
        field_of_view: false,
        fov: 50,
        jump_dive_prediction: false,
        prediction_type: 'Jump',
        streamer_mode: false,
        no_football_trail: false,
    });
    
    const [listeningForBind, setListeningForBind] = useState(null);

    const handleTabClick = (tabName) => {
        if (tabName === activeTab) return;
        setIsFading(true);
        setTimeout(() => {
            setActiveTab(tabName);
            setIsFading(false);
        }, 150);
    };

    const handleValueChange = useCallback((key, value) => {
        setPreviewState(prev => ({ ...prev, [key]: value }));
    }, []);
    
    const handleButtonInteraction = (e) => {
        e.target.classList.add('active');
        setTimeout(() => e.target.classList.remove('active'), 150);
    };

    const tabs = [
        { name: 'player', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H9a7 7 0 110 14H8a1 1 0 110-2h1a5 5 0 100-10H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg> },
        { name: 'football', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l3.293-3.293a1 1 0 000-1.414l-3-3a1 1 0 00-1.414 0L6 8.586V6a1 1 0 00-2 0v.586L3.293 5.707a1 1 0 000-1.414l7-7z" /></svg> },
        { name: 'movement', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> },
        { name: 'auto', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 10l-4.95-4.95zM10 12a2 2 0 100-4 2 2 0 000 4z" /></svg> },
        { name: 'physics', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M15 10a5 5 0 11-10 0 5 5 0 0110 0z" /></svg> },
        { name: 'visual', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> },
        { name: 'trolling', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" /></svg> },
        { name: 'settings', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg> },
    ];
    
    const FeatureGroup = ({ title, children }) => (
        <div className="bg-[#111111] p-4 rounded-md space-y-4">
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">{title}</h3>
            {children}
        </div>
    );
    
    const Checkbox = ({ id, label }) => {
        const checked = previewState[id] || false;
        return (
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <div onClick={() => handleValueChange(id, !checked)} className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors ${checked ? 'bg-orange-500 justify-end' : 'bg-gray-700 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full transition-transform"></div>
                </div>
            </div>
        );
    };

    const Slider = ({ id, label, min = 0, max = 100, step = 1 }) => {
        const sliderValue = previewState[id] !== undefined ? previewState[id] : min;
        const percentage = ((sliderValue - min) / (max - min)) * 100;
        return (
            <div className="space-y-2">
                <span className="text-sm text-gray-400">{label}</span>
                <div className="w-full h-1.5 rounded-full bg-gray-700 relative">
                     <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                     <div className="w-4 h-4 bg-white rounded-full absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${percentage}%` }}></div>
                </div>
            </div>
        );
    };
    
    const Dropdown = ({ id, label, options }) => {
        const selectedValue = previewState[id] || options[0];
        return (
             <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-400">{label}</span>
                 <select value={selectedValue} onChange={(e) => handleValueChange(id, e.target.value)} className="bg-gray-700 text-sm text-gray-300 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-orange-500">
                     {options.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                 </select>
             </div>
        );
    };
    
    const Button = ({ label }) => <button onClick={handleButtonInteraction} className="w-full text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 py-1.5 rounded transition-colors">{label}</button>
    const TextInput = ({ placeholder }) => <input type="text" placeholder={placeholder} className="w-full bg-gray-700 text-sm p-2 rounded border border-gray-600 focus:outline-none focus:border-orange-500 placeholder-gray-500" />
    const KeybindButton = ({ id }) => {
        const bindKey = previewState[`${id}_keybind`];
        const isListening = listeningForBind === id;
        return (
             <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Keybind</span>
                <button onClick={() => setListeningForBind(id)} className="text-sm font-mono px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">
                    {isListening ? '...' : (bindKey || 'None')}
                </button>
            </div>
        )
    };
    

    const renderContent = () => {
        switch (activeTab) {
            case 'player':
                return (
                    <>
                        <FeatureGroup title="Catching">
                            <Checkbox id="football_magnet" label="Football Magnet"/>
                            <Dropdown id="mag_type" label="Mag Type" options={["Normal", "Advanced"]} />
                            <Slider id="radius" label="Radius" />
                            <Slider id="chance" label="Chance" />
                            <Dropdown id="mag_mode" label="Mag Mode" options={["Regular", "Smart"]} />
                            <Checkbox id="show_hitbox" label="Show Hitbox"/>
                            <Dropdown id="hitbox_type" label="Hitbox Type" options={["Circle", "Box"]} />
                        </FeatureGroup>
                        <FeatureGroup title="Pull Vector">
                            <Checkbox id="pull_vector" label="Pull Vector"/>
                            <Dropdown id="vector_mode" label="Vector Mode" options={["Drag", "Tween"]} />
                            <Slider id="power" label="Power" />
                        </FeatureGroup>
                        <FeatureGroup title="Assistance">
                             <Checkbox id="arm_resize" label="Arm Resize"/>
                             <Slider id="arm_size" label="Arm Size" />
                             <Checkbox id="football_resize" label="Football Resize"/>
                             <Slider id="football_size" label="Football Size" />
                             <Checkbox id="freeze_tech" label="Freeze Tech"/>
                             <Dropdown id="freeze_mode" label="Freeze Mode" options={["Custom", "Auto"]} />
                             <TextInput placeholder="Duration" />
                             <KeybindButton id="assistance" />
                        </FeatureGroup>
                    </>
                );
            case 'football':
                return (
                    <>
                        <FeatureGroup title="QB Aimbot">
                            <Checkbox id="qb_aimbot" label="QB Aimbot"/>
                            <Checkbox id="auto_angle" label="Auto Angle"/>
                            <Checkbox id="beam_mode" label="Beam Mode"/>
                        </FeatureGroup>
                        <FeatureGroup title="Leads Config">
                            <Slider id="lead_distance" label="Lead Distance" />
                            <Slider id="height_distance" label="Height Distance" />
                        </FeatureGroup>
                    </>
                );
            case 'movement':
                 return (
                    <>
                        <FeatureGroup title="Speed">
                            <Checkbox id="speed" label="Speed"/>
                            <Dropdown id="speed_type" label="Speed Type" options={["None", "Type 1", "Type 2"]} />
                            <Slider id="walk_speed" label="Walk Speed" />
                            <Slider id="cframe_speed" label="CFrame Speed" />
                        </FeatureGroup>
                        <FeatureGroup title="Jumppower">
                            <Checkbox id="jump_power" label="Jump Power"/>
                            <Slider id="custom_jump_power" label="Custom JumpPower" />
                        </FeatureGroup>
                         <FeatureGroup title="Hip Height">
                            <Checkbox id="hip_height" label="Hip Height"/>
                            <Slider id="custom_height" label="Custom Height" />
                        </FeatureGroup>
                        <FeatureGroup title="Angle Enhancer">
                            <Checkbox id="angle_enhancer" label="Angle Enhancer"/>
                            <Slider id="custom_ae_power" label="Custom AE Power" />
                            <Checkbox id="s_check" label="S Check"/>
                        </FeatureGroup>
                        <FeatureGroup title="Misc">
                            <Checkbox id="no_jump_cooldown" label="No Jump Cooldown"/>
                            <Slider id="gravity" label="Gravity" />
                        </FeatureGroup>
                    </>
                );
            case 'auto':
                 return (
                    <>
                        <FeatureGroup title="Auto Guard">
                            <Checkbox id="auto_guard_nearest" label="Auto Guard Nearest"/>
                            <Slider id="guard_delay" label="Guard Delay" />
                        </FeatureGroup>
                        <FeatureGroup title="Auto QB">
                            <Checkbox id="auto_qb" label="Auto QB"/>
                            <Dropdown id="auto_qb_type" label="Auto QB Type" options={["Blatant", "Subtle"]} />
                        </FeatureGroup>
                        <FeatureGroup title="Auto Rush">
                            <Checkbox id="auto_rush" label="Auto Rush"/>
                            <Checkbox id="rush_prediction" label="Rush Prediction"/>
                            <Slider id="rush_delay" label="Rush Delay" />
                        </FeatureGroup>
                         <FeatureGroup title="Auto Boost">
                            <Checkbox id="auto_boost" label="Auto Boost"/>
                            <Slider id="boost_power" label="Boost Power" />
                        </FeatureGroup>
                        <FeatureGroup title="Auto Getup">
                            <Checkbox id="auto_getup" label="Auto Getup"/>
                            <Slider id="getup_delay" label="Getup Delay" />
                        </FeatureGroup>
                        <FeatureGroup title="Auto Reset">
                            <Checkbox id="auto_reset" label="Auto Reset | After Catch"/>
                        </FeatureGroup>
                        <FeatureGroup title="Auto Swat">
                             <Checkbox id="auto_swat" label="Auto Swat"/>
                             <Slider id="swat_reach" label="Swat Reach" />
                        </FeatureGroup>
                        <FeatureGroup title="Auto Catch">
                             <Checkbox id="auto_catch" label="Auto Catch"/>
                             <Slider id="catch_distance" label="Catch Distance" />
                        </FeatureGroup>
                         <FeatureGroup title="Auto Jump">
                             <Checkbox id="auto_jump" label="Auto Jump"/>
                        </FeatureGroup>
                    </>
                );
             case 'physics':
                 return (
                    <>
                        <FeatureGroup title="Tackle Reach">
                            <Checkbox id="tackle_reach_toggle" label="Tackle Reach"/>
                            <Slider id="custom_tackle_reach" label="Custom Tackle Reach" />
                        </FeatureGroup>
                        <FeatureGroup title="Endzone Reach">
                            <Checkbox id="endzone_reach_toggle" label="Endzone Reach"/>
                            <Slider id="custom_endzone_reach" label="Custom Endzone Reach" />
                        </FeatureGroup>
                         <FeatureGroup title="Dive Power">
                            <Checkbox id="dive_power_toggle" label="Dive Power"/>
                            <Slider id="custom_dive_power" label="Custom Dive Power" />
                        </FeatureGroup>
                         <FeatureGroup title="Click Tackle">
                            <Checkbox id="click_tackle_toggle" label="Click Tackle"/>
                            <Slider id="click_tackle_range" label="Click Tackle Range" />
                        </FeatureGroup>
                         <FeatureGroup title="Head Resize">
                            <Checkbox id="head_resizement" label="Head Resizement"/>
                            <Slider id="resize_head" label="Resize Head" />
                            <Slider id="headsize_transparency" label="Headsize Transparency" />
                        </FeatureGroup>
                         <FeatureGroup title="Quick TP">
                            <Checkbox id="quick_tp_toggle" label="Quick TP"/>
                            <Slider id="tp_distance" label="TP Distance" />
                            <KeybindButton id="quick_tp" />
                        </FeatureGroup>
                    </>
                );
            case 'visual':
                 return (
                    <>
                        <FeatureGroup title="Visualize Football Path">
                            <Checkbox id="visualize_path" label="Visualize Football Path"/>
                        </FeatureGroup>
                        <FeatureGroup title="Football Highlight">
                            <Checkbox id="football_highlight" label="Football Highlight"/>
                        </FeatureGroup>
                         <FeatureGroup title="Graphic">
                            <Checkbox id="no_texture" label="No Texture | Boost FPS"/>
                            <Checkbox id="destroy_stadium" label="Destroy Stadium"/>
                        </FeatureGroup>
                        <FeatureGroup title="Jersey Changer">
                            <TextInput placeholder="Jersey Name"/>
                            <TextInput placeholder="Jersey Number"/>
                            <Button label="Apply Jersey"/>
                        </FeatureGroup>
                        <FeatureGroup title="Weather Related">
                            <Checkbox id="no_weather" label="No Weather"/>
                            <Checkbox id="time_of_day_toggle" label="Time of Day"/>
                            <Dropdown id="time_of_day_type" label="Time of Day Type" options={["Morning", "Day", "Night"]}/>
                        </FeatureGroup>
                         <FeatureGroup title="FOV">
                            <Checkbox id="field_of_view" label="Field of View"/>
                            <Slider id="fov" label="FOV" />
                        </FeatureGroup>
                         <FeatureGroup title="Assistance">
                            <Checkbox id="jump_dive_prediction" label="Jump/Dive Prediction"/>
                            <Dropdown id="prediction_type" label="Prediction Type" options={["Jump", "Dive"]} />
                            <Checkbox id="streamer_mode" label="Streamer Mode"/>
                            <Checkbox id="no_football_trail" label="No Football Trail"/>
                        </FeatureGroup>
                    </>
                );
             case 'settings':
                return (
                    <div className="col-span-2">
                       <FeatureGroup title="Configurations">
                        <TextInput placeholder="Type Config Name..." />
                        <Button label="Save Config" />
                        <Button label="Load Config" />
                        <Button label="Reset Config" />
                       </FeatureGroup>
                    </div>
                );
            default:
                return <div className="col-span-2 text-center text-gray-500 pt-10">Select a tab.</div>;
        }
    };


    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                <div className="w-[900px] h-[550px] bg-[#1c1c1c] text-white rounded-lg flex overflow-hidden border border-gray-800 shadow-2xl shadow-black/50">
                    <div className="w-[280px] bg-[#111111] p-4 flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-6">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => handleTabClick(tab.name)}
                                    className={`p-3 rounded-md transition-colors relative ${activeTab === tab.name ? 'text-orange-400' : 'text-gray-400 hover:bg-gray-700/50'}`}
                                >
                                    {tab.icon}
                                    {activeTab === tab.name && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 bg-orange-400 rounded-full"></div>}
                                </button>
                            ))}
                             <div className="w-10 h-10 bg-[#1c1c1c] rounded-md flex items-center justify-center text-orange-400 font-bold text-xl">K</div>
                        </div>
                        <div className={`flex-1 w-full overflow-y-auto custom-scrollbar transition-opacity duration-150 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                           <div className="hub-content-inner grid grid-cols-1 gap-4">
                                {renderContent()}
                           </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};


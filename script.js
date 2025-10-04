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
        football_magnet: false, mag_type: 'Normal', radius: 50, chance: 100, mag_mode: 'Regular', show_hitbox: false, hitbox_type: 'Circle',
        pull_vector: false, vector_mode: 'Drag', power: 50,
        arm_resize: false, arm_size: 50, football_resize: false, football_size: 50, freeze_tech: false, freeze_mode: 'Custom',
        qb_aimbot: false, auto_angle: false, beam_mode: false, lead_distance: 50, height_distance: 50,
        speed: false, speed_type: 'None', walk_speed: 50, cframe_speed: 50,
        jump_power: false, custom_jump_power: 50, hip_height: false, custom_height: 50,
        angle_enhancer: false, custom_ae_power: 50, s_check: false, no_jump_cooldown: false, gravity: 50,
        auto_guard_nearest: false, guard_delay: 50, auto_qb: false, auto_qb_type: 'Blatant', auto_rush: false, rush_prediction: false, rush_delay: 50,
        auto_boost: false, boost_power: 50, auto_getup: false, getup_delay: 50, auto_reset: false,
        auto_swat: false, swat_reach: 50, auto_catch: false, catch_distance: 50, auto_jump: false,
        tackle_reach_toggle: false, custom_tackle_reach: 50, endzone_reach_toggle: false, custom_endzone_reach: 50, dive_power_toggle: false, custom_dive_power: 50,
        click_tackle_toggle: false, click_tackle_range: 50, head_resizement: false, resize_head: 50, headsize_transparency: 50, quick_tp_toggle: false, tp_distance: 50,
        visualize_path: false, football_highlight: false, no_texture: false, destroy_stadium: false, no_weather: false, time_of_day_toggle: false,
        time_of_day_type: 'Morning', field_of_view: false, fov: 50, jump_dive_prediction: false, prediction_type: 'Jump', streamer_mode: false, no_football_trail: false,
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
        { name: 'player', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.05 4.05a7 7 0 119.9 9.9L10 10l-4.95-4.95zM10 12a2 2 0 100-4 2 2 0 000 4z" /></svg> },
        { name: 'football', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
        { name: 'movement', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
        { name: 'auto', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" /></svg> },
        { name: 'physics', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317a.75.75 0 01.75-.75h2.85a.75.75 0 01.75.75v2.85a.75.75 0 01-1.5 0V5.56l-5.47 5.47a.75.75 0 01-1.06-1.06l5.47-5.47h-1.615a.75.75 0 01-.75-.75zM4.317 10.325a.75.75 0 01.75.75v1.615l5.47-5.47a.75.75 0 011.06 1.06l-5.47 5.47V14.5a.75.75 0 01-1.5 0v-2.85a.75.75 0 01.75-.75z" /></svg> },
        { name: 'visual', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg> },
        { name: 'trolling', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { name: 'settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317a.75.75 0 01.75-.75h2.85a.75.75 0 01.75.75v2.85a.75.75 0 01-1.5 0V5.56l-5.47 5.47a.75.75 0 01-1.06-1.06l5.47-5.47h-1.615a.75.75 0 01-.75-.75zM4.317 10.325a.75.75 0 01.75.75v1.615l5.47-5.47a.75.75 0 011.06 1.06l-5.47 5.47V14.5a.75.75 0 01-1.5 0v-2.85a.75.75 0 01.75-.75z" /></svg> },
    ];
    
    const FeatureGroup = ({ title, children }) => (
        <div className="bg-[#111111] p-4 rounded-md space-y-3">
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
    
    const Checkbox = ({ id, label }) => {
        const checked = previewState[id] || false;
        return (
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <div onClick={() => handleValueChange(id, !checked)} className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${checked ? 'bg-orange-500 justify-end' : 'bg-gray-700 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full transition-transform"></div>
                </div>
            </div>
        );
    };

    const Slider = ({ id, label, min = 0, max = 100, step = 1 }) => {
        const sliderValue = previewState[id] !== undefined ? previewState[id] : min;
        const percentage = ((sliderValue - min) / (max - min)) * 100;
        return (
            <div className="space-y-1.5">
                <span className="text-sm text-gray-400">{label}</span>
                <div className="w-full h-1 rounded-full bg-gray-700 relative group">
                     <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                     <div className="w-3 h-3 bg-white rounded-full absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${percentage}%` }}></div>
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
                <div className="w-[850px] h-[600px] bg-[#0d0d0f] rounded-lg flex flex-col overflow-hidden border border-gray-800 shadow-2xl shadow-black/50">
                    <div className="flex justify-between items-center p-3 bg-[#111111] flex-shrink-0">
                        <div className="flex items-center gap-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => handleTabClick(tab.name)}
                                    className={`p-2 rounded-md transition-colors relative text-gray-400 hover:bg-gray-700/50 ${activeTab === tab.name ? 'text-orange-400' : ''}`}
                                >
                                    {tab.icon}
                                    {activeTab === tab.name && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 bg-orange-400 rounded-full"></div>}
                                </button>
                            ))}
                        </div>
                        <div className="w-10 h-10 border border-gray-700 rounded-md flex items-center justify-center text-orange-400 font-bold text-2xl">K</div>
                    </div>
                    <div className={`flex-1 w-full p-4 overflow-y-auto custom-scrollbar transition-opacity duration-150 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderContent()}
                       </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

const ComparePlansModal = ({ onClose, allTiers }) => {
    const features = [
        { name: 'Price', key: 'price' },
        { name: 'Robux Price', key: 'robuxPrice' },
        { 
            name: 'Duration', 
            getValue: (tier) => {
                if (tier.name.includes('Lifetime')) return 'Lifetime';
                if (tier.name.includes('1 Week')) return '7 Days';
                if (tier.name.includes('1 Month')) return '30 Days';
                if (tier.name.includes('3 Month')) return '90 Days';
                if (tier.name.includes('6 Month')) return '180 Days';
                return 'N/A';
            }
        },
        { 
            name: 'Access To All Games',
            getValue: (tier) => tier.name.includes('Klar') ? '✔️' : 'N/A'
        },
        { 
            name: 'Premium Support',
            getValue: (tier) => '✔️'
        },
    ];

    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                <div className="bg-theme-modal-card rounded-lg shadow-2xl w-full max-w-4xl border border-theme">
                    <div className="p-4 border-b border-theme flex justify-between items-center">
                        <h3 className="text-xl font-bold text-theme-primary">Compare All Plans</h3>
                        <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl" aria-label="Close compare plans modal">&times;</button>
                    </div>
                    <div className="p-6 overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-3 text-sm font-semibold text-theme-primary bg-theme-dark rounded-tl-lg">Features</th>
                                    {allTiers.map(tier => (
                                        <th key={tier.name} className="p-3 text-sm font-semibold text-theme-primary bg-theme-dark text-center whitespace-nowrap">
                                            {tier.name}
                                            {tier.isFeatured && <span className="block text-xs text-klar font-normal">(Best Value)</span>}
                                        </th>
                                    ))}
                                    <th className="p-3 bg-theme-dark rounded-tr-lg"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((feature, fIndex) => (
                                    <tr key={feature.name} className="border-b border-theme">
                                        <td className="p-3 font-medium text-theme-secondary">{feature.name}</td>
                                        {allTiers.map(tier => (
                                            <td key={tier.name} className="p-3 text-center text-theme-primary">
                                                {feature.getValue ? feature.getValue(tier) : (tier[feature.key] || 'N/A')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr className="">
                                    <td className="p-3"></td>
                                    {allTiers.map(tier => (
                                        <td key={tier.name} className="p-3 text-center">
                                            <a href={tier.url} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-2 px-4 rounded-lg font-semibold text-center transition bg-klar/20 hover:bg-klar/30 text-klar border border-klar text-sm">
                                                Purchase
                                            </a>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Modal>
    );
};

const Header = ({ headerRef, onScrollTo, onToggleMobileMenu, onTosClick, activeSection, isMobileMenuOpen, onGameClick, theme, setTheme }) => {
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

const MobileMenu = ({ isOpen, onScrollTo, onTosClick, onClose }) => {
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
            {navItems.map(item => (
                <button key={item.id} onClick={() => {
                    if (item.id === 'tos') {
                        onTosClick();
                    } else {
                        onScrollTo(item.id);
                    }
                    onClose();
                }} className="text-theme-secondary hover:text-klar transition">{item.label}</button>
            ))}
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
        <button id="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`fixed bottom-8 left-8 bg-klar/80 hover:bg-klar text-white w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} aria-label="Back to top">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
        </button>
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
        <p className="mt-2">made by auaqa</p>
         <div className="flex justify-center gap-6 mt-4">
             <a href="https://discord.gg/bGmGSnW3gQ" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-klar transition-colors" aria-label="Discord">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.36981C18.7915 3.74873 17.189 3.28434 15.5298 3.00003C15.5298 3.00003 15.1518 3.42189 14.865 3.76878C13.0476 3.22018 11.1492 3.22018 9.423 3.76878C9.135 3.42189 8.7582 3 8.7582 3C7.09901 3.28434 5.49652 3.74873 3.97017 4.36981C0.324569 9.87328 -0.463321 15.1072 0.871542 20.2078C2.6516 21.6213 4.59436 22.548 6.65283 23C7.26284 22.3486 7.80165 21.631 8.256 20.8522C7.38573 20.4866 6.58162 20.021 5.84279 19.4515C6.11591 19.2633 6.3802 19.0664 6.6346 18.8608C10.0322 20.6453 14.2523 20.6453 17.6487 18.8608C17.9031 19.0664 18.1674 19.2633 18.4405 19.4515C17.7017 20.021 16.9064 20.4866 16.0273 20.8522C16.4817 21.631 17.0205 22.3486 17.6305 23C19.689 22.548 21.6317 21.6213 23.4118 20.2078C24.5828 14.2458 23.5938 8.81315 20.317 4.36981ZM8.02004 16.5392C6.88337 16.5392 6.00004 15.503 6.00004 14.1682C6.00004 12.8334 6.88337 11.7972 8.02004 11.7972C9.15671 11.7972 10.04 12.8334 10.0203 14.1682C10.0203 15.503 9.15671 16.5392 8.02004 16.5392ZM16.2687 16.5392C15.132 16.5392 14.2487 15.503 14.2487 14.1682C14.2487 12.8334 15.132 11.7972 16.2687 11.7972C17.4054 11.7972 18.2887 12.8334 18.2689 14.1682C18.2689 15.503 17.4054 16.5392 16.2687 16.5392Z" /></svg>
             </a>
             <a href="#" className="text-gray-400 hover:text-klar transition-colors" aria-label="Telegram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 24a12 12 0 1 1 12-12 12.013 12.013 0 0 1-12 12Zm5.74-15.652L6.44 12.27c-.88.39-1.01.76-.23 1.1l2.58 1.12 6.09-3.79c.33-.2.62-.09.35.13l-4.93 4.45-1.15 3.39c.83 0 .81-.38 1.12-.66l1.79-1.63 3.4 2.45c.6.35 1.01.16 1.18-.52l2.1-9.84c.21-.83-.3-1.18-1.04-.84Z"/></svg>
             </a>
             <a href="#" className="text-gray-400 hover:text-klar transition-colors" aria-label="Youtube">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" /></svg>
             </a>
          </div>
     </footer>
);

const App = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const [scriptCopied, setScriptCopied] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [isTosModalOpen, setIsTosModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isPreviewAnimating, setIsPreviewAnimating] = useState(false);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [freeKey, setFreeKey] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('klar-theme') || 'dark');

    const { cursorDotRef } = useCustomCursor([isAuthReady]);

    useEffect(() => {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

        if (Object.keys(firebaseConfig).length === 0) {
            console.warn("Firebase config is missing or empty. Firestore and Auth will not function.");
            setIsAuthReady(true);
            return;
        }

        try {
            const appInstance = initializeApp(firebaseConfig);
            const authInstance = getAuth(appInstance);
            const dbInstance = getFirestore(appInstance);
            setAuth(authInstance);
            setDb(dbInstance);
            setLogLevel('Debug');

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    const userSettingsRef = doc(dbInstance, `artifacts/${appId}/users/${user.uid}/settings`, 'theme');
                    const docSnap = await getDoc(userSettingsRef);
                    if (docSnap.exists()) {
                        setTheme(docSnap.data().theme);
                    } else {
                        const localTheme = localStorage.getItem('klar-theme') || 'dark';
                        setTheme(localTheme);
                        await setDoc(userSettingsRef, { theme: localTheme }, { merge: true })
                            .catch(error => console.error("Error setting initial theme in Firestore:", error));
                    }
                } else {
                    try {
                        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                            await signInWithCustomToken(authInstance, __initial_auth_token);
                        } else {
                            await signInAnonymously(authInstance);
                        }
                    } catch (error) {
                        console.error("Error during Firebase sign-in (anonymous or custom token):", error);
                    }
                    setTheme(localStorage.getItem('klar-theme') || 'dark');
                }
                setIsAuthReady(true);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Failed to initialize Firebase or set up auth listener:", e);
            setIsAuthReady(true);
        }
    }, []);
    
    useEffect(() => {
        if (isAuthReady) {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                setTimeout(() => {
                    preloader.classList.add('loaded');
                }, 500); 
            }
        }
    }, [isAuthReady]);

    useEffect(() => {
        if (db && userId && theme && isAuthReady) {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const userSettingsRef = doc(db, `artifacts/${appId}/users/${userId}/settings`, 'theme');
            setDoc(userSettingsRef, { theme }, { merge: true })
                .catch(error => console.error("Error saving theme to Firestore:", error));
        }
    }, [db, userId, theme, isAuthReady]);

    useEffect(() => {
        const root = document.documentElement;
        localStorage.setItem('klar-theme', theme);
        
        const themes = {
            dark: {
                '--background-dark': '#121212',
                '--background-light': '#1E1E1E',
                '--text-primary': '#F9FAFB', 
                '--text-secondary': '#D1D5DB',
                '--border-color': '#4B5563',    
                '--header-bg': 'rgba(18, 18, 18, 0.7)',
                '--card-bg': 'rgba(30, 30, 30, 0.4)',
                '--modal-card-bg': '#1F2937',
                '--button-secondary-bg': '#374151',
                '--button-secondary-hover-bg': '#4B5563',
                '--button-secondary-text': '#F9FAFB',
                '--aurora-opacity': '0.1'
            },
            light: {
                '--background-dark': '#F9FAFB',
                '--background-light': '#FFFFFF',
                '--text-primary': '#111827',
                '--text-secondary': '#374151',
                '--border-color': '#9CA3AF',    
                '--header-bg': 'rgba(249, 250, 251, 0.8)',
                '--card-bg': '#FFFFFF',
                '--modal-card-bg': '#FFFFFF',
                '--button-secondary-bg': '#E5E7EB',
                '--button-secondary-hover-bg': '#D1D5DB',
                '--button-secondary-text': '#111827',
                '--aurora-opacity': '0.05'
            }
        };

        const selectedTheme = themes[theme];
        for (const [key, value] of Object.entries(selectedTheme)) {
            root.style.setProperty(key, value);
        }

    }, [theme]);

    useFadeInSection();
    useInteractiveCard();

    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(80);
    const activeSection = useActiveNav(headerHeight);

    useEffect(() => { 
        if(headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight); 
        }
    }, []);

    const [usersRef, usersCount] = useAnimatedCounter(80);
    const [updatesRef, updatesCount] = useAnimatedCounter(20);
    const [uptimeRef, uptimeCount] = useAnimatedCounter(99);
    
    const handleScrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offsetPosition = element.offsetTop - headerHeight;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            history.pushState(null, null, `#${id}`);
        }
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        if (headerHeight > 0 && headerHeight !== 80) { 
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                const element = document.getElementById(hash);
                if (element) {
                    const offsetPosition = element.offsetTop - headerHeight;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }
        }
    }, [headerHeight]);


    const handleCopyScript = () => {
        const keyToUse = freeKey || "insert key";
        const scriptText = `script_key="${keyToUse}";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/50da22b3657a22c353b0dde631cb1dcf.lua"))()`;
        
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = scriptText;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
            setScriptCopied(true);
            setTimeout(() => setScriptCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy script: ', err);
            alert('Failed to copy script. Please copy it manually: ' + scriptText);
        } finally {
            document.body.removeChild(tempTextArea);
        }
    };
    
    const handlePreviewClick = () => {
        setIsPreviewAnimating(true);
    };

    const demoVideos = [
        "https://www.youtube.com/embed/d2hR2gRhME0?autoplay=1",
        "https://www.youtube.com/embed/97osD4zLYpA?autoplay=1",
        "https://www.youtube.com/embed/03Y0NuUEOV8?autoplay=1"
    ];

    const pricingTiers = [
        { name: '1 Week Klar Access', price: '$1.50', url: 'https://klarhub.sellhub.cx/product/1-Week/', specialTag: 'Most Popular'},
        { name: 'Lifetime Klar', price: '$15.00', url: 'https://klarhub.sellhub.cx/product/New-product/', isFeatured: true },
        { name: 'Extreme Alt Gen', price: '$1.00', url: 'https://klarhub.sellhub.cx/product/Extreme-Alt-Gen/', specialTag: 'On Sale' },
        { name: '1 Month Klar Access', price: '$2.50', url: 'https://klarhub.sellhub.cx/product/1-Month-Klar-Access/', robuxPrice: '450', robuxUrl: 'https://www.roblox.com/catalog/116340932269907/KLAR-1-month' },
        { name: '3 Month Klar Access', price: '$3.75', url: 'https://klarhub.sellhub.cx/product/3-Month-Access/', robuxPrice: '800', robuxUrl: 'https://www.roblox.com/catalog/71184399134072/KLAR-3-Month' },
        { name: '6 Month Klar Access', price: '$5.50', url: 'https://klarhub.sellhub.cx/product/6-Month-Klar-Access/', robuxPrice: '1225', robuxUrl: 'https://www.roblox.com/catalog/134764715699815/KLAR-6-Month' },
    ];
    
    const topTiers = pricingTiers.slice(0, 3);
    const bottomTiers = pricingTiers.slice(3);

     const testimonials = [
        { name: 'Customer', stars: 5, text: "easiest checkout", date: "Wed Jul 23 2025" },
        { name: 'Customer', stars: 5, text: "Amazing and easy", date: "Wed Jul 16 2025" },
        { name: 'Customer', stars: 5, text: "best script out there cop now", date: "Fri Jun 06 2025" }
    ];
     const faqs = [
        { q: "Is Klar Hub a one-time purchase?", a: "We offer both subscription and lifetime access plans. You can choose the one that best suits your needs." },
        { q: "What payment methods are accepted?", a: "We accept all major payment methods through our secure online storefront, including credit cards, PayPal, and more." },
        { q: "What executors are compatible?", a: "Our scripts are designed to be compatible with all major, high-quality executors on the market." },
        { q: "How often are the scripts updated?", a: "We update our scripts regularly to ensure compatibility with the latest Roblox updates and to add new features. Updates are always free for active subscribers or lifetime members." }
    ];
    const features = [
        { title: "Perfect Kicking & Throwing", description: "Achieve perfect accuracy and power on every kick and throw with our advanced precision assistance.", icon: "M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56v4.82a6 6 0 01-1.292 3.536l-1.992-1.992a4.5 4.5 0 00-6.364-6.364l-1.992-1.992A6 6 0 0115.59 14.37z" },
        { title: "QB Aimbot", description: "Never miss a throw with our precise quarterback aimbot, featuring prediction and sensitivity controls.", icon: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" },
        { title: "Ball Magnets", description: "Automatically catch passes with our intelligent ball magnet, ensuring you never drop the ball.", icon: "M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" }
    ];
    const supportedGames = [
        { name: "Football Fusion 2", abbr: "FF2", features: ["Ball Magnets", "Pull Vector", "Enhanced Movement (Jump & Speed)", "No Jump Cooldown", "Custom Catch Effects"] },
        { name: "Ultimate Football", abbr: "UF", features: ["Football Size Manipulation", "Arm Resize", "Enhanced Movement (Jump & Speed)", "No-Clip (Utility)"] },
        { name: "Murders VS Sheriffs Duels", abbr: "MVSD", features: ["Advanced Triggerbot", "Hitbox Extender", "Enhanced Movement (Jump & Speed)", "Player ESP"] },
        { name: "Arsenal", abbr: "Arsenal", features: ["Silent Aim", "Advanced Hitbox Manipulation", "Triggerbot", "Visual Tags (Admin, etc.)"] }
    ];

    return (
        <div className="bg-theme-dark text-theme-primary">
            <div ref={cursorDotRef} className="cursor-dot"></div>
            <AuroraBackground />
            <div className="relative z-10">
                <Header
                    headerRef={headerRef}
                    onScrollTo={handleScrollTo}
                    onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    onTosClick={() => setIsTosModalOpen(true)}
                    isMobileMenuOpen={isMobileMenuOpen}
                    activeSection={activeSection}
                    theme={theme}
                    setTheme={setTheme}
                />
                <MobileMenu
                    isOpen={isMobileMenuOpen}
                    onScrollTo={handleScrollTo}
                    onTosClick={() => {
                        setIsTosModalOpen(true);
                        setIsMobileMenuOpen(false);
                    }}
                    onClose={() => setIsMobileMenuOpen(false)}
                />
                <main>
                    <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center p-8 pt-20">
                        <div className="relative z-10">
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">Welcome to <span className="text-klar">Klar</span> Hub</h2>
                            <p className="text-lg md:text-xl text-theme-secondary mt-4 max-w-2xl mx-auto">The pinnacle of script performance and reliability for FF2.</p>
                            <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6 text-theme-secondary">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"></path></svg>
                                    <span>100% Undetected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11.983 1.904a.75.75 0 00-1.217-.866l-7.5 10.5a.75.75 0 00.925 1.217L8 10.463V18a.75.75 0 001.5 0v-7.537l4.017-2.87a.75.75 0 00-.534-1.217L11.983 1.904z"></path></svg>
                                    <span>Lightning Fast</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l.645 1.558a.75.75 0 00.729.516h1.634c.82 0 1.123.993.57 1.488l-1.328 1.004a.75.75 0 00-.286.905l.492 1.772c.245.882-.733 1.579-1.482 1.06l-1.423-.982a.75.75 0 00-.894 0l-1.423.982c-.749.52-1.726-.178-1.482-1.06l.492-1.772a.75.75 0 00-.286-.905l-1.328-1.004c-.553-.495-.25-1.488.57-1.488h1.634a.75.75 0 00.73-.516l.645-1.558z"></path></svg>
                                    <span>Premium Quality</span>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-col items-center justify-center gap-4">
                               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button onClick={() => handleScrollTo('pricing')} className="py-3 px-8 rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white shadow-lg shadow-klar flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25v-6h9M6.08 5.746l.473 2.365A1.125 1.125 0 015.454 9H2.25M9 11.25v3.375c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V11.25m-3.375 0h3.375M7.5 14.25h3.375z"/></svg>
                                        Purchase Now
                                    </button>
                                    <button onClick={() => setIsVideoModalOpen(true)} className="py-3 px-8 rounded-lg font-semibold text-center transition bg-transparent border border-theme text-theme-secondary hover:text-theme-primary hover:border-klar flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" /></svg>
                                        Watch Demo
                                    </button>
                                </div>
                                <DiscordCounter />
                                <button onClick={handlePreviewClick} className="mt-2 py-2 px-6 rounded-lg font-semibold text-center transition bg-theme-button-secondary hover:bg-theme-button-secondary-hover text-theme-button-secondary-text flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                    Preview Hub
                                </button>
                            </div>
                        </div>
                    </section>
                    <div className="w-full max-w-6xl mx-auto px-4 space-y-24">
                        <section id="stats" className="py-12 fade-in-section">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div ref={usersRef}>
                                    <p className="text-5xl font-extrabold text-klar">{usersCount.toLocaleString()}+</p>
                                    <p className="text-lg text-theme-secondary mt-2">Active Users</p>
                                </div>
                                <div ref={updatesRef}>
                                    <p className="text-5xl font-extrabold text-klar">{updatesCount}+</p>
                                    <p className="text-lg text-theme-secondary mt-2">Monthly Updates</p>
                                </div>
                                <div ref={uptimeRef}>
                                    <p className="text-5xl font-extrabold text-klar">{uptimeCount}%</p>
                                    <p className="text-lg text-theme-secondary mt-2">Guaranteed Uptime</p>
                                </div>
                            </div>
                        </section>
                        <section id="features" className="py-12 text-center fade-in-section">
                            <h3 className="text-4xl font-bold">Core Features</h3>
                            <div className="mt-12 grid md:grid-cols-3 gap-8">
                                {features.map(f => (
                                     <div key={f.title} className="bg-theme-card p-6 rounded-lg border border-theme text-left interactive-card">
                                         <svg className="w-8 h-8 text-klar mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                                         <h4 className="text-xl font-semibold">{f.title}</h4>
                                         <p className="text-theme-secondary mt-2">{f.description}</p>
                                     </div>
                                ))}
                            </div>
                        </section>
                        <section id="games" className="py-12 text-center fade-in-section">
                            <h3 className="text-4xl font-bold">Supported Games</h3>
                            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                 {supportedGames.map(game => (
                                         <div key={game.name} className="bg-theme-card p-8 rounded-lg border border-theme text-center interactive-card flex flex-col justify-between">
                                             <div>
                                                 <h4 className="text-2xl font-bold">{game.name}</h4>
                                                 <p className="text-klar font-semibold text-lg">{game.abbr}</p>
                                             </div>
                                             <button onClick={() => setSelectedGame(game)} className="mt-6 w-full py-2 px-4 rounded-lg font-semibold text-center transition bg-klar/20 hover:bg-klar/30 text-klar border border-klar">
                                                 View Features
                                             </button>
                                         </div>
                                 ))}
                            </div>
                        </section>
                        <section id="pricing" className="py-12 text-center fade-in-section">
                            <h3 className="text-4xl font-bold">Choose Your Access</h3>
                            <div className="mt-12 grid md:grid-cols-3 gap-8 items-center">
                                {topTiers.map(tier => (
                                    <div key={tier.name} className={`relative bg-theme-card p-8 rounded-lg border text-center interactive-card flex flex-col ${tier.isFeatured ? 'border-klar shadow-2xl shadow-klar/40 featured-card-js' : 'border-theme'}`}>
                                        {(tier.isFeatured || tier.specialTag) && (
                                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 text-sm font-semibold text-white rounded-full shadow-md ${
                                                tier.isFeatured ? 'bg-klar' : 
                                                tier.specialTag === 'On Sale' ? 'bg-red-500' : 'bg-indigo-500'
                                            }`}>
                                                {tier.isFeatured ? 'Best Value' : tier.specialTag}
                                            </div>
                                        )}
                                        <h4 className="text-xl font-bold mb-2 h-12 flex items-center justify-center">{tier.name}</h4>
                                        <div className="flex justify-center items-end gap-2 mb-4">
                                            <p className="text-4xl font-extrabold text-klar">{tier.price}</p>
                                            {tier.robuxPrice && (
                                                <>
                                                    <span className="text-xl text-theme-secondary pb-1">or</span>
                                                    <p className="text-4xl font-extrabold text-klar">R${tier.robuxPrice}</p>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 mt-auto">
                                            <a href={tier.url} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-2 px-4 rounded-lg font-semibold text-center transition-all duration-300 bg-klar/20 hover:bg-klar/30 text-klar border border-klar hover:shadow-[0_0_15px_var(--klar-primary)]">Purchase (USD)</a>
                                            {tier.robuxUrl && (
                                                <a href={tier.robuxUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-2 px-4 rounded-lg font-semibold text-center transition bg-[#00A2FF]/20 hover:bg-[#00A2FF]/30 text-[#00A2FF] border border-[#00A2FF]">
                                                    Purchase (Robux)
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 grid md:grid-cols-3 gap-8">
                                {bottomTiers.map(tier => (
                                    <div key={tier.name} className="relative bg-theme-card p-8 rounded-lg border text-center interactive-card flex flex-col transition-[box-shadow,border-color] duration-300 border-theme">
                                        <h4 className="text-xl font-bold mb-2 h-12 flex items-center justify-center">{tier.name}</h4>
                                        <div className="flex justify-center items-end gap-2 mb-4">
                                            <p className="text-4xl font-extrabold text-klar">{tier.price}</p>
                                            {tier.robuxPrice && (
                                                <>
                                                    <span className="text-xl text-theme-secondary pb-1">or</span>
                                                    <p className="text-4xl font-extrabold text-klar">R${tier.robuxPrice}</p>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 mt-auto">
                                            <a href={tier.url} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-2 px-4 rounded-lg font-semibold text-center transition-all duration-300 bg-klar/20 hover:bg-klar/30 text-klar border border-klar hover:shadow-[0_0_15px_var(--klar-primary)]">Purchase (USD)</a>
                                            {tier.robuxUrl && (
                                                <a href={tier.robuxUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-2 px-4 rounded-lg font-semibold text-center transition bg-[#00A2FF]/20 hover:bg-[#00A2FF]/30 text-[#00A2FF] border border-[#00A2FF]">
                                                    Purchase (Robux)
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-8">
                                <button onClick={() => setIsCompareModalOpen(true)} className="py-2 px-6 rounded-lg font-semibold text-center transition bg-theme-button-secondary hover:bg-theme-button-secondary-hover text-theme-button-secondary-text">
                                    Compare All Plans
                                </button>
                            </div>
                        </section>
                        <section id="free" className="py-12 fade-in-section">
                            <div className="text-center">
                                <h3 className="text-4xl font-bold">Get Free Access</h3>
                                <p className="text-lg text-theme-secondary mt-4 max-w-2xl mx-auto">Follow these three simple steps to get a free key and start using Klar Hub.</p>
                            </div>
                            <div className="mt-12 max-w-3xl mx-auto">
                                <div className="relative pl-12">
                                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-theme"></div>
                                    <div className="relative mb-12">
                                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">
                                            <div className="z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl bg-klar/10 border-2 border-klar text-klar shadow-[0_0_15px_rgba(85,134,214,0.4)] backdrop-blur-sm">1</div>
                                        </div>
                                        <div className="ml-4 p-6 bg-theme-card border border-theme rounded-lg">
                                            <h4 className="text-2xl font-semibold">Get Your Key</h4>
                                            <p className="text-theme-secondary mt-2">Choose an option below and complete the required steps on our partner's site to receive your script key.</p>
                                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                                <a href="https://ads.luarmor.net/get_key?for=Free_Klar_Access_Linkvertise-vdVzClkaaLyp" target="_blank" rel="noopener noreferrer" className="flex-1 inline-block py-2 px-6 rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white">Get Key (Linkvertise)</a>
                                                <a href="https://ads.luarmor.net/get_key?for=Free_Klar_Access-jfTfOGvFxqSh" target="_blank" rel="noopener noreferrer" className="flex-1 inline-block py-2 px-6 rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white">Get Key (Lootlabs)</a>
                                                <a href="https://ads.luarmor.net/get_key?for=Free_Klar_Access_Workink-dULHAjlXrxDx" target="_blank" rel="noopener noreferrer" className="flex-1 inline-block py-2 px-6 rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white">Get Key (Workink)</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative mb-12">
                                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">
                                            <div className="z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl bg-klar/10 border-2 border-klar text-klar shadow-[0_0_15px_rgba(85,134,214,0.4)] backdrop-blur-sm">2</div>
                                        </div>
                                        <div className="ml-4 p-6 bg-theme-card border border-theme rounded-lg">
                                            <h4 className="text-2xl font-semibold">Prepare Your Script</h4>
                                            <p className="text-theme-secondary mt-2">Paste the key you received from Step 1 into the box below. Then, click the copy button to get your final script.</p>
                                            <div className="mt-4 bg-theme-dark p-4 rounded-lg relative">
                                                <pre className="text-gray-300 overflow-x-auto custom-scrollbar">
                                                    <code>
                                                        {'script_key="'}<span className="text-klar">{freeKey || "insert key"}</span>{'";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/50da22b3657a22c353b0dde631cb1dcf.lua"))()'}
                                                    </code>
                                                </pre>
                                                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={freeKey}
                                                        onChange={(e) => setFreeKey(e.target.value)}
                                                        placeholder="Paste your key here"
                                                        className="w-full bg-theme-button-secondary border border-theme rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-klar p-2"
                                                        aria-label="Paste your script key"
                                                    />
                                                    <button onClick={handleCopyScript} className="flex-shrink-0 bg-klar hover:bg-klar-light text-white px-4 py-2 text-sm font-semibold rounded-lg transition relative overflow-hidden">
                                                        <span className={`flex items-center gap-2 transition-transform duration-300 ${scriptCopied ? '-translate-y-full' : 'translate-y-0'}`}>
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM5 11a1 1 0 100 2h4a1 1 0 100-2H5z" /></svg>
                                                            Copy Script
                                                        </span>
                                                        <span className={`absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-300 ${scriptCopied ? 'translate-y-0' : 'translate-y-full'}`}>
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                            Copied!
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">
                                            <div className="z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl bg-klar/10 border-2 border-klar text-klar shadow-[0_0_15px_rgba(85,134,214,0.4)] backdrop-blur-sm">3</div>
                                        </div>
                                        <div className="ml-4 p-6 bg-theme-card border border-theme rounded-lg">
                                            <h4 className="text-2xl font-semibold">Execute</h4>
                                            <p className="text-theme-secondary mt-2">You're all set! Now just paste the full script you copied into your executor and run it in-game.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section id="reviews" className="py-12 text-center fade-in-section">
                            <h3 className="text-4xl font-bold">Trusted by Players Worldwide</h3>
                            <div className="mt-12 grid md:grid-cols-3 gap-8">
                                {testimonials.map((t, i) => (
                                     <div key={i} className="bg-theme-card p-6 rounded-lg border border-theme text-left interactive-card flex flex-col h-full">
                                         <div className="flex-grow"><p className="text-theme-secondary italic text-lg">"{t.text}"</p></div>
                                         <div className="mt-4 pt-4 border-t border-theme">
                                             <div className="flex justify-between items-center">
                                                 <span className="text-klar font-semibold">{t.name}</span>
                                                 <div className="flex">
                                                     {Array(t.stars).fill(0).map((_, i) => <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                                                 </div>
                                             </div>
                                             <p className="text-gray-500 text-sm mt-1">{t.date}</p>
                                         </div>
                                     </div>
                                ))}
                            </div>
                        </section>
                        <section id="faq" className="py-12 max-w-3xl mx-auto fade-in-section">
                            <h3 className="text-4xl font-bold text-center">Frequently Asked Questions</h3>
                            <div className="mt-12 space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="bg-theme-card border border-theme rounded-lg faq-item">
                                        <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full flex justify-between items-center p-6 text-left">
                                            <span className="text-lg font-semibold">{faq.q}</span>
                                            <svg className={`w-6 h-6 text-theme-secondary transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                        <div className="grid transition-all duration-500 ease-in-out" style={{gridTemplateRows: activeFaq === index ? '1fr' : '0fr'}}>
                                            <div className="overflow-hidden"><p className="p-6 pt-0 text-theme-secondary">{faq.a}</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section id="community" className="py-12 text-center fade-in-section">
                            <div className="bg-theme-card border border-theme rounded-2xl p-8">
                                <h3 className="text-4xl font-bold">Still Have Questions?</h3>
                                <p className="text-lg text-theme-secondary mt-4">Get support and connect with other users on our Discord server.</p>
                                <DiscordCounter />
                                <div className="mt-8 max-w-xs mx-auto">
                                    <a href="https://discord.gg/bGmGSnW3gQ" target="_blank" rel="noopener noreferrer" className="block py-3 px-8 rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white">Join our Community</a>
                                </div>
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
                {isPreviewAnimating && <PreviewAnimation onAnimationEnd={() => { setIsPreviewAnimating(false); setIsPreviewModalOpen(true); }} />}
                {isPreviewModalOpen && <PreviewModal onClose={() => setIsPreviewModalOpen(false)} />}
                {isCompareModalOpen && <ComparePlansModal onClose={() => setIsCompareModalOpen(false)} allTiers={pricingTiers} />}
                <BackToTopButton />
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


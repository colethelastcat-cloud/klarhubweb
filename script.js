const { useState, useEffect, useRef, useCallback } = React;

//=================================================
// 1. HELPER HOOKS & CORE COMPONENTS
//=================================================

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

            // Check if the card is featured to apply a larger hover scale
            const isFeatured = card.classList.contains('featured-card-js');
            const hoverScale = isFeatured ? 1.15 : 1.05;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${hoverScale})`;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };

        const handleMouseLeave = (e) => {
            const card = e.currentTarget;
            // Check if the card is featured to reset it to the correct base size
            const isFeatured = card.classList.contains('featured-card-js');
            const baseScale = isFeatured ? 1.1 : 1;
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(${baseScale})`;
        };

        cards.forEach(card => {
            // A single, consistent transition fixes the flickering/glitching issue.
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


//=================================================
// 2. MODAL & OVERLAY COMPONENTS
//=================================================

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

const GameFeaturesModal = ({ game, onClose }) => {
     return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                 <div className="bg-theme-modal-card rounded-lg shadow-2xl w-full max-w-lg border border-theme">
                     <div className="p-4 border-b border-theme flex justify-between items-center">
                         <h3 className="text-xl font-bold text-theme-primary">{game.name} Features</h3>
                         <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl">×</button>
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
                        <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl">×</button>
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
                        />
                        <button type="submit" className="bg-klar hover:bg-klar-light text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center" disabled={isLoading}>
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
                        <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl">&times;</button>
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
    const [activeTab, setActiveTab] = useState('Catching');
    const [isFading, setIsFading] = useState(false);
    const [previewState, setPreviewState] = useState({
        magnet_power: 25, magnet_chance: 100, arm_size: 3, football_size: 1,
        dime_lead: 11, mag_lead: 12.5, bullet_lead: 4, lead_distance: 0, height_distance: 0,
        walkspeed_value: 20, cframe_speed: 0, jump_power_value: 50, angle_power: 50, hip_height_value: 0, gravity_value: 196.1,
        delay_auto_guard: 0.1, power_auto_boost: 0, swat_distance: 0, prediction_delay: 0,
        hump_speed: 5, underground_size: 0.001, fps_cap: 60,
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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (listeningForBind) {
                if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/i)) {
                    handleValueChange(`${listeningForBind}_bind`, e.key.toUpperCase());
                } else if (e.key === " ") {
                     handleValueChange(`${listeningForBind}_bind`, 'Space');
                } else {
                     handleValueChange(`${listeningForBind}_bind`, e.key);
                }
                setListeningForBind(null);
                e.preventDefault();
            }
        };

        if (listeningForBind) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [listeningForBind, handleValueChange]);

     useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toUpperCase() === ' ' ? 'SPACE' : e.key.toUpperCase();
            
            Object.keys(previewState).forEach(stateKey => {
                if (stateKey.endsWith('_bind') && previewState[stateKey] && previewState[stateKey].toUpperCase() === key) {
                    const featureKey = stateKey.replace('_bind', '_enabled');
                     if (previewState.hasOwnProperty(featureKey)) {
                        handleValueChange(featureKey, !previewState[featureKey]);
                     }
                }
            });
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [previewState, handleValueChange]);


    const tabs = [
        { name: 'Catching', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /><path d="M5 3a1 1 0 000 2h10a1 1 0 100-2H5z" /></svg> },
        { name: 'Throwing', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg> },
        { name: 'Player', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> },
        { name: 'Automatic', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg> },
        { name: 'Physic', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg> },
        { name: 'Visual', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> },
        { name: 'Trolling', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" /></svg> },
        { name: 'UI Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg> },
    ];
    
    const FeatureCard = ({ id, title, icon, children }) => {
        const bindKey = previewState[`${id}_bind`];
        const isListening = listeningForBind === id;
        return(
            <div className="bg-[#18181C] p-3 rounded-md hub-feature-card">
                <div className="flex items-center justify-between text-gray-300 mb-3">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h3 className="font-semibold text-sm">{title}</h3>
                    </div>
                    <button onClick={() => setListeningForBind(id)} className={`text-xs font-mono px-2 py-1 rounded transition-colors ${isListening ? 'bg-blue-500 text-white animate-pulse' : 'bg-black/30 text-gray-400 hover:bg-white/10'}`}>
                        {isListening ? '...' : (bindKey || 'N/A')}
                    </button>
                </div>
                <div className="space-y-3">{children}</div>
            </div>
        );
    };
    
    const Checkbox = ({ id, label }) => {
        const checked = previewState[id] || false;
        return (
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{label}</span>
                <div onClick={() => handleValueChange(id, !checked)} className={`w-9 h-5 rounded-full p-1 flex items-center cursor-pointer transition-colors ${checked ? 'bg-klar justify-end' : 'bg-black/30 justify-start'}`}>
                    <div className="w-3 h-3 bg-white rounded-full transition-transform"></div>
                </div>
            </div>
        );
    };

    const Slider = ({ id, label, min = 0, max = 100, step = 1 }) => {
        const sliderRef = useRef(null);
        const [isDragging, setIsDragging] = useState(false);
        const sliderValue = previewState[id] !== undefined ? previewState[id] : min;

        const handleValueUpdate = useCallback((clientX) => {
            if (!sliderRef.current) return;
            const rect = sliderRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            let percentage = (x / rect.width) * 100;
            percentage = Math.max(0, Math.min(100, percentage));

            let newValue = (percentage / 100) * (max - min) + min;
            newValue = Math.round(newValue / step) * step;

            if (step < 1) {
                const decimalPlaces = String(step).split('.')[1]?.length || 2;
                newValue = parseFloat(newValue.toFixed(decimalPlaces));
            }
            handleValueChange(id, newValue);
        }, [id, min, max, step, handleValueChange]);

        const handleInteractionStart = (clientX) => {
            setIsDragging(true);
            handleValueUpdate(clientX);
        };

        const handleMouseDown = (e) => {
            e.preventDefault();
            handleInteractionStart(e.clientX);
        };

        const handleTouchStart = (e) => {
            handleInteractionStart(e.touches[0].clientX);
        };

        useEffect(() => {
            const handleMouseMove = (e) => {
                if (isDragging) handleValueUpdate(e.clientX);
            };
            const handleTouchMove = (e) => {
                if (isDragging) handleValueUpdate(e.touches[0].clientX);
            };
            const handleInteractionEnd = () => {
                setIsDragging(false);
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleInteractionEnd);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleInteractionEnd);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleInteractionEnd);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleInteractionEnd);
            };
        }, [isDragging, handleValueUpdate]);

        const percentage = ((sliderValue - min) / (max - min)) * 100;

        return (
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-mono text-gray-300 w-12 text-center">{sliderValue}</span>
                </div>
                <div
                    ref={sliderRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    className="w-full h-2 rounded-full bg-black/30 cursor-pointer relative group"
                >
                    <div className="h-full bg-klar rounded-full" style={{ width: `${percentage}%` }}></div>
                    <div
                        className={`w-4 h-4 bg-white border-2 border-klar rounded-full absolute top-1/2 -translate-y-1/2 -translate-x-1/2 slider-thumb ${isDragging ? 'dragging' : ''}`}
                        style={{ left: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };
    
    const Dropdown = ({ id, label, options }) => {
        const selectedValue = previewState[id] || options[0];
        return (
             <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{label}</span>
                 <select value={selectedValue} onChange={(e) => handleValueChange(id, e.target.value)} className="bg-black/30 text-xs text-gray-300 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-klar">
                    {options.map(o => <option key={o}>{o}</option>)}
                </select>
            </div>
        );
    };
    
    const Button = ({ label }) => <button onClick={handleButtonInteraction} className="w-full text-xs bg-black/30 text-gray-300 py-1.5 rounded active:bg-klar/30 active:scale-95 transition-all">{label}</button>
    const TextInput = ({ placeholder }) => <input type="text" placeholder={placeholder} className="w-full bg-black/30 text-xs p-2 rounded border border-gray-600 focus:outline-none focus:border-klar placeholder-gray-500" />

    const renderContent = () => {
        switch (activeTab) {
            case 'Catching':
                return (
                    <>
                        <FeatureCard id="magnets" title="Magnets" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg>}>
                           <Checkbox id="magnets_enabled" label="Magnets" />
                           <Slider id="magnet_power" label="Magnet Power" min={0} max={100} step={1} />
                           <Slider id="magnet_chance" label="Magnet Chance" min={0} max={100} step={1} />
                           <Checkbox id="show_hitbox" label="Show Hitbox" />
                           <Dropdown id="magnet_type" label="Magnet Type" options={["Regular", "Advanced"]} />
                           <Checkbox id="freefall_shape" label="Freefall Shape" />
                           <Dropdown id="hitbox_shape" label="Hitbox Shape" options={["Forcefield", "Box"]} />
                        </FeatureCard>
                         <FeatureCard id="pull_vector" title="Pull Vector" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>}>
                           <Checkbox id="pull_vector_enabled" label="Pull Vector" />
                           <Dropdown id="vector_type" label="Vector Type" options={["Tween", "Linear"]} />
                           <Slider id="vector_distance" label="Distance" min={0} max={50} step={1} />
                           <Slider id="vector_power" label="Power" min={0} max={50} step={1} />
                        </FeatureCard>
                         <FeatureCard id="resizements" title="Resizements" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56v4.82a6 6 0 01-1.292 3.536l-1.992-1.992a4.5 4.5 0 00-6.364-6.364l-1.992-1.992A6 6 0 0115.59 14.37z" /></svg>}>
                           <Checkbox id="arm_resizement_enabled" label="Arm Resizement" />
                           <Slider id="arm_size" label="Arm Size" min={1} max={10} step={1} />
                           <Checkbox id="football_resize_enabled" label="Football Resize" />
                           <Slider id="football_size" label="Football Size" min={1} max={5} step={1} />
                        </FeatureCard>
                         <FeatureCard id="freeze_tech" title="Freeze Tech" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}>
                           <Checkbox id="freeze_tech_enabled" label="Freeze Tech" />
                           <Slider id="freeze_duration" label="Duration" min={0} max={10} step={1} />
                        </FeatureCard>
                    </>
                );
            case 'Throwing':
                 return (
                    <>
                         <FeatureCard id="qb_aimbot" title="QB Aimbot" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56v4.82a6 6 0 01-1.292 3.536l-1.992-1.992a4.5 4.5 0 00-6.364-6.364l-1.992-1.992A6 6 0 0115.59 14.37z" /></svg>}>
                            <Checkbox id="qb_aimbot_enabled" label="QB Aimbot" />
                            <Checkbox id="auto_angle_enabled" label="Auto Angle" />
                            <Checkbox id="smart_fit_enabled" label="Smart Fit" />
                       </FeatureCard>
                         <FeatureCard id="qb_settings" title="QB Settings" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>}>
                            <Slider id="dime_lead" label="Dime Lead" min={0} max={20} step={1} />
                            <Slider id="mag_lead" label="Mag Lead" min={0} max={20} step={0.1}/>
                            <Slider id="bullet_lead" label="Bullet Lead" min={0} max={20} step={1} />
                            <Slider id="lead_distance" label="Lead Distance" min={0} max={20} step={1} />
                            <Slider id="height_distance" label="Height Distance" min={0} max={20} step={1} />
                       </FeatureCard>
                    </>
                 );
            case 'Player':
                 return (
                    <>
                        <FeatureCard id="walkspeed" title="Walkspeed" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>}><Checkbox id="walkspeed_enabled" label="Speed" /><Dropdown id="speed_type" label="Speed Type" options={['Walkspeed', 'Jump']} /><Slider id="walkspeed_value" label="Walkspeed" min={16} max={100} step={1} /><Slider id="cframe_speed" label="CFrame Speed" min={0} max={50} step={1} /></FeatureCard>
                        <FeatureCard id="jump_power" title="Jump Power" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>}><Checkbox id="jump_power_enabled" label="Jump Power" /><Dropdown id="jump_type" label="Type" options={['Normal', 'High']} /><Slider id="jump_power_value" label="Power" min={50} max={200} step={1} /></FeatureCard>
                        <FeatureCard id="angle_enhancer" title="Angle Enhancer" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>}><Checkbox id="angle_enhancer_enabled" label="Angle Enhancer" /><Slider id="angle_power" label="Power" min={0} max={100} step={1} /></FeatureCard>
                        <FeatureCard id="hip_height" title="Hip Height" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>}><Checkbox id="hip_height_enabled" label="Hip Height" /><Slider id="hip_height_value" label="Height" min={-10} max={10} step={1} /></FeatureCard>
                        <FeatureCard id="no_jump" title="No Jump Cooldown" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>}><Checkbox id="no_jump_cooldown_enabled" label="No Jump Cooldown" /></FeatureCard>
                        <FeatureCard id="gravity" title="Gravity" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>}><Checkbox id="gravity_enabled" label="Gravity" /><Slider id="gravity_value" label="Gravity" min={0} max={500} step={0.1}/></FeatureCard>
                    </>
                 );
            case 'Automatic':
                return (
                    <>
                        <FeatureCard id="auto_qb" title="Auto QB" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>}><Checkbox id="auto_qb_enabled" label="Auto QB"/><Dropdown id="auto_qb_type" label="Auto QB Type" options={['Walk', 'Run']}/></FeatureCard>
                        <FeatureCard id="auto_captain" title="Auto Captain" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>}><Checkbox id="auto_captain_enabled" label="Auto Captain"/></FeatureCard>
                        <FeatureCard id="auto_catch" title="Auto Catch" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>}><Checkbox id="auto_catch_enabled" label="Auto Catch (PC Only)"/></FeatureCard>
                        <FeatureCard id="auto_swat" title="Auto Swat" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>}><Checkbox id="auto_swat_enabled" label="Auto Swat (PC Only)"/><Slider id="swat_distance" label="Swat Distance" min={0} max={20} step={1}/></FeatureCard>
                        <FeatureCard id="auto_guard" title="Auto Guard" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>}><Checkbox id="auto_guard_enabled" label="Auto Guard"/><Slider id="delay_auto_guard" label="Delay" min={0} max={1} step={0.1}/></FeatureCard>
                        <FeatureCard id="auto_rush" title="Auto Rush" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>}><Checkbox id="auto_rush_enabled" label="Auto Rush"/><Checkbox id="prediction" label="Prediction"/><Slider id="prediction_delay" label="Delay" min={0} max={10} step={1}/></FeatureCard>
                        <FeatureCard id="auto_boost" title="Auto Boost" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>}><Checkbox id="auto_boost_enabled" label="Auto Boost"/><Slider id="power_auto_boost" label="Power" min={0} max={100} step={1}/></FeatureCard>
                        <FeatureCard id="auto_kick" title="Auto Kick" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>}><Checkbox id="auto_kick_enabled" label="Auto Kick"/><Dropdown id="auto_kick_mode" label="Mode" options={['Perfect', 'Good']}/><Dropdown id="auto_kick_type" label="Type" options={['Normal', 'Weird']}/></FeatureCard>
                        <FeatureCard id="auto_reset" title="Auto Reset" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>}><Checkbox id="auto_reset_enabled" label="Auto Reset"/></FeatureCard>
                    </>
                );
            case 'Physic':
                return(
                    <>
                        <FeatureCard id="endzone_reach" title="Endzone Reach" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>}><Checkbox id="endzone_reach_enabled" label="Endzone Reach"/><Slider id="endzone_reach_value" label="Reach" min={0} max={20} step={1}/></FeatureCard>
                        <FeatureCard id="click_tackle" title="Click Tackle" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>}><Checkbox id="click_tackle_enabled" label="Click Tackle"/><Slider id="click_tackle_distance" label="Distance" min={0} max={20} step={1}/></FeatureCard>
                        <FeatureCard id="tackle_reach" title="Tackle Reach" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>}><Checkbox id="tackle_reach_enabled" label="Tackle Reach"/><Slider id="custom_tackle" label="Custom Tackle" min={0} max={20} step={1}/></FeatureCard>
                        <FeatureCard id="head_size" title="Head Size" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>}><Checkbox id="head_size_enabled" label="Head Size"/><Slider id="resize_head" label="Resize Head" min={1} max={5} step={0.1}/><Slider id="transparency" label="Transparency" min={0} max={1} step={0.1}/></FeatureCard>
                        <FeatureCard id="block_reach" title="Block Reach" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>}><Checkbox id="block_reach_enabled" label="Block Reach"/><Slider id="custom_reach" label="Custom Reach" min={0} max={20} step={1}/><Checkbox id="show_hitbox_block" label="Show Hitbox"/></FeatureCard>
                        <FeatureCard id="quick_tp" title="Quick TP" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>}><Checkbox id="quick_tp_enabled" label="Quick TP"/><Slider id="tp_distance" label="TP Distance" min={0} max={50} step={1}/></FeatureCard>
                        <FeatureCard id="anti" title="Anti" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>}><Checkbox id="anti_jam" label="Anti Jam (Risky)"/><Checkbox id="anti_block" label="Anti Block (Risky)"/><Checkbox id="anti_bench" label="Anti Bench"/></FeatureCard>
                        <FeatureCard id="dive_power" title="Dive Power" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>}><Checkbox id="dive_power_enabled" label="Dive Power"/><Slider id="dive_power_value" label="Power" min={0} max={100} step={1}/></FeatureCard>
                    </>
                );
            case 'Visual':
                return(
                    <>
                        <FeatureCard id="viz_path" title="Visualize Football Path" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}><Checkbox id="viz_path_enabled" label="Visualize Football Path" /></FeatureCard>
                        <FeatureCard id="jersey_changer" title="Jersey Changer" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}><TextInput placeholder="Type something..."/><TextInput placeholder="Type something..."/><Button label="Apply Changes"/></FeatureCard>
                        <FeatureCard id="fps_stuff" title="FPS Related Stuff" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}><Checkbox id="low_graphics" label="Low Graphics"/><Slider id="fps_cap" label="FPS Cap" min={30} max={240} step={1}/></FeatureCard>
                        <FeatureCard id="time_of_day" title="Time of Day" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}><Checkbox id="time_of_day_enabled" label="Time Of Day"/><Dropdown id="time_choose" label="Choose" options={['Morning', 'Day', 'Night']}/></FeatureCard>
                        <FeatureCard id="no_trail" title="No Football Trail" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}><Checkbox id="no_trail_enabled" label="No Football Trail"/></FeatureCard>
                        <FeatureCard id="football_highlight" title="Football Highlight" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}><Checkbox id="football_highlight_enabled" label="Football Highlight"/></FeatureCard>
                        <FeatureCard id="jump_predict" title="Jump/Dive Prediction" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}><Checkbox id="jump_predict_enabled" label="Jump/Dive Prediction"/><Dropdown id="predict_type" label="Prediction Type" options={['Jump', 'Dive']}/></FeatureCard>
                        <FeatureCard id="destroy_stadium" title="Destroy Stadium" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}><Checkbox id="destroy_stadium_enabled" label="Destroy Stadium"/></FeatureCard>
                        <FeatureCard id="catch_effect" title="Catch Effect" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}><Checkbox id="catch_effect_enabled" label="Catch Effect"/><Dropdown id="effect_style" label="Effect Style" options={['Expand', 'Shrink']}/></FeatureCard>
                    </>
                );
            case 'Trolling':
                return (
                    <>
                        <FeatureCard id="trash_talk" title="Trash Talk" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" /></svg>}><Button label="Send Trash Talk" /></FeatureCard>
                        <FeatureCard id="underground" title="Underground" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" /></svg>}><Checkbox id="underground_enabled" label="Underground" /><Slider id="underground_size" min={0.001} max={1} step={0.001}/></FeatureCard>
                        <FeatureCard id="hump" title="Hump Nearest Player" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" /></svg>}><Checkbox id="hump_enabled" label="Hump Nearest Player" /><Slider id="hump_speed" min={1} max={20} step={1} /></FeatureCard>
                        <FeatureCard id="no_oob" title="No OOB" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" /></svg>}><Checkbox id="no_oob_enabled" label="No OOB" /></FeatureCard>
                    </>
                );
             case 'UI Settings':
                return (
                    <div className="col-span-2">
                       <FeatureCard id="configs" title="Configurations" icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0zM10 13a3 3 0 100-6 3 3 0 000 6z" /></svg>}>
                        <TextInput placeholder="Type Config Name..." />
                        <Button label="Save Config" />
                        <Button label="Load Config" />
                        <Button label="Reset Config" />
                    </FeatureCard>
                    </div>
                );
            default:
                return <div className="col-span-2 text-center text-gray-500 pt-10">Select a tab from the left.</div>;
        }
    };


    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                <div className="w-[800px] h-[500px] bg-[#0D0D0F] text-white rounded-lg flex overflow-hidden border border-gray-800 shadow-2xl shadow-black/50">
                    <div className="w-48 bg-[#18181C] p-4 flex flex-col">
                        <h1 className="text-lg font-bold">Klar Hub | <span className="text-klar">FF2</span></h1>
                        <div className="mt-6 flex-grow space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => handleTabClick(tab.name)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors relative ${activeTab === tab.name ? 'text-white bg-klar/10' : 'text-gray-400 hover:bg-white/5'}`}
                                >
                                    {tab.icon}
                                    <span>{tab.name}</span>
                                    {activeTab === tab.name && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-klar rounded-r-full"></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={`flex-1 p-6 overflow-y-auto custom-scrollbar transition-opacity duration-150 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                       <div className="hub-content-inner grid grid-cols-1 md:grid-cols-2 gap-4">
                          {renderContent()}
                       </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

const ComparePlansModal = ({ onClose, allTiers }) => {
    // Define the features to compare. This can be expanded easily.
    const features = [
        { name: 'Price', key: 'price' },
        { name: 'Robux Price', key: 'robuxPrice' },
        { 
            name: 'Duration', 
            // Custom logic to determine duration from the tier name
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
            // Render a checkmark for all Klar access plans
            getValue: (tier) => tier.name.includes('Klar') ? '✔️' : 'N/A'
        },
        { 
            name: 'Premium Support',
            // Render a checkmark for all paid plans
            getValue: (tier) => '✔️'
        },
    ];

    return (
        <Modal onClose={onClose}>
            {(handleClose) => (
                <div className="bg-theme-modal-card rounded-lg shadow-2xl w-full max-w-4xl border border-theme">
                    <div className="p-4 border-b border-theme flex justify-between items-center">
                        <h3 className="text-xl font-bold text-theme-primary">Compare All Plans</h3>
                        <button onClick={handleClose} className="text-theme-secondary hover:text-theme-primary text-2xl">&times;</button>
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
                                {/* Purchase buttons row */}
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
                 <button onClick={onGameClick} className="hidden md:block text-sm font-semibold text-theme-secondary hover:text-theme-primary transition border border-theme hover:border-klar px-4 py-2 rounded-lg">Play a Game</button>
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

const App = () => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
    const [isGameOpen, setIsGameOpen] = useState(false);
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


    useEffect(() => {
        window.scrollTo(0, 0);
        const preloader = document.getElementById('preloader');
        setTimeout(() => {
            if(preloader) preloader.classList.add('loaded')
        }, 1000);
    }, []);

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
        navigator.clipboard.writeText(scriptText).then(() => {
            setScriptCopied(true);
            setTimeout(() => setScriptCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy script: ', err);
        });
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
            <AuroraBackground />
            <div className="relative z-10">
                <Header
                    headerRef={headerRef}
                    onScrollTo={handleScrollTo}
                    onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    onTosClick={() => setIsTosModalOpen(true)}
                    isMobileMenuOpen={isMobileMenuOpen}
                    activeSection={activeSection}
                    onGameClick={() => setIsGameOpen(true)}
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
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" style={{stopColor: '#22c55e', stopOpacity:1}} />
                                                <stop offset="100%" style={{stopColor: '#4ade80', stopOpacity:1}} />
                                            </linearGradient>
                                        </defs>
                                        <path d="M12 2L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 2ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="url(#grad1)"/>
                                    </svg>
                                    <span>100% Undetected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">⚡</span>
                                    <span>Lightning Fast</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity:1}} />
                                                <stop offset="100%" style={{stopColor: '#60a5fa', stopOpacity:1}} />
                                            </linearGradient>
                                        </defs>
                                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="url(#grad3)"/>
                                    </svg>
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
                {isGameOpen && <KlarClickerGameModal onClose={() => setIsGameOpen(false)} />}
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


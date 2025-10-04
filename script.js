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

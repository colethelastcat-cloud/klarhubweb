const { useState, useEffect, useRef } = React;



// --- Helper Hooks ---

const useInteractiveCard = () => {

    useEffect(() => {

        const cards = document.querySelectorAll('.interactive-card');

        const handleMouseMove = (e) => {

            const card = e.currentTarget;

            const rect = card.getBoundingClientRect();

            const x = e.clientX - rect.left;

            const y = e.clientY - rect.top;

            // Increased the tilt effect

            const rotateX = (y - rect.height / 2) / 8;

            const rotateY = (rect.width / 2 - x) / 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            card.style.setProperty('--mouse-x', `${x}px`);

            card.style.setProperty('--mouse-y', `${y}px`);

        };

        const handleMouseLeave = (e) => {

            e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';

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



const useFadeInSection = () => {

     useEffect(() => {

        const sections = document.querySelectorAll('.fade-in-section');

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) entry.target.classList.add('is-visible');

            });

        }, { threshold: 0.1 });

        sections.forEach(section => observer.observe(section));

        return () => observer.disconnect();

    }, []);

};



const useAnimatedCounter = (target, duration = 2000) => {

    const [count, setCount] = useState(0);

    const ref = useRef(null);

    useEffect(() => {

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

                observer.unobserve(ref.current);

            }

        }, { threshold: 0.5 });

        if (ref.current) observer.observe(ref.current);

        return () => { if (observer && ref.current) observer.unobserve(ref.current); }

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



// --- Components ---

const Logo = ({ onScrollTo }) => (

    <svg 

        onClick={() => onScrollTo('home')}

        className="h-8 w-auto cursor-pointer" 

        viewBox="0 0 100 100" 

        fill="none" 

        xmlns="http://www.w3.org/2000/svg"

    >

        <path d="M12 10 L12 90 L28 90 L28 60 L60 90 L75 90 L40 50 L75 10 L60 10 L28 40 L28 10 L12 10 Z" fill="var(--text-primary)" stroke="var(--text-primary)" strokeWidth="4"/>

    </svg>

);





// Discord Counter Component

const DiscordCounter = () => {

    const [onlineCount, setOnlineCount] = useState(null);

    const serverId = '1357439616877072545'; // Your provided server ID



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

                        console.error(`Discord API Error for Server ID ${serverId}: ${discordData.message} (Code: ${discordData.code})`);

                        console.warn("Please double-check your Server ID and ensure the widget is enabled in Server Settings > Widget, and that you have saved the changes.");

                    } else if (discordData.presence_count !== undefined) {

                        setOnlineCount(discordData.presence_count);

                    } else {

                        setOnlineCount('N/A');

                        console.warn("Could not fetch Discord presence count. The API response was unusual.");

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

        <div className="mt-4 text-lg text-gray-400">

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

                    style={{ top: spot.top, left: spot.left, width: spot.size, height: spot.size, opacity: 'var(--aurora-opacity, 0.1)' }}

                />

            ))}

        </div>

    );

};



const Modal = ({ children, onClose, animationClasses }) => {

    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {

        setIsAnimating(true);

        const handleEsc = e => e.key === 'Escape' && handleClose();

        document.addEventListener('keydown', handleEsc);

        return () => document.removeEventListener('keydown', handleEsc);

    }, []);



    const handleClose = () => {

        setIsAnimating(false);

        setTimeout(onClose, 300);

    };



    return (

        <div onClick={handleClose} className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>

             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

             <div onClick={e => e.stopPropagation()} className={`relative transition-all duration-300 ${isAnimating ? animationClasses.enterActive : animationClasses.exitActive}`}>

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

            const urlObj = new URL(url);

            if (urlObj.hostname === 'youtu.be') videoId = urlObj.pathname.slice(1);

            else if (urlObj.hostname.includes('youtube.com')) {

                if (urlObj.pathname === '/watch') videoId = urlObj.searchParams.get('v');

                else if (urlObj.pathname.startsWith('/embed/')) videoId = urlObj.pathname.split('/embed/')[1].split('?')[0];

            }

        } catch (error) { console.error("Invalid URL:", url, error); }

        return videoId;

    };



    const handlePrev = () => setCurrentIndex(prev => (prev === 0 ? videoUrls.length - 1 : prev - 1));

    const handleNext = () => setCurrentIndex(prev => (prev === videoUrls.length - 1 ? 0 : prev + 1));



    return (

        <Modal onClose={onClose} animationClasses={{enterActive: 'opacity-100 scale-100', exitActive: 'opacity-0 scale-95'}}>

            {(handleClose) => (

                <div className="w-[95vw] h-[80vh] relative group flex items-center justify-center">

                    <button onClick={handleClose} className="absolute top-0 right-0 z-50 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg transform translate-x-1/2 -translate-y-1/2">×</button>

                    {videoUrls.map((url, index) => {

                        const isActive = index === currentIndex;

                        const videoId = getYoutubeVideoId(url);

                        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

                        let offset = index - currentIndex;

                        const numItems = videoUrls.length;

                        if (Math.abs(offset) > numItems / 2) offset = offset > 0 ? offset - numItems : offset + numItems;

                        if (Math.abs(offset) > 1) return null;



                        const style = {

                            transform: `translateX(${offset * 75}%) scale(${isActive ? 1 : 0.6})`,

                            opacity: isActive ? 1 : 0.5,

                            zIndex: numItems - Math.abs(offset),

                            pointerEvents: 'all',

                        };



                        return (

                            <div key={index} className="absolute w-[65%] aspect-video transition-all duration-500 ease-in-out" style={style} onClick={() => !isActive && setCurrentIndex(index)}>

                                {isActive ? (

                                    <iframe className="w-full h-full rounded-lg shadow-2xl border-2 border-klar" src={url} title={`Klar Hub Demo Video ${index + 1}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>

                                ) : (

                                    <div className="w-full h-full cursor-pointer"><img src={thumbnailUrl} className="w-full h-full object-cover rounded-lg" alt={`Video thumbnail ${index + 1}`} /></div>

                                )}

                            </div>

                        );

                    })}

                    {videoUrls.length > 1 && (

                        <>

                            <button onClick={handlePrev} className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-40"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>

                            <button onClick={handleNext} className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-40"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>

                        </>

                    )}

                </div>

            )}

        </Modal>

    );

};



const GameFeaturesModal = ({ game, onClose }) => {

     return (

        <Modal onClose={onClose} animationClasses={{enterActive: 'opacity-100 scale-100', exitActive: 'opacity-0 scale-95'}}>

            {(handleClose) => (

                 <div className="bg-modal-card-bg rounded-lg shadow-2xl w-full max-w-lg border border-klar/50">

                     <div className="p-4 border-b border-border-color flex justify-between items-center">

                         <h3 className="text-xl font-bold text-white">{game.name} Features</h3>

                         <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">×</button>

                     </div>

                     <div className="p-6">

                         <ul className="space-y-3 text-gray-300">

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

        <Modal onClose={onClose} animationClasses={{enterActive: 'opacity-100 scale-100', exitActive: 'opacity-0 scale-95'}}>

            {(handleClose) => (

                <div className="bg-modal-card-bg rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-klar/50">

                    <div className="p-4 border-b border-border-color flex justify-between items-center flex-shrink-0">

                        <h3 className="text-lg font-bold text-white">AI Script Helper</h3>

                        <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">×</button>

                    </div>

                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">

                        {chatHistory.map((msg, index) => (

                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                                <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-klar text-white' : 'bg-button-secondary-bg text-button-secondary-text'}`}>

                                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\* (.*?)(?:\n|$)/g, '<li>$1</li>').replace(/<li>/g, '<li class="list-disc ml-4">') }}></p>

                                </div>

                            </div>

                        ))}

                        {isLoading && (

                            <div className="flex justify-start">

                                <div className="bg-button-secondary-bg text-button-secondary-text p-3 rounded-lg flex items-center gap-2">

                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>

                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>

                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>

                                </div>

                            </div>

                        )}

                        <div ref={chatEndRef} />

                    </div>

                     {chatHistory.length === 1 && (

                        <div className="p-4 border-t border-border-color flex-shrink-0">

                            <p className="text-sm text-gray-400 mb-2 text-center">Or try one of these:</p>

                            <div className="flex flex-wrap justify-center gap-2">

                                {quickQuestions.map(q => (

                                    <button key={q} onClick={() => sendMessage(q)} className="bg-button-secondary-bg hover:bg-button-secondary-hover-bg text-button-secondary-text text-sm px-3 py-1 rounded-full transition">{q}</button>

                                ))}

                            </div>

                        </div>

                    )}

                    <form onSubmit={handleFormSubmit} className="p-4 border-t border-border-color flex gap-2 flex-shrink-0">

                        <input

                            type="text"

                            value={input}

                            onChange={(e) => setInput(e.target.value)}

                            placeholder="Ask a question..."

                            className="w-full bg-button-secondary-bg border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-klar p-3"

                        />

                        <button type="submit" className="bg-klar hover:bg-klar-light text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center" disabled={isLoading}>

                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086L2.279 16.76a.75.75 0 00.95.826l14.25-3.562a.75.75 0 000-1.406L3.105 2.289z" /></svg>

                        </button>

                    </form>

                </div>

            )}

        </Modal>

    );

};



// --- KLAR CLICKER GAME ---

const KlarClickerGameModal = ({ onClose }) => {

    const [klars, setKlars] = useState(0);

    const [clickLevel, setClickLevel] = useState(1);

    const [autoLevel, setAutoLevel] = useState(0);

    const [loading, setLoading] = useState(true);



    const firebaseRef = useRef({});



    const klarsPerClick = 1 + (clickLevel - 1);

    const klarsPerSecond = autoLevel * 0.5;

    const clickUpgradeCost = Math.floor(10 * Math.pow(1.15, clickLevel));

    const autoUpgradeCost = Math.floor(25 * Math.pow(1.2, autoLevel));



    // Firebase Initialization and Data Loading

    useEffect(() => {

        const initFirebase = async () => {

            try {

                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

                if (typeof firebase === 'undefined' || typeof __firebase_config === 'undefined') {

                    console.warn("Firebase is not configured. Game saving will be disabled.");

                    setLoading(false);

                    firebaseRef.current = { disabled: true };

                    return;

                }

                const firebaseConfig = JSON.parse(__firebase_config);

                const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

                

                if (!firebase.apps.length) {

                    firebase.initializeApp(firebaseConfig);

                }

                

                const auth = firebase.auth();

                const db = firebase.firestore();



                if (!auth.currentUser) {

                    if (initialAuthToken) {

                        await auth.signInWithCustomToken(initialAuthToken);

                    } else {

                        await auth.signInAnonymously();

                    }

                }

                

                const userId = auth.currentUser.uid;

                if (!userId) {

                    throw new Error("User not authenticated");

                }

                

                const docRef = db.doc(`artifacts/${appId}/users/${userId}/klar_clicker_save`);

                firebaseRef.current = { db, userId, docRef, disabled: false };



                const docSnap = await docRef.get();

                if (docSnap.exists) {

                    const data = docSnap.data();

                    setKlars(data.klars || 0);

                    setClickLevel(data.clickLevel || 1);

                    setAutoLevel(data.autoLevel || 0);

                }

            } catch (error) {

                console.error("Firebase initialization or data loading failed:", error);

                firebaseRef.current = { disabled: true };

            } finally {

                setLoading(false);

            }

        };



        initFirebase();

    }, []);



    // NEW Smooth Auto-Klar generator

    useEffect(() => {

        if (loading || klarsPerSecond === 0) return;



        let lastUpdateTime = performance.now();

        let animationFrameId;



        const updateKlars = (currentTime) => {

            const deltaTime = currentTime - lastUpdateTime;

            lastUpdateTime = currentTime;



            const klarsToAdd = (klarsPerSecond * deltaTime) / 1000;

            setKlars(currentKlars => currentKlars + klarsToAdd);



            animationFrameId = requestAnimationFrame(updateKlars);

        };



        animationFrameId = requestAnimationFrame(updateKlars);



        return () => cancelAnimationFrame(animationFrameId);

    }, [loading, klarsPerSecond]);





    // Auto-save progress

    useEffect(() => {

        if (loading || firebaseRef.current.disabled) return;

        const saveGameState = async () => {

            if (firebaseRef.current.docRef) {

                const gameState = { klars, clickLevel, autoLevel };

                await firebaseRef.current.docRef.set(gameState, { merge: true });

            }

        };



        const interval = setInterval(saveGameState, 5000); // Save every 5 seconds

        return () => clearInterval(interval);

    }, [loading, klars, clickLevel, autoLevel]);

    

    const handleLogoClick = () => {

        setKlars(k => k + klarsPerClick);

    };



    const buyUpgrade = (type) => {

        if (type === 'click' && klars >= clickUpgradeCost) {

            setKlars(k => k - clickUpgradeCost);

            setClickLevel(l => l + 1);

        }

        if (type === 'auto' && klars >= autoUpgradeCost) {

            setKlars(k => k - autoUpgradeCost);

            setAutoLevel(l => l + 1);

        }

    };



    return (

        <Modal onClose={onClose} animationClasses={{enterActive: 'opacity-100 scale-100', exitActive: 'opacity-0 scale-95'}}>

            {(handleClose) => (

                <div className="bg-modal-card-bg rounded-lg shadow-2xl w-full max-w-lg border border-klar/50 text-white p-4">

                    <div className="flex justify-between items-center mb-4">

                         <h3 className="text-xl font-bold">Klar Clicker</h3>

                         <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>

                    </div>



                    {loading ? <div className="text-center p-8">Loading Game...</div> :

                    (<>

                        <div className="text-center p-4 bg-background-dark rounded-lg mb-4">

                            <h2 className="text-4xl font-bold text-klar">{klars.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1})}</h2>

                            <p className="text-sm text-text-secondary">Klars</p>

                            <p className="text-xs text-text-secondary mt-1">{klarsPerSecond.toFixed(1)} per second</p>

                        </div>



                        <div 

                            className="w-48 h-48 mx-auto my-4 cursor-pointer active:scale-95 transition-transform select-none flex items-center justify-center"

                            onClick={handleLogoClick}

                        >

                            <Logo onScrollTo={() => {}}/>

                        </div>

                        

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Click Upgrade */}

                            <div className="bg-background-dark p-4 rounded-lg">

                                <h4 className="font-bold">Click Power</h4>

                                <p className="text-sm text-text-secondary mb-2">+{klarsPerClick.toLocaleString()} Klars per click (Lvl {clickLevel})</p>

                                <button 

                                    onClick={() => buyUpgrade('click')} 

                                    disabled={klars < clickUpgradeCost}

                                    className="w-full bg-klar disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition"

                                >

                                    Cost: {clickUpgradeCost.toLocaleString()}

                                </button>

                            </div>



                            {/* Auto Upgrade */}

                            <div className="bg-background-dark p-4 rounded-lg">

                                <h4 className="font-bold">Auto Klars</h4>

                                <p className="text-sm text-text-secondary mb-2">+{klarsPerSecond.toFixed(1)} Klars per second (Lvl {autoLevel})</p>

                                <button 

                                    onClick={() => buyUpgrade('auto')} 

                                    disabled={klars < autoUpgradeCost}

                                    className="w-full bg-klar disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition"

                                >

                                    Cost: {autoUpgradeCost.toLocaleString()}

                                </button>

                            </div>

                        </div>

                    </>)}

                </div>

            )}

        </Modal>

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

    const [theme, setTheme] = useState('dark');

    const [freeKey, setFreeKey] = useState('');



    // REBUILT THEME TOGGLE LOGIC

    useEffect(() => {

        const root = document.documentElement;

        

        // CSS Variables for themes

        const themes = {

            dark: {

                '--background-dark': '#121212',

                '--background-light': '#1E1E1E',

                '--text-primary': '#EAEAEA',

                '--text-secondary': '#A0A0A0',

                '--border-color': '#374151',

                '--header-bg': 'rgba(0,0,0,0.5)',

                '--card-bg': 'rgba(0,0,0,0.3)',

                '--modal-card-bg': '#1E1E1E',

                '--button-secondary-bg': '#374151',

                '--button-secondary-hover-bg': '#4b5563',

                '--button-secondary-text': '#d1d5db',

                '--aurora-opacity': '0.1'

            },

            light: {

                '--background-dark': '#f0f2f5',

                '--background-light': '#ffffff',

                '--text-primary': '#1f2937',

                '--text-secondary': '#6b7280',

                '--border-color': '#d1d5db',

                '--header-bg': 'rgba(255,255,255,0.8)',

                '--card-bg': '#ffffff',

                '--modal-card-bg': '#ffffff',

                '--button-secondary-bg': '#e5e7eb',

                '--button-secondary-hover-bg': '#d1d5db',

                '--button-secondary-text': '#374151',

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

        setTimeout(() => preloader.classList.add('loaded'), 1000);

    }, []);

    useFadeInSection();

    useInteractiveCard();

    const headerRef = useRef(null);

    const [headerHeight, setHeaderHeight] = useState(80);

    const activeSection = useActiveNav(headerHeight);

    useEffect(() => { if(headerRef.current) setHeaderHeight(headerRef.current.offsetHeight); }, []);

    const [usersRef, usersCount] = useAnimatedCounter(80);

    const [updatesRef, updatesCount] = useAnimatedCounter(20);

    const [uptimeRef, uptimeCount] = useAnimatedCounter(99);

    

    // SMOOTH SCROLLING

    const handleScrollTo = (id) => {

         const element = document.getElementById(id);

         if (element) {

            const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({ top: offsetPosition, behavior: "smooth" });

         }

         setIsMobileMenuOpen(false);

    };



    const handleCopyScript = () => {

        const keyToUse = freeKey || "insert key"; // Use placeholder if empty

        const scriptText = `script_key="${keyToUse}";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/50da22b3657a22c353b0dde631cb1dcf.lua"))()`;

        navigator.clipboard.writeText(scriptText).then(() => {

            setScriptCopied(true);

            setTimeout(() => setScriptCopied(false), 2000);

        }).catch(err => {

            console.error('Failed to copy script: ', err);

        });

    };



    const demoVideos = [

        "https://www.youtube.com/embed/d2hR2gRhME0?autoplay=1",

        "https://www.youtube.com/embed/97osD4zLYpA?autoplay=1",

        "https://www.youtube.com/embed/03Y0NuUEOV8?autoplay=1"

    ];



    const pricingTiers = [

        { name: '1 Week Klar Access', price: '$1.50', url: 'https://klarhub.sellhub.cx/product/1-Week/' },

        { name: '1 Month Klar Access', price: '$2.50', url: 'https://klarhub.sellhub.cx/product/1-Month-Klar-Access/' },

        { name: '3 Month Klar Access', price: '$3.75', url: 'https://klarhub.sellhub.cx/product/3-Month-Access/' },

        { name: '6 Month Klar Access', price: '$5.50', url: 'https://klarhub.sellhub.cx/product/6-Month-Klar-Access/' },

        { name: 'Lifetime Klar', price: '$15.00', url: 'https://klarhub.sellhub.cx/product/New-product/', isFeatured: true }, // Highlighted plan

        { name: 'Extreme Alt Gen', price: '$1.00', url: 'https://klarhub.sellhub.cx/product/Extreme-Alt-Gen/' }

    ];

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

        <div className="relative">

            <AuroraBackground />

            <div className="relative z-10">

                <Header

                    headerRef={headerRef}

                    onScrollTo={handleScrollTo}

                    onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}

                    isMobileMenuOpen={isMobileMenuOpen}

                    activeSection={activeSection}

                    onGameClick={() => setIsGameOpen(true)}

                    theme={theme}

                    setTheme={setTheme}

                />

                 <MobileMenu

                    isOpen={isMobileMenuOpen}

                    onScrollTo={handleScrollTo}

                    onClose={() => setIsMobileMenuOpen(false)}

                />

                <main>

                    <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center p-8 pt-20">

                        <div className="relative z-10">

                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">Welcome to <span className="text-klar">Klar</span> Hub</h2>

                            <p className="text-lg md:text-xl text-gray-400 mt-4 max-w-2xl mx-auto">The pinnacle of script performance and reliability for FF2.</p>

                            <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6 text-gray-400">

                                <div className="flex items-center gap-2">

                                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>

                                    <span>100% Undetected</span>

                                </div>

                                <div className="flex items-center gap-2">

                                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11.983 1.904a.75.75 0 00-1.217-.866l-7.5 10.5a.75.75 0 00.925 1.217L8 10.463V18a.75.75 0 001.5 0v-7.537l4.017-2.87a.75.75 0 00-.534-1.217L11.983 1.904z" /></svg>

                                    <span>Lightning Fast</span>

                                </div>

                                <div className="flex items-center gap-2">

                                     <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l.645 1.558a.75.75 0 00.729.516h1.634c.82 0 1.123.993.57 1.488l-1.328 1.004a.75.75 0 00-.286.905l.492 1.772c.245.882-.733 1.579-1.482 1.06l-1.423-.982a.75.75 0 00-.894 0l-1.423.982c-.749.52-1.726-.178-1.482-1.06l.492-1.772a.75.75 0 00-.286-.905l-1.328-1.004c-.553-.495-.25-1.488.57-1.488h1.634a.75.75 0 00.73-.516l.645-1.558z" /></svg>

                                    <span>Premium Quality</span>

                                </div>

                            </div>

                            <div className="mt-8 flex flex-col items-center justify-center gap-4">

                               <div className="flex items-center justify-center gap-4">

                                    <button onClick={() => handleScrollTo('pricing')} className="py-3 px-8 rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white shadow-lg shadow-klar flex items-center gap-2">

                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25v-6h9M6.08 5.746l.473 2.365A1.125 1.125 0 015.454 9H2.25M9 11.25v3.375c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V11.25m-3.375 0h3.375M7.5 14.25h3.375z"/></svg>

                                        Purchase Now

                                    </button>

                                    <button onClick={() => setIsVideoModalOpen(true)} className="py-3 px-8 rounded-lg font-semibold text-center transition bg-transparent border border-border-color text-gray-300 flex items-center gap-2">

                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" /></svg>

                                        Watch Demo

                                    </button>

                                </div>

                                <DiscordCounter />

                            </div>

                        </div>

                    </section>



                    <div className="w-full max-w-6xl mx-auto px-4 space-y-24">

                         <section id="stats" className="py-12 fade-in-section">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

                                <div ref={usersRef}>

                                    <p className="text-5xl font-extrabold text-klar">{usersCount.toLocaleString()}+</p>

                                    <p className="text-lg text-gray-400 mt-2">Active Users</p>

                                </div>

                                <div ref={updatesRef}>

                                    <p className="text-5xl font-extrabold text-klar">{updatesCount}+</p>

                                    <p className="text-lg text-gray-400 mt-2">Monthly Updates</p>

                                </div>

                                <div ref={uptimeRef}>

                                    <p className="text-5xl font-extrabold text-klar">{uptimeCount}%</p>

                                    <p className="text-lg text-gray-400 mt-2">Guaranteed Uptime</p>

                                </div>

                            </div>

                        </section>



                        <section id="features" className="py-12 text-center fade-in-section">

                            <h3 className="text-4xl font-bold text-white">Core Features</h3>

                            <div className="mt-12 grid md:grid-cols-3 gap-8">

                                {features.map(f => (

                                     <div key={f.title} className="bg-card-bg p-6 rounded-lg border border-border-color text-left interactive-card">

                                         <svg className="w-8 h-8 text-klar mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>

                                         <h4 className="text-xl font-semibold text-white">{f.title}</h4>

                                         <p className="text-gray-400 mt-2">{f.description}</p>

                                     </div>

                                ))}

                            </div>

                        </section>



                        <section id="games" className="py-12 text-center fade-in-section">

                             <h3 className="text-4xl font-bold text-white">Supported Games</h3>

                             <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

                                  {supportedGames.map(game => (

                                     <div key={game.name} className="bg-card-bg p-8 rounded-lg border border-border-color text-center interactive-card flex flex-col justify-between">

                                         <div>

                                             <h4 className="text-2xl font-bold text-white">{game.name}</h4>

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

                            <h3 className="text-4xl font-bold text-white">Choose Your Access</h3>

                            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                                {pricingTiers.map(tier => (

                                    <div key={tier.name} className={`relative bg-card-bg p-8 rounded-lg border text-center interactive-card transition-[box-shadow,border-color] duration-300 ${tier.isFeatured ? 'border-klar shadow-lg shadow-klar/30 transform md:scale-105' : 'border-border-color'}`}>

                                        {tier.isFeatured && (

                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-klar px-4 py-1 text-sm font-semibold text-white rounded-full shadow-md">

                                                Best Value

                                            </div>

                                        )}

                                        <h4 className="text-xl font-bold text-white mb-2">{tier.name}</h4>

                                        <p className="text-gray-400 text-sm mb-4">Starting at</p>

                                        <p className="text-4xl font-extrabold text-klar mb-6">{tier.price}</p>

                                        <a href={tier.url} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-3 px-6 rounded-lg font-semibold text-center transition bg-klar/20 hover:bg-klar/30 text-klar border border-klar">Purchase</a>

                                    </div>

                                ))}

                            </div>

                        </section>



                        <section id="free" className="py-12 fade-in-section">

                            <div className="text-center">

                                <h3 className="text-4xl font-bold text-white">Get Free Access</h3>

                                <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">Follow these three simple steps to get a free key and start using Klar Hub.</p>

                            </div>

                            <div className="mt-12 max-w-3xl mx-auto">

                                <div className="relative pl-12">

                                    {/* Vertical connector line */}

                                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-border-color"></div>



                                    {/* Step 1 */}

                                    <div className="relative mb-12">

                                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">

                                            <div className="z-10 w-12 h-12 rounded-full bg-klar flex items-center justify-center font-bold text-white text-2xl">1</div>

                                        </div>

                                        <div className="ml-4 p-6 bg-card-bg border border-border-color rounded-lg">

                                            <h4 className="text-2xl font-semibold text-white">Get Your Key</h4>

                                            <p className="text-gray-400 mt-2">Click the button below and complete the required steps on our partner's site to receive your script key.</p>

                                            <a href="https://ads.luarmor.net/get_key?for=Free_Klar_Access-jfTfOGvFxqSh" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 py-2 px-6 rounded-lg font-semibold text-center transition bg-klar hover:bg-klar-light text-white">Get Key</a>

                                        </div>

                                    </div>



                                    {/* Step 2 */}

                                    <div className="relative mb-12">

                                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">

                                            <div className="z-10 w-12 h-12 rounded-full bg-klar flex items-center justify-center font-bold text-white text-2xl">2</div>

                                        </div>

                                        <div className="ml-4 p-6 bg-card-bg border border-border-color rounded-lg">

                                            <h4 className="text-2xl font-semibold text-white">Prepare Your Script</h4>

                                            <p className="text-gray-400 mt-2">Paste the key you received from Step 1 into the box below. Then, click the copy button to get your final script.</p>

                                            <div className="mt-4 bg-background-dark p-4 rounded-lg relative">

                                                <pre className="text-gray-300 overflow-x-auto">

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

                                                        className="w-full bg-button-secondary-bg border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-klar p-2"

                                                    />

                                                    <button onClick={handleCopyScript} className="flex-shrink-0 bg-klar hover:bg-klar-light text-white px-4 py-2 text-sm font-semibold rounded-lg transition">

                                                        {scriptCopied ? 'Copied!' : 'Copy Script'}

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </div>



                                    {/* Step 3 */}

                                    <div className="relative">

                                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">

                                            <div className="z-10 w-12 h-12 rounded-full bg-klar flex items-center justify-center font-bold text-white text-2xl">3</div>

                                        </div>

                                        <div className="ml-4 p-6 bg-card-bg border border-border-color rounded-lg">

                                            <h4 className="text-2xl font-semibold text-white">Execute</h4>

                                            <p className="text-gray-400 mt-2">You're all set! Now just paste the full script you copied into your executor and run it in-game.</p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </section>



                         <section id="reviews" className="py-12 text-center fade-in-section">

                            <h3 className="text-4xl font-bold text-white">Trusted by Players Worldwide</h3>

                            <div className="mt-12 grid md:grid-cols-3 gap-8">

                                 {testimonials.map((t, i) => (

                                    <div key={i} className="bg-card-bg p-6 rounded-lg border border-border-color text-left interactive-card flex flex-col h-full">

                                        <div className="flex-grow"><p className="text-gray-300 italic text-lg">"{t.text}"</p></div>

                                        <div className="mt-4 pt-4 border-t border-border-color">

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

                            <h3 className="text-4xl font-bold text-white text-center">Frequently Asked Questions</h3>

                            <div className="mt-12 space-y-4">

                                {faqs.map((faq, index) => (

                                    <div key={index} className="bg-card-bg border border-border-color rounded-lg faq-item">

                                        <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full flex justify-between items-center p-6 text-left">

                                            <span className="text-lg font-semibold text-white">{faq.q}</span>

                                            <svg className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>

                                        </button>

                                        <div className="grid transition-all duration-500 ease-in-out" style={{gridTemplateRows: activeFaq === index ? '1fr' : '0fr'}}>

                                            <div className="overflow-hidden"><p className="p-6 pt-0 text-gray-400">{faq.a}</p></div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </section>



                        <section id="tos" className="py-12 max-w-4xl mx-auto fade-in-section">

                            <h3 className="text-4xl font-bold text-white text-center">Terms & Conditions</h3>

                            <div className="mt-12 bg-card-bg border border-border-color rounded-lg p-8 space-y-6 text-gray-300">

                                <p><strong className="text-white">Refund Policy:</strong> All sales are final. Due to the digital nature of our products, we do not offer refunds once a purchase is completed. Please review all features and compatibility information before buying.</p>

                                <p><strong className="text-white">License Agreement:</strong> Your license is for personal use only. Account or script sharing is strictly prohibited. Violation of this rule may result in a permanent suspension of your access without a refund.</p>

                                <p><strong className="text-white">Software Use:</strong> Any attempt to reverse-engineer, decompile, or crack our software is a violation of these terms and applicable laws. We reserve the right to pursue appropriate action and terminate access for such activities.</p>

                                <p><strong className="text-white">Disclaimer:</strong> Our software is provided 'as-is'. While we strive for 100% uptime and safety, we are not liable for any account actions or issues that may arise from its use. Use at your own discretion.</p>

                            </div>

                        </section>



                        <section id="community" className="py-12 text-center fade-in-section">

                            <div className="bg-card-bg border border-border-color rounded-2xl p-8">

                                <h3 className="text-4xl font-bold text-white">Still Have Questions?</h3>

                                <p className="text-lg text-gray-400 mt-4">Get support and connect with other users on our Discord server.</p>

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

                {isGameOpen && <KlarClickerGameModal onClose={() => setIsGameOpen(false)} />}

                <BackToTopButton />

            </div>

        </div>

    );

};



const Header = ({ headerRef, onScrollTo, onToggleMobileMenu, activeSection, isMobileMenuOpen, onGameClick, theme, setTheme }) => {

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

         <header ref={headerRef} style={{backgroundColor: 'var(--header-bg)'}} className="sticky top-0 z-40 p-4 flex justify-between items-center backdrop-blur-sm transition-colors duration-300">

            <div className="flex-1 flex justify-start items-center gap-4">

                 <Logo onScrollTo={onScrollTo}/>

                 <button onClick={onGameClick} className="hidden md:block text-sm font-semibold text-gray-300 hover:text-white transition border border-border-color hover:border-klar px-4 py-2 rounded-lg">Play a Game</button>

            </div>

            <nav className="hidden md:flex flex-shrink-0 justify-center items-center gap-6 text-sm font-semibold">

                {navItems.map(item => (

                    <button key={item.id} onClick={() => onScrollTo(item.id)} className={`text-gray-300 hover:text-klar transition ${activeSection === item.id ? 'nav-active' : ''}`}>

                        {item.label}

                    </button>

                ))}

            </nav>

            <div className="flex-1 hidden md:flex justify-end items-center gap-4">

                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-button-secondary-hover-bg transition" aria-label="Toggle theme">

                    {theme === 'dark' ? (

                        <svg className="w-6 h-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>

                    ) : (

                        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>

                    )}

                </button>

                <a href={discordLink} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-6 rounded-lg font-semibold text-center transition bg-klar/20 hover:bg-klar/30 text-klar border border-klar">Join Discord</a>

            </div>

            <div className="md:hidden flex-1 flex justify-end">

                <button onClick={onToggleMobileMenu} className="text-white z-50">

                    {isMobileMenuOpen ?

                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> :

                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>

                    }

                </button>

            </div>

        </header>

    );

};



const MobileMenu = ({ isOpen, onScrollTo, onClose }) => {

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

        <div className="fixed top-0 left-0 w-full h-full z-30 bg-background-dark/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 text-2xl font-bold md:hidden">

            {navItems.map(item => (

                <button key={item.id} onClick={() => onScrollTo(item.id)} className="text-gray-300 hover:text-klar transition">{item.label}</button>

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

        <button id="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`fixed bottom-8 left-8 bg-klar/80 hover:bg-klar text-white w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>

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

            <button id="ai-helper-button" onClick={onClick} className="bg-klar/80 hover:bg-klar text-white w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto shadow-lg shadow-klar">

                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5m0 16.5v-1.5m3.75-12H21M12 21v-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v16.5M16.5 4.5l-9 15M16.5 19.5l-9-15" /></svg>

            </button>

        </div>

    );

};



const Footer = () => (

     <footer className="w-full p-8 text-center text-gray-500">

        <p>© 2025 Klar Hub. All rights reserved.</p>

    </footer>

);



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<App />);

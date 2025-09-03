// data.js
// This file centralizes all the text and configuration data for the website.
// By keeping it here, you can easily update content without touching the main application logic.

export const navItems = [
    { id: 'features', label: 'Features' },
    { id: 'games', label: 'Supported Games' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'free', label: 'Free Access' },
    { id: 'reviews',label: 'Reviews' },
    { id: 'faq', label: 'FAQ' },
    { id: 'tos', label: 'Terms' }
];

export const demoVideos = [
    "https://www.youtube.com/embed/d2hR2gRhME0?autoplay=1",
    "https://www.youtube.com/embed/97osD4zLYpA?autoplay=1",
    "https://www.youtube.com/embed/03Y0NuUEOV8?autoplay=1"
];

export const pricingTiers = [
    { name: '1 Week Klar Access', price: '$1.50', url: 'https://klarhub.sellhub.cx/product/1-Week/', specialTag: 'Most Popular'},
    { name: 'Lifetime Klar', price: '$15.00', url: 'https://klarhub.sellhub.cx/product/New-product/', isFeatured: true },
    { name: 'Extreme Alt Gen', price: '$1.00', url: 'https://klarhub.sellhub.cx/product/Extreme-Alt-Gen/', specialTag: 'On Sale' },
    { name: '1 Month Klar Access', price: '$2.50', url: 'https://klarhub.sellhub.cx/product/1-Month-Klar-Access/', robuxPrice: '450', robuxUrl: 'https://www.roblox.com/catalog/116340932269907/KLAR-1-month' },
    { name: '3 Month Klar Access', price: '$3.75', url: 'https://klarhub.sellhub.cx/product/3-Month-Access/', robuxPrice: '800', robuxUrl: 'https://www.roblox.com/catalog/71184399134072/KLAR-3-Month' },
    { name: '6 Month Klar Access', price: '$5.50', url: 'https://klarhub.sellhub.cx/product/6-Month-Klar-Access/', robuxPrice: '1225', robuxUrl: 'https://www.roblox.com/catalog/134764715699815/KLAR-6-Month' },
];

export const testimonials = [
    { name: 'Customer', stars: 5, text: "easiest checkout", date: "Wed Jul 23 2025" },
    { name: 'Customer', stars: 5, text: "Amazing and easy", date: "Wed Jul 16 2025" },
    { name: 'Customer', stars: 5, text: "best script out there cop now", date: "Fri Jun 06 2025" }
];

export const faqs = [
    { q: "Is Klar Hub a one-time purchase?", a: "We offer both subscription and lifetime access plans. You can choose the one that best suits your needs." },
    { q: "What payment methods are accepted?", a: "We accept all major payment methods through our secure online storefront, including credit cards, PayPal, and more." },
    { q: "What executors are compatible?", a: "Our scripts are designed to be compatible with all major, high-quality executors on the market." },
    { q: "How often are the scripts updated?", a: "We update our scripts regularly to ensure compatibility with the latest Roblox updates and to add new features. Updates are always free for active subscribers or lifetime members." }
];

export const features = [
    { title: "Perfect Kicking & Throwing", description: "Achieve perfect accuracy and power on every kick and throw with our advanced precision assistance.", icon: "M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56v4.82a6 6 0 01-1.292 3.536l-1.992-1.992a4.5 4.5 0 00-6.364-6.364l-1.992-1.992A6 6 0 0115.59 14.37z" },
    { title: "QB Aimbot", description: "Never miss a throw with our precise quarterback aimbot, featuring prediction and sensitivity controls.", icon: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" },
    { title: "Ball Magnets", description: "Automatically catch passes with our intelligent ball magnet, ensuring you never drop the ball.", icon: "M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" }
];

export const supportedGames = [
    { name: "Football Fusion 2", abbr: "FF2", features: ["Ball Magnets", "Pull Vector", "Enhanced Movement (Jump & Speed)", "No Jump Cooldown", "Custom Catch Effects"] },
    { name: "Ultimate Football", abbr: "UF", features: ["Football Size Manipulation", "Arm Resize", "Enhanced Movement (Jump & Speed)", "No-Clip (Utility)"] },
    { name: "Murders VS Sheriffs Duels", abbr: "MVSD", features: ["Advanced Triggerbot", "Hitbox Extender", "Enhanced Movement (Jump & Speed)", "Player ESP"] },
    { name: "Arsenal", abbr: "Arsenal", features: ["Silent Aim", "Advanced Hitbox Manipulation", "Triggerbot", "Visual Tags (Admin, etc.)"] }
];

export const discordLink = "https://discord.gg/bGmGSnW3gQ";

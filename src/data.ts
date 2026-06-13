import { PresetBrief } from "./types";

export const PRESET_BRIEFS: PresetBrief[] = [
  {
    id: "mbceats",
    label: "MBCeats (Canteen Ordering)",
    appName: "MBCeats",
    appCategory: "Canteen ordering system",
    targetAudience: "Stressed college students",
    corePainPoint: "Standing in long lines for lunch and wasting half of a short break",
    killerFeature: "Pre-ordering meals from the classroom with live pickup timers",
    creatorTone: "Sarcastic & Honest",
    creatorPacing: "rapid-fast",
    defaultProject: {
      hooks: [
        {
          type: "Unpopular Opinion",
          concept: "Challenging the conventional acceptance of waiting in long lines",
          textOverlay: "STOP WAITING IN LUNCH LINES 🛑",
          audioLine: "Okay, can we honestly stop pretending that waiting forty minutes in the canteen line for a cold wrap is a normal way to spend a college break?",
          visualCue: "Creator with a slight grimace, doing a talking head casual zoom-in. Split screen with a blurry video of a crowded school lunchroom."
        },
        {
          type: "POV Relatability",
          concept: "Reliving the frustration of wasting a break in a line",
          textOverlay: "POV: You got a 30-min break... and wasted 28 of it in line",
          audioLine: "POV: You literally only have thirty minutes to eat, but you spend twenty-eight of them staring at the back of some dude's neck in the food line.",
          visualCue: "Selfie video recorded in a crowded hallway. Creator holds up empty plastic fork with a disappointed face."
        },
        {
          type: "Secret Weapon",
          concept: "Leveraging a secret shortcut to bypass everyone else",
          textOverlay: "My literal lunch shortcut 🤫📱",
          audioLine: "So yeah, I found this sneaky cheat code to bypass the entire canteen crowd and grab hot fries without waiting even one second.",
          visualCue: "Talking head holding the phone up with a playful smirk, pointing to the screen showing MBCeats checkout interface."
        }
      ],
      masterScript: [
        {
          segmentId: 1,
          segmentName: "Hook Segment",
          duration: 7,
          visualCue: "Creator in classroom, whispering to front-camera, looking casual and conspiratorial",
          textOverlay: "THE LUNCH cheat code 🤫📱",
          audioLine: "Okay, can we honestly stop pretending that waiting forty minutes in the canteen line for a cold wrap is a normal way to spend a college break?"
        },
        {
          segmentId: 2,
          segmentName: "Core Problem",
          duration: 8,
          visualCue: "Zoom cut; creator roll-eyes, expressing frustration of a wasted college lunch break",
          textOverlay: "Half my break is GONE 😭",
          audioLine: "Like, you literally have a short window between lectures and instead of relaxing, you're standing in a massive herd just wishing you'd packed a lunch."
        },
        {
          segmentId: 3,
          segmentName: "Discovery (Aha!)",
          duration: 8,
          visualCue: "Creator smiles, tapping their phone screen showing a live, countdown pick-up UI on the screen",
          textOverlay: "Enter MBCeats app 🚀",
          audioLine: "But then some genius told me about MBCeats. And honestly, my life has been completely different since I installed it. Look at this."
        },
        {
          segmentId: 4,
          segmentName: "Killer Feature Demo",
          duration: 8,
          visualCue: "Green screen background: creator points to live pickup timer displaying 'Ready in 3 mins'",
          textOverlay: "ORDER FROM CLASS 🤩⏰",
          audioLine: "I literally pre-order my burger directly from my desk during the last five minutes of biochemistry, and the live pickup timer tells me exactly when it's hot."
        },
        {
          segmentId: 5,
          segmentName: "Immediate Benefit",
          duration: 7,
          visualCue: "Creator walks up, grabs a warm paper food bag from a clean checkout station, grinning",
          textOverlay: "NO LINES, JUST VIBES ✨🥗",
          audioLine: "So I just walk down, grab my lunch from the designated MBCeats counter, bypass eighty people, and eat with actual time to spare. It's unreal."
        },
        {
          segmentId: 6,
          segmentName: "Call To Action",
          duration: 7,
          visualCue: "Close-up of creator pointing downwards with visual text link popping up on screen",
          textOverlay: "GET MBCEATS NOW Link Below! 👇",
          audioLine: "If you're tired of eating your food in a panic on the walk back to class, register on MBCeats today. Your breaks will literally never be the same."
        }
      ],
      ctas: [
        {
          style: "Immediate Benefit",
          phrase: "Skip the Line Today",
          spokenCta: "Go register on MBCeats right now and literally never wait in line again.",
          textOverlay: "SKIP EVERY SINGLE LINE 🚀🍔"
        },
        {
          style: "FOMO Scarcity",
          phrase: "Unlock Fast-Pass Order",
          spokenCta: "Grab your free MBCeats pass. There's only a few fast-track pre-ordering slots left for this term.",
          textOverlay: "GET LUNCH FAST-PASS 🎟️💨"
        },
        {
          style: "Risk-Reversal / Trial",
          phrase: "Try MBCeats Free",
          spokenCta: "Download MBCeats right now. It takes ten seconds and your next lunch is entirely skipped off the queue. Try it out.",
          textOverlay: "DOWNLOAD FREE & SKIP LINES 👇"
        }
      ],
      creatorDirectives: {
        vibeDescription: "Deadpan, relatable college student who is genuinely passionate about small hacks that protect their free time. Pacing is fast and effortless.",
        clothingSuggestions: "Comfy oversized hoodie, casual collegiate wear, backwards cap, messy bun.",
        cameraSetup: "Starts in the back row of a lecture theater (whispering), then transitions to walking and talking towards the canteen."
      }
    }
  },
  {
    id: "habit-tracker",
    label: "HabitTracker (Productivity)",
    appName: "HabitTracker",
    appCategory: "Productivity application",
    targetAudience: "Busy remote workers",
    corePainPoint: "Struggling to build habits or routines without quitting after 3 days",
    killerFeature: "10-second micro-challenges with group accountability to never break streaks",
    creatorTone: "Empathetic Friend",
    creatorPacing: "natural",
    defaultProject: {
      hooks: [
        {
          type: "Unpopular Opinion",
          concept: "Habit systems fail because they are designed for robots, not tired humans",
          textOverlay: "Most productivity tips are garbage 🗑️",
          audioLine: "Okay, unpopular opinion, but ninety percent of habit systems fail because they expect you to magically become a robot overnight.",
          visualCue: "Creator sitting cross-legged on a rug, holding a coffee mug, talking directly to the camera with soft overhead lighting."
        },
        {
          type: "POV Relatability",
          concept: "The typical cycle of setting a goal and giving up on Wednesday",
          textOverlay: "POV: It's day 3 of your new routine",
          audioLine: "POV: You're staring at your five-year journal on a Wednesday evening wondering why you literally have zero motivation to fill it out.",
          visualCue: "Camera looking slightly down at the actor sitting on an office chair, rubbing their face in exhaustion."
        },
        {
          type: "Secret Weapon",
          concept: "An easy 10-second trick that takes no energy",
          textOverlay: "How to stay consistent on low-energy days 🤫",
          audioLine: "I finally found an actual hack to stick with solid habits even on days when my brain feels entirely cooked.",
          visualCue: "Creator sits Up, showing a smartphone screens with bright, colorful streak bubbles and micro-rewards."
        }
      ],
      masterScript: [
        {
          segmentId: 1,
          segmentName: "Hook Segment",
          duration: 7,
          visualCue: "Creator holding a coffee, looking relatable, talking directly and closely to the lens",
          textOverlay: "Why routines fail you 🚨",
          audioLine: "Okay, unpopular opinion, but ninety percent of habit systems fail because they expect you to magically become a robot overnight."
        },
        {
          segmentId: 2,
          segmentName: "Core Problem",
          duration: 8,
          visualCue: "Cut to a desk setup, showing a notebook of crossed-out habits and unfinished tasks",
          textOverlay: "The 3-day quitting loop 🔄",
          audioLine: "Like, we've all been there. You swear this week is different, but by Wednesday, you are tired, you miss a day, and then the entire habit is literally gone."
        },
        {
          segmentId: 3,
          segmentName: "Discovery (Aha!)",
          duration: 8,
          visualCue: "Creator smiles warmly, bringing the phone up close to show a vibrant app interface",
          textOverlay: "Then I found HabitTracker... ✨",
          audioLine: "I was so close to giving up on routines entirely, until I tried this app. It approaches habits like human beings actually work."
        },
        {
          segmentId: 4,
          segmentName: "Killer Feature Demo",
          duration: 8,
          visualCue: "Green-screen demo of group micro-challenges popping up with a 10s countdown",
          textOverlay: "10-SEC MICRO-STEPS ⏳🤝",
          audioLine: "Instead of hour-long tasks, it splits things into 10-second micro-challenges, and you do them with a small online buddy group. Honestly? The momentum is insane."
        },
        {
          segmentId: 5,
          segmentName: "Immediate Benefit",
          duration: 7,
          visualCue: "Creator punches air lightly or takes a proud sip of coffee, pointing to a 45-day streak",
          textOverlay: "45-DAY STREAK (My record!) 🔥",
          audioLine: "Our team accountability means you never want to let the circle down. I’ve literally read, meditated, and drank water for forty-five days straight."
        },
        {
          segmentId: 6,
          segmentName: "Call To Action",
          duration: 7,
          visualCue: "Creator smiles, double tapping the screen to bring up a prompt",
          textOverlay: "FREE 10-SEC HABITS👇",
          audioLine: "Stop setting rigid routines that burn you out. Download HabitTracker, join a micro-challenge, and see how easy consistency actually is."
        }
      ],
      ctas: [
        {
          style: "Immediate Benefit",
          phrase: "Start Your First Streak",
          spokenCta: "Tap below to join our next ten-second micro-challenge starting this Monday.",
          textOverlay: "JOIN THE MICRO-CHALLENGE 📈"
        },
        {
          style: "Social Proof Accountability",
          phrase: "Join 10k Active Members",
          spokenCta: "Claim a spot in a habit accountability circle for free today and literally double your consistency rate.",
          textOverlay: "FIND YOUR HABIT CIRCLE 🤝✨"
        },
        {
          style: "Risk-Reversal / Trial",
          phrase: "Try HabitTracker Today",
          spokenCta: "Download HabitTracker now. It requires zero credit cards and less than two minutes a day to start seeing real results.",
          textOverlay: "FREE DOWLOAD - NO CREDIT CARD 👇"
        }
      ],
      creatorDirectives: {
        vibeDescription: "Warm, empathetic remote freelancer or office worker. They speak in a cozy, supportive voice, like a supportive friend who wants you to win.",
        clothingSuggestions: "Comfy knit sweater, relaxed-fit pants, natural makeup, blue-light glasses.",
        cameraSetup: "A cozy remote home office or living room background with warm lamps, plants, and natural wood furniture. Shot at eye level."
      }
    }
  },
  {
    id: "fintech-savings",
    label: "SaveAI (Smart FinTech)",
    appName: "SaveAI",
    appCategory: "FinTech saving helper",
    targetAudience: "Impulsive online shoppers",
    corePainPoint: "Accidentally spending entire paychecks on flash sales and having zero savings",
    killerFeature: "AI ghost-shuttle checkout that intercepts checkout clicks and auto-reroutes them to a high-yield savings envelope",
    creatorTone: "Excited Lifehacker",
    creatorPacing: "rapid-fast",
    defaultProject: {
      hooks: [
        {
          type: "Unpopular Opinion",
          concept: "Budget guides fail because self-control is a myth on the modern internet",
          textOverlay: "Budgeting tips are actually gaslighting you 🤫",
          audioLine: "Okay, unpopular opinion but... traditional saving advice that tells you of 'just buy fewer lattes' is literally psychological gaslighting.",
          visualCue: "Creator rubbing forehead, holding an empty wallet or staring in disgust at a pile of Amazon shipping boxes."
        },
        {
          type: "POV Relatability",
          concept: "POV of impulse spending at 2 AM",
          textOverlay: "POV: It's 2 AM and TikTok made you buy it",
          audioLine: "POV: It's two AM, life is stressful, and you just spent eighty dollars on a mechanical keyboard you will literally never use.",
          visualCue: "Smartphone glow is cast on the creator's face in the dark, highlighting wide eyes and an active finger tapping-to-buy."
        },
        {
          type: "Secret Weapon",
          concept: "An app that tricks you into saving money automatically",
          textOverlay: "My shopping checkout hack 🤫💳",
          audioLine: "So yeah, I installed this app that literally tricks my brain into saving money instead of wasting it on overnight deliveries.",
          visualCue: "Creator displays their savings balance on phone, pointing with excitement."
        }
      ],
      masterScript: [
        {
          segmentId: 1,
          segmentName: "Hook Segment",
          duration: 7,
          visualCue: "Creator standing in kitchen, eating cereal directly from box, looking energetic and ready to share",
          textOverlay: "Self-control is a scam 🚨💳",
          audioLine: "Okay, unpopular opinion but... traditional saving advice that tells you of 'just buy fewer lattes' is literally psychological gaslighting."
        },
        {
          segmentId: 2,
          segmentName: "Core Problem",
          duration: 8,
          visualCue: "Creator taps phone frantically like scrolling through Amazon/Instagram ads, sighing",
          textOverlay: "$0 in savings again? 😭🛒",
          audioLine: "Like, the internet is built to steal your paycheck. One-click shopping literally makes it too easy to spend before your brain can even process it."
        },
        {
          segmentId: 3,
          segmentName: "Discovery (Aha!)",
          duration: 8,
          visualCue: "Creator holds up phone showing a cool, neon-colored checkout confirmation screens",
          textOverlay: "Meet SaveAI App 🤖✨",
          audioLine: "But check this out. I installed SaveAI last month, and honestly, it's like a security guard for my checking account that actually works."
        },
        {
          segmentId: 4,
          segmentName: "Killer Feature Demo",
          duration: 8,
          visualCue: "Green screen: creator shows how clicking 'Buy Now' triggers a dynamic AI blocker that sends the $50 to high-yield savings",
          textOverlay: "THE GHOST CHECKOUT 📲👻",
          audioLine: "There's this crazy feature called Ghost Checkout. When I'm on a shopping site and click buy, SaveAI intercepts it, blocks the purchase, and instantly transfers that money into high-yield savings instead!"
        },
        {
          segmentId: 5,
          segmentName: "Immediate Benefit",
          duration: 7,
          visualCue: "Creator gestures with a huge smile, displaying a chart with a fast-growing green line",
          textOverlay: "$1,200 saved in 30 days! ⭐📈",
          audioLine: "I literally saved twelve hundred dollars in thirty days because my brain thought it was shopping, but it was actually building a massive savings cushion. It feels like cheating."
        },
        {
          segmentId: 6,
          segmentName: "Call To Action",
          duration: 7,
          visualCue: "Creator winks, points enthusiastically downwards at a glowing animated button overlay",
          textOverlay: "TRICK YOUR SAVINGS 👇🏦",
          audioLine: "If you have negative self-control but want actual savings, you need this app. Download SaveAI today and watch your savings skyrocket."
        }
      ],
      ctas: [
        {
          style: "Immediate Benefit",
          phrase: "Activate SaveAI Shield",
          spokenCta: "Tap down below to download SaveAI and easily intercept your next impulse checkout.",
          textOverlay: "SHIELD YOUR WALLET NOW 🛡️💸"
        },
        {
          style: "Urgency scarcity",
          phrase: "Get 5.2% APY savings Boost",
          spokenCta: "First thousand signups get a direct savings rate boost. Download it right now and secure it.",
          textOverlay: "LOCK IN High Yield Savings APY 💼⏰"
        },
        {
          style: "Risk-Reversal / Trial",
          phrase: "Try SaveAI Free",
          spokenCta: "Take the 30-day save challenge completely free. If you don't save at least three hundred dollars, cancel in one tap.",
          textOverlay: "SAVE $300 IN 30 DAYS FREE 👇"
        }
      ],
      creatorDirectives: {
        vibeDescription: "High-energy, fast-talking, slightly chaotic but hyper-intelligent Gen Z lifehacker. They move their hands, zoom the shot manually, and talk with fun expressions.",
        clothingSuggestions: "Cool graphic tee, thrifted bomber jacket, chunky silver rings.",
        cameraSetup: "A casual kitchen or bedroom with natural morning light. Frequent jump cuts and close-up dynamic adjustments during spoken lines."
      }
    }
  }
];

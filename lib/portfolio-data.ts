import type { Language } from '../components/language-context'

export type PortfolioWork = {
  id: string
  title: string
  type: string
  category: string
  year: string
  period: string
  status: string
  role: string
  methods: string
  next: string
  description: string
  question: string
  process: [string, string][]
  processIcons?: string[]
  outcomes: string[]
  research?: {
    sample: string
    metrics: [string, string, string][]
    charts?: { title: string; unit: string; total: number; bars: [string, number, boolean?][]; note?: string }[]
    decisions: [string, string][]
    limitation: string
  }
  delivery?: [string, string][]
  image?: string
  detailImage?: string
  gallery?: { image: string; alt: string; caption: string; wide?: boolean }[]
  videos?: { src: string; poster?: string; caption: string }[]
  modules?: { kicker?: string; title: string; text: string; stacked?: boolean; points?: string[]; images: { src: string; alt: string; caption?: string; wide?: boolean }[]; video?: { src: string; poster?: string } }[]
  comparison?: { title: string; intro: string; columns: [string, string]; rows: [string, string, string][]; sources: [string, string][] }
  href: string
}

export const portfolioWorks: Record<Language, PortfolioWork[]> = {
  en: [
    {
      id: 'co-creative-ai-training',
      title: 'AI Co-Creation Interface That Draws Out Personal Judgment',
      type: 'AI interaction / Master’s research',
      category: 'AI interaction / Master’s research',
      year: '2025-2026',
      period: 'Graduate study · HCI and AI experience',
      status: 'Master’s research in progress',
      role: 'Solo: interaction concept, interface design, confirm-and-add mechanism, evaluation plan',
      methods: 'AI conversation text analysis, subjective evaluation, comparative interfaces and eye tracking (planned)',
      next: 'Master’s research in progress · preparing the interface comparison and eye-tracking study.',
      description: 'People understand a word like “premium” differently, but AI generates from the common reading, leaving a gap between the person and the AI. The interface first shows how the AI reads the word, then prompts the user to enter their own judgment; the AI adjusts to it, and the co-created result gets closer to what they meant.',
      question: 'Users type kansei words like “premium” or “cozy”, and AI tends to generate the average reading, so results become ordinary. Users also cannot see how the AI understood them, so they cannot correct it.',
      process: [
        [
          'Show the AI’s reading',
          'List the AI’s usual interpretation of the kansei word beside its answer, so differences become visible.',
        ],
        [
          'Confirm or add',
          'Offer “That’s what I mean / No, I want…” entries that prompt users to add their own criteria.',
        ],
        [
          'Adjust the response',
          'The AI changes its proposal, explanation, and follow-up questions based on what was added.',
        ],
      ],
      processIcons: ['eye', 'message', 'refresh', 'check'],
      outcomes: [
        'Users add their own reading, narrowing the gap between their understanding and the AI’s common one.',
        'The AI’s usual reading and the user’s own criteria are visible together, so misunderstandings can be corrected early.',
        'A comparative-interface and eye-tracking test is planned to check whether the prompts are actually noticed.',
      ],
      image: '/works/portfolio/ai-understanding-confirmation-en.svg',
      gallery: [
        { image: '/works/portfolio/generated/ai-cocreation-chat-v2.png', alt: 'Chat interface concept', caption: 'Earlier version: users chose between “AI decides / discuss together / I decide”. The current version first shows the AI’s reading, then asks the user to confirm or add to it.', wide: true },
        { image: '/works/portfolio/generated/ai-story-triptych.png', alt: 'Usage scene triptych', caption: 'Usage scenes of the earlier version (AI-generated illustration): from sketching, to choosing who judges, to adjusting the proposal.', wide: true },
        { image: '/works/portfolio/generated/ai-cocreation-overlay.png', alt: 'Co-creation flow concept', caption: 'The three judgment roles of the earlier version (AI-generated illustration).' },
      ],
      href: '/works/ai-judgement',
    },
    {
      id: 'transparent-driving-hud',
      title: 'Driving HMI That Keeps Eyes on the Road',
      type: 'Intelligent driving / Attention-value HMI',
      category: 'Intelligent driving / Attention-value HMI',
      year: '2025-2026',
      period: 'Graduate study · Driving HMI',
      status: 'Research concept',
      role: 'HMI research, driving-attention design, safety boundaries, and subjective-experience test plan',
      methods: 'Driving-scenario analysis, cue-intensity comparison, review of Chinese regulations and standards, subjective evaluation (planned)',
      next: 'HMI concept · Chinese regulations and resulting trade-offs reviewed (from published notices and commentary); subjective-evaluation survey in preparation.',
      description: 'During assisted driving, only the one road user the AI is worried about is marked, with one line on why. Drivers don’t have to read a pile of data, and they keep watching the road.',
      question: 'How can intelligent driving retain human attention and the desire to drive, rather than quietly turning the driver into a passenger?',
      process: [
        ['Desire to drive', 'If people only sit while automation drives, high-value driving can collapse into basic transport utility.'],
        ['Show AI attention', 'Trust is only the baseline; the AI should clearly show which possible problem it is watching.'],
        ['Emotional warning', 'A child may run out or a nearby car may move over; short emotional language makes the risk immediately legible.'],
        ['Regulatory trade-offs', 'Review China’s current regulations and standards for driver assistance, then decide which cues are allowed and where standardized warnings must take over.'],
      ],
      processIcons: ['target', 'message', 'alert', 'check'],
      outcomes: [
        'Drivers see which object the AI is worried about and why, not just distance and speed.',
        'Cues follow a specific object and scale with risk, staying out of the way; the legally required monitoring and warnings stay in place, and these cues only add to them.',
      ],
      image: '/works/portfolio/generated/hmi-risk-overlay.png',
      gallery: [
        { image: '/works/portfolio/generated/hmi-story-triptych.png', alt: 'Cue intensity triptych', caption: 'Three intensities (AI-generated illustration): a light cue for low risk, a marked object for medium risk, a clear warning for high risk.', wide: true },
        { image: '/works/portfolio/generated/hmi-attention-hero.png', alt: 'Driver view concept', caption: 'Driver view (AI-generated illustration): only the object the AI cares about most is marked, keeping the windshield clear.' },
      ],
      comparison: { title: 'Chinese regulations and trade-offs', intro: 'For these cues to reach a car they must fit Chinese regulations. Three are relevant: they govern that the driver must keep watching the road, that the system must warn, and what may appear on the windshield. This concept only adds within those limits. Based on official announcements and published commentary; the full standard texts were not checked clause by clause.', columns: ['Requirement (summary)', 'Trade-off in this concept'], rows: [
          [
            'GB 47955—2026 Safety requirements for combined driver assistance (mandatory, from 1 Jan 2027)',
            'The driver must keep observing traffic and control the vehicle; the system must detect hands-off and eyes-off states, respond in steps from monitoring to warning to restriction, and inform users of its limits.',
            'Cues only help maintain attention and never replace the required hands-off or eyes-off warnings; at high risk they give way to standardized warnings with no emotional wording.',
          ],
          [
            'MIIT and SAMR notice on market access, recalls and OTA for intelligent connected vehicles (Apr 2025)',
            'Define functional limits and safety responses, fully inform users, and avoid exaggerated or false promotion.',
            'Wording says what the AI is worried about, never “handled” or “relax”, and never implies the system can take over; the term “autonomous driving” is avoided.',
          ],
          [
            'GB/T 46926—2025 Technical requirements and test methods for field-of-vision assistance systems of light vehicles',
            'Displays in the forward transparent area are zoned: the upper zone allows only non-static information with at most 50% opaque pixels, and AR overlays must align with the real scene.',
            'Mark one object with an outline rather than a solid block; place short explanations in the lower zone briefly; hide the box if it cannot track the real target.',
          ],
        ], sources: [
          [
            'MIIT · GB 47955—2026 release',
            'https://www.miit.gov.cn/jgsj/zbys/qcgy/art/2026/art_7bcb480b0db5432f8542157a9fc12841.html',
          ],
          [
            'Sohu Auto · GB 47955 commentary',
            'https://www.sohu.com/a/1090745157_120325502',
          ],
          ['Yicai 2025-04-17', 'https://www.yicai.com/news/102575851.html'],
          [
            'Tencent News · GB/T 46926—2025 commentary',
            'https://news.qq.com/rain/a/20260130A01RUQ00',
          ],
        ] },
      href: '/works/driving-attention',
    },
    {
      id: 'frametrace',
      title: 'FrameTrace',
      type: 'MR glasses / Photography across time',
      category: 'MR glasses / Photography across time',
      year: '2025-2026',
      period: 'Graduate study · Spatial HCI / MR',
      status: 'Quest 3 prototype in progress',
      role: 'Independent research, spatial UX, MR interaction, and Quest 3 prototyping',
      methods: '106-response survey, sensitivity analysis, scenario design, and spatial prototyping',
      next: 'Collected 106 survey responses using concept illustrations; the primary analysis retained N=82 after excluding high-risk responses. Next, use Quest 3 to observe viewpoint finding, gesture framing, and focal-length guidance.',
      description: 'FrameTrace has two directions: experiencing other photographers’ positions and viewpoints, placed back into the scene through MR; and a viewfinder-like tool driven by two-hand gestures that frames a view and suggests a focal length.',
      question: 'How can people understand where a photograph was taken, how it was framed, and which focal length was used?',
      process: [
        ['Discover a shot', 'See other photographers’ positions, lens directions, and pose traces in the scene.'],
        ['Follow the sequence', 'Connect several photo spots into a continuous experience that encourages further exploration of angles and composition.'],
        ['Gesture viewfinder', 'Like a handheld viewfinder, but with both hands: frame a view to preview the composition and get a focal-length recommendation.'],
        ['Take the photograph', 'Align the composition at the real location and leave a new photographic trace for others across time.'],
      ],
      processIcons: ['eye', 'route', 'frame', 'camera'],
      outcomes: [
        'See a good photo, walk to where it was taken, line up, and take your own.',
        'The overall concept’s first-impression score was 5.65/7 in the primary analysis (N=82).',
        'Privacy, explainable recommendations, and walking safety are priorities for the next prototype.',
      ],
      image: '/works/portfolio/frametrace-grid-4.jpg',
      href: '/works/frametrace',
    },
    {
      id: 'taste-again',
      title: 'Long Time No Taste',
      type: 'WeChat mini program / Personal food cycles',
      category: 'WeChat mini program / Personal food cycles',
      year: '2025-2026',
      period: 'Graduate study · Product experience and mini-program development',
      status: 'Released WeChat MVP',
      role: 'Independent product definition, research, UX/UI, and mini-program implementation',
      methods: 'Formative survey, behavior-loop design, information architecture, and mobile prototyping',
      next: 'A formative concept survey involved 57 people. The working WeChat mini program was then built with AI development tools and released.',
      description: 'Records when each food was last eaten and lets you set your own interval for it. The log builds up and can be searched any time, so when you can’t decide what to eat, the flavors you haven’t had in a while come back.',
      question: 'What have I not eaten in a while, how long has it been, and is it worth choosing again today?',
      process: [
        ['Record a meal', 'Record a food and its date to establish how many days have passed since it was last eaten.'],
        ['Set a personal interval', 'Choose a reference interval for each flavor: some once a week, others every day.'],
        ['Review the cycle', 'The cycle table shows which flavors have reached their reference interval and leaves the final choice to the user.'],
        ['Record it again', 'Update the date after eating so the reference cycle stays connected to personal behavior.'],
      ],
      processIcons: ['edit', 'calendar', 'list', 'check'],
      outcomes: [
        '“Haven’t had it in a while” becomes a number of days you can compare with your own interval, and the growing log is always searchable.',
        'Coffee can be daily and a favorite restaurant weekly; each interval is set by the user, with no one-size reminder.',
        'After a 57-person concept survey, built and released the WeChat mini program with AI development tools.',
      ],
      image: '/works/portfolio/haojiu-meichi-cover-upscaled.png',
      href: '/works/taste-again',
    },
    {
      id: 'smart-oven-timing',
      title: 'AI Prediction Oven: Set Time and Heat by Watching the Result',
      type: 'Smart appliance interaction / Photoshop concept',
      category: 'Oven interaction / State preview and time selection',
      year: '2024-2025',
      period: 'Interaction design exploration · Oven-state previews',
      status: 'Concept + 66-person survey · presented at JSKE',
      role: 'Solo: concept, interface design, AI image generation, survey design and analysis',
      methods: 'Visualizing sensations (color / shape / firmness), AI image generation, Photoshop interface prototype, three survey revisions, 66-person concept survey',
      next: 'Concept and survey stage · prediction accuracy, in-oven camera at high heat and real baking results not yet tested on a device.',
      description: 'A screen beside the oven shows, in real time, how the food will look at the current time, temperature and dryness. People adjust while watching, judge by eye when it looks right, and the oven gets the settings it needs.',
      question: 'Ovens are set by time and temperature, but people think in results such as “golden outside, soft inside”. Beginners struggle to turn the texture they want into numbers and end up guessing.',
      process: [
        [
          'Adjust while watching',
          'Change time, heat or dryness and the predicted image updates live.',
        ],
        [
          'Confirm by eye',
          'Start when it looks right; the oven records the settings.',
        ],
        [
          'In-oven monitoring',
          'A camera compares baking with the prediction and adjusts or stops near the target.',
        ],
        [
          'Lab data',
          'Predictions come from a timeline learned from large-scale baking data.',
        ],
      ],
      processIcons: ['sliders', 'eye', 'camera', 'layers'],
      outcomes: [
        'Users just pick the look they want; the machine works out the time and temperature.',
        'After a year of changing direction, it settled on a plan a company could build for one product, with its risks stated.',
      ],
      research: { sample: 'Online survey of 66 people (23 men, 43 women; about half aged 26–35). After an explanatory diagram, they rated the new method and compared it with dials and buttons. About 70% said they mostly understood how it works.', metrics: [], charts: [
          { title: 'Perceived benefits (multiple choice)', unit: 'people', total: 66, bars: [
              [
                'Less trial and error',
                43,
                true,
              ],
              [
                'Fewer beginner failures',
                32,
              ],
            ], note: 'The benefit is fewer wrong turns.' },
          { title: 'Main drawbacks (multiple choice)', unit: 'people', total: 66, bars: [
              [
                'Need to get used to it',
                37,
                true,
              ],
              [
                'May be more complex',
                32,
              ],
              [
                'Want the reason explained',
                25,
              ],
            ], note: 'Next: lower the learning cost and explain recommendations.' },
          { title: 'Preferred direction', unit: 'people', total: 66, bars: [
              [
                'Pick image, then settings',
                38,
                true,
              ],
              [
                'Set values, then see image',
                28,
              ],
            ], note: 'Most prefer to start from the result they want.' },
          { title: 'Method they would finally choose', unit: 'people', total: 66, bars: [
              [
                'Dial',
                25,
              ],
              [
                'Icons',
                19,
              ],
              [
                'AI prediction image',
                18,
                true,
              ],
              [
                'Depends',
                4,
              ],
            ], note: 'The prediction image is not yet the first choice.' },
        ], decisions: [
          [
            'Explain the two-way link',
            'Show how changing the image changes the settings, and the reverse.',
          ],
          [
            'Give reasons',
            '25 of 66 wanted to know why the AI recommends a setting.',
          ],
          [
            'Lower the learning cost',
            'Final choices did not favor the new method; it has to be easier to pick up.',
          ],
        ], limitation: 'Concept and survey stage · the 66 responses reflect understanding and preference; prediction accuracy, in-oven camera at high heat and real baking results not yet tested on a device.' },
      image: '/works/portfolio/oven-state-timing/cover-ai-oven.jpg',
      gallery: [],
      modules: [
        { kicker: 'Trial and error · A year of changing direction', title: 'From “set by image” to “adjust while watching”', stacked: true, text: 'It started with the ALIVE microwave in 2023: tap a phone image card to the knob to send settings. Next came translating taste, warmth and texture into color, shape and firmness, and a detour into scoring cooking steps, before coming back to one idea: let people set the oven by watching the finished result. The survey went through three revisions.', images: [
            { src: '/works/portfolio/oven-state-timing/iteration-timeline-en.svg', alt: 'Iteration timeline of the AI oven', caption: 'Iteration timeline (from the progress reports)', wide: true },
            { src: '/works/portfolio/oven-state-timing/slide-texture-color.jpg', alt: 'Visualizing temperature and texture', caption: '2024.11: colors and textures for warm, cold and crispy' },
            { src: '/works/portfolio/oven-state-timing/slide-taste-shape.jpg', alt: 'Shapes and colors of the five tastes', caption: '2024.11: shapes and colors of the five tastes' },
            { src: '/works/portfolio/oven-state-timing/sim-test-plan.jpg', alt: 'Simulation test plan', caption: 'Simulation plan: compare 4 displays on a virtual microwave' },
          ] },
        { kicker: 'Interaction · Adjust while watching', title: 'People judge by eye, the oven keeps the numbers', text: 'The predicted image sits above the temperature and time controls. Change a value and the image follows; or pick a feature such as heat, firmness or browning and press + / − to have the values recalculated. Feelings like dryness also become adjustable sliders. Press start when it looks right.', points: [
            'The AI offers several results at once, from soft to firm and pale to brown, each with its time and temperature',
            'Two-way: from image to settings, or from settings to image',
          ], images: [
            { src: '/works/portfolio/oven-state-timing/screen-features.jpg', alt: 'Prediction screen with feature tabs', caption: 'Switch features and press + / −; time and temperature follow' },
            { src: '/works/portfolio/oven-state-timing/state-grid.jpg', alt: 'Several AI-generated baking results', caption: 'Several results at once, each with its time and temperature' },
          ], stacked: true },
        { kicker: 'All-in-one · In-oven monitoring', title: 'While baking, a camera checks against the prediction', text: 'Put in raw dough and an in-oven camera photographs it to generate the prediction. During baking it keeps watching and compares with the prediction, adjusting or stopping near the target instead of simply running out the timer. Imaging inside a hot oven is hard, but not impossible.', images: [
            { src: '/works/portfolio/oven-state-timing/original-state-options.png', alt: 'Insert food, auto-capture, generate prediction', caption: 'Insert → auto-capture → prediction and suggested settings', wide: true },
            { src: '/works/portfolio/oven-state-timing/ai-prediction-interface.jpg', alt: 'Oven concept with a prediction screen', caption: 'All-in-one concept (AI-generated illustration)' },
            { src: '/works/portfolio/oven-state-timing/bake-sequence.jpg', alt: 'Predicted sequence from raw to baked', caption: 'Predicted sequence from raw to baked (AI-generated)' },
          ] },
        { kicker: 'Data · Lab baking records', title: 'Learning the bake as a timeline', text: 'The predictions are not drawn from nothing: a company would bake at scale in its lab, recording shape and color at each time and temperature, so a model learns one continuously changing image timeline. Adjusting a setting means moving along that timeline.', points: [
            'For now AI-generated images stand in; next, 3D models of raw and baked bread for controlled stimuli',
          ], images: [
            { src: '/works/portfolio/oven-state-timing/data-pipeline-en.svg', alt: 'From lab data to an image timeline', caption: 'Data → image timeline → user setting', wide: true },
          ], stacked: true },
      ],
      href: '/works/oven-state-timing',
    },
    {
      id: 'alive-energy-link',
      title: 'ALIVE — Smart Appliances Linked by a Light Ring',
      type: 'Industrial design / Appliance system',
      category: 'Industrial design / Smart home energy',
      year: '2023-2024',
      period: 'After graduation · Smart appliances',
      status: 'Industrial design concept',
      role: 'Independent: product definition, research, form and CMF, light-ring interaction, C4D modeling and rendering',
      methods: 'Socket-use problem review, household power-distribution survey, ergonomics analysis, C4D modeling and animation',
      next: 'Industrial-design concept · renders, structure, and light-ring animation completed; no functional prototype.',
      description: 'Starting from the power strip, one light ring links the strip, a kettle, and a microwave: the light color shows power use, and the rings change in sync, so the machines feel linked, almost alive.',
      question: 'Plugs crowd the power strip, so unplugging one appliance means hunting for the right cable, and nobody can see which appliance uses the most power. Each appliance blinks its own indicators, unrelated to the others.',
      process: [
        [
          'Power strip: color shows power',
          'Color follows power, so you find the plug in a tangle; idle lights sleep and wake on touch.',
        ],
        [
          'Between machines: rings in sync',
          'All three rings change together, answering each other as if alive.',
        ],
        [
          'Kettle: information on top',
          'People look down at kettles, so level and temperature sit on the lid ring.',
        ],
        [
          'Microwave: tap to set',
          'The circle on the phone matches the knob\'s circle; tap to send time and temperature.',
        ],
      ],
      processIcons: ['plug', 'refresh', 'eye', 'phone'],
      outcomes: [
        'All three appliances use the same light ring, so their states match up.',
        'Each appliance then places information to suit its use: the kettle on top, the microwave by phone tap.',
      ],
      image: '/works/portfolio/alive-energy-link/cover-three-appliances.jpg',
      gallery: [],
      modules: [
        { kicker: 'Start · Power strip', title: 'Color tells power use and finds the plug', text: 'The survey listed 11 socket problems, such as “can’t find the right plug in tangled cables” and “can’t tell which socket is drawing power.” Socket rings change color with power. Low-power appliances are more common at home, so colors change faster between 0 and 300 W. Color also raises energy awareness: the biggest consumer is visible at a glance.', points: [
            'Infer the right plug from power use when cables are tangled',
            'Sleep after 10 seconds, wake by vibration, to save the lights’ own power',
            'Standard specs and interfaces to reduce waste',
          ], images: [
            { src: '/works/portfolio/alive-2023/power-color-en.svg', alt: 'Color by power', caption: 'Color by power (redrawn from the original portfolio)', wide: true },
            { src: '/works/portfolio/alive-2023/power-pie.jpg', alt: 'Household appliance power pie chart', caption: 'Household appliances by power: low power dominates' },
            { src: '/works/portfolio/alive-2023/strip-sketch-use.jpg', alt: 'Use sketches: tap to wake, find the plug by power', caption: 'Use sketches: tap to wake, find the plug by power' },
            { src: '/works/portfolio/alive-2023/strip-exploded.jpg', alt: 'Power strip exploded view', caption: 'Inside: lights, buttons and protection, sensing, control, power conversion', wide: true },
          ] },
        { kicker: 'System · Between machines', title: 'Rings change together, so appliances feel alive', text: 'All three appliances share one light-ring language. While a device runs, its ring changes in sync with its socket’s ring on the strip, giving separate machines a sense of linkage, as if they were alive and answering each other.', images: [
            { src: '/works/portfolio/alive-2023/three-nodes.jpg', alt: 'What each of the three appliances displays', caption: 'What each of the three appliances displays', wide: true },
            { src: '/works/portfolio/alive-2023/ring-sketch.jpg', alt: 'Light-ring structure sketch: diffuser ring above, LED base ring and driver below', caption: 'Light-ring structure sketch: diffuser ring above, LED base ring and driver below', wide: true },
          ] },
        { kicker: 'Kettle · Ergonomics', title: 'People look down, so information goes on top', text: 'Kettles usually sit below eye level, so people look down at them. A side water window means bending knees and back to read it, and people can only sense 100 °C by the boil, not other temperatures. So water level and temperature move to a ring on the lid, and the base ring changes too, answering “is it powered, is it heating?”', images: [
            { src: '/works/portfolio/alive-2023/kettle-top-cyan.jpg', alt: 'Kettle lid ring', caption: 'The lid ring shows level and temperature', wide: true },
            { src: '/works/portfolio/alive-2023/kettle-ergonomics.jpg', alt: 'Side view versus top view posture', caption: 'A side window needs bending; looking down is natural' },
            { src: '/works/portfolio/alive-2023/kettle-top-orange.jpg', alt: 'Lid ring while heating', caption: 'Warm color while heating' },
          ] },
        { kicker: 'Microwave · Tap to set', title: 'The circle on the phone matches the circle on the machine', text: 'Pick a recipe card on the phone; the circle on the card naturally matches the round knob, hinting that you tap the phone on it to transfer time and temperature by NFC in one go. A progress ring around the knob shows the remaining time and eases waiting. At the time the focus was on expressing temperature and keeping the design language consistent; the idea of “setting by image” later grew into the AI predicted-image oven.', images: [
            { src: '/works/portfolio/alive-2023/oven-phone-render.jpg', alt: 'Phone tapped on the knob', caption: 'Tap the phone on the knob to send settings', wide: true },
            { src: '/works/portfolio/alive-2023/oven-knobs-render.jpg', alt: 'Knob progress ring', caption: 'Knob rings: progress and power level', wide: true },
          ] },
      ],
      videos: [
        { src: '/works/portfolio/alive-2023/alive-demo.mp4', poster: '/works/portfolio/alive-2023/alive-demo-poster.jpg', caption: 'C4D demo: 0:04 power strip (lights by power, off after 10 s, wake on bump) → 0:20 kettle (base, capacity and temperature, blinking prompt) → 0:48 microwave (set time and heat, progress). The source file is low resolution.' },
      ],
      href: '/works/alive-energy-link',
    },
    {
      id: 'factory-planning',
      title: 'Xinfeng Technology Internship | B2B Plant Planning and Brand VI',
      type: 'Internship / Spatial planning',
      category: 'Internship / B2B plant planning & brand',
      year: '2023',
      period: 'Undergraduate internship · Xinfeng Technology (Jan–Feb 2023)',
      status: 'Company internship work',
      role: 'Intern: 3D plant modeling and renders, zoning and route marking, logo design and VI extension',
      methods: 'C4D modeling and rendering, Illustrator, VI guidelines',
      next: 'Company internship · delivered first- and second-floor renders and the company logo; the VI application pages were extended while preparing this portfolio.',
      description: 'An internship at an engineering-machinery company: 3D renders made the plant plan clear and helped align quickly with mechanical designers; I also designed the company logo and extended it into a compact VI.',
      question: 'In a B2B project the plan goes back and forth between design, engineering and management, and floor plans with notes are slow to read and easy to misunderstand. On the brand side, the old “Jinxin” mark did not match the company name, appeared only on business cards, and the equipment nameplates were plain white text on black.',
      process: [
        [
          'Align fast with renders',
          'Build both floors in 3D, then confirm zone by zone with the mechanical designers.',
        ],
        [
          'Zones and routes',
          'Mark production, storage and office areas, visitor routes, fire doors and logistics doors.',
        ],
        [
          'Brand upgrade',
          'Replace “Jinxin” with a mark shaped directly from 鑫 and 丰, in a steady red.',
        ],
        [
          'Consistent touchpoints',
          'Apply mark, color and type to drawings, documents, nameplates and signage.',
        ],
      ],
      processIcons: ['cube', 'route', 'pen', 'layers'],
      outcomes: [
        '3D renders replaced floor plans and long explanations, so engineers could confirm or flag problems straight from the image.',
        'The mark changed from a business-card-only “Jinxin” to “Xinfeng”, matching the company name, as the company moves from a production plant toward an equipment product brand: under one master brand, products are named by business line and equipment type, so the equipment shows whose it is.',
      ],
      image: '/works/portfolio/factory-safety-vi/factory-first-floor.jpg',
      gallery: [],
      modules: [
        { kicker: 'B2B communication · Plant planning', title: 'Renders instead of explanations, to align quickly with mechanical designers', text: 'The plan had to be confirmed repeatedly across design, engineering and management. I built both floors in C4D with zones and routes marked, then walked the mechanical designers through equipment positions and aisles zone by zone. Compared with floor plans and notes, they could point out problems at a glance, and far fewer rounds were needed.', points: [
            'Ground floor: production, storage, parts and service areas',
            'Upper floor: production, visitor route and offices',
            'Fire doors, logistics doors and other safety-related positions marked',
          ], images: [
            { src: '/works/portfolio/factory-safety-vi/factory-second-floor.jpg', alt: 'Upper-floor plant planning render', caption: 'Upper floor: production, visitor route and offices', wide: true },
          ] },
        { kicker: 'Brand upgrade · From “Jinxin” to “Xinfeng”', title: 'The mark finally matches the company name', text: 'Before, the company used a rotating hook mark that read “Jinxin”, with green-and-gold business cards: the name did not match, the thin lines blurred at nameplate size, and the colors felt like a trading firm or jeweler. In the new mark three sectors stand for the three 金 of 鑫 with 丰 below; a deep red with a touch of black, alongside ink black and steel gray, reads as an industrial equipment maker.', images: [
            { src: '/works/portfolio/xinfeng/vi-upgrade.jpg', alt: 'Before and after (VI applications extended while preparing this portfolio; same below)', caption: 'Before and after (VI applications extended while preparing this portfolio; same below)', wide: true },
            { src: '/works/portfolio/xinfeng/logo-construction.jpg', alt: 'Original construction drawing', caption: '2023 original: mono version and construction' },
            { src: '/works/portfolio/xinfeng/logo-combination.jpg', alt: 'Original Chinese and English lockup', caption: '2023 original: lockup and color code' },
          ] },
        { kicker: 'Brand planning · One master brand', title: 'Set the rules, then carry them to the machine and every touchpoint', stacked: true, text: 'The originals already paired the mark with “Xinfeng Chemical” and “Xinfeng Metallurgy”; I made that a rule: one mark, only the name changes. Equipment is coded by category (EL electrolysis, IN casting, EX extraction), with consumables as support. On the same electrolysis unit I compared three stages: old mark, logo swapped only, and unified identity. Only the last tells people which Xinfeng category and which unit it is. Fixing rules first and staying consistent later carried into product planning.', points: [
            'Machine: mark fixed at top left, category and model at right, divided by a red rule',
            'The document code on the nameplate matches the manual cover, so the right manual and drawings can be found from the machine',
            'Only three uses: machine, nameplate with documents, business card',
          ], images: [
            { src: '/works/portfolio/xinfeng/vi-machine.jpg', alt: 'One machine, three stages (machine body is an AI-generated base image)', caption: 'One machine, three stages (machine body is an AI-generated base image)', wide: true },
            { src: '/works/portfolio/xinfeng/vi-brand.jpg', alt: 'Master brand and business lines', caption: 'Master brand and business lines' },
            { src: '/works/portfolio/xinfeng/vi-nameplate.jpg', alt: 'Nameplate linked to technical documents', caption: 'Nameplate linked to technical documents' },
            { src: '/works/portfolio/xinfeng/vi-card.jpg', alt: 'Business card', caption: 'Business card' },
          ] },
      ],
      href: '/works/factory-planning',
    },
    {
      id: 'corporate-vi',
      title: 'Linkeen Corporate VI — Course Project',
      type: 'Course project / Corporate identity',
      category: 'Course project / Logo & VI standards',
      year: '2022',
      period: 'Undergraduate course · Corporate Identity Design',
      status: 'Course design project',
      role: 'Logo design, construction grid, and VI manual layout',
      methods: 'Logo grid, color and typography standards, application design',
      next: 'A course project; the identity was not used by a real brand. The archive contains a 43-page VI manual.',
      description: 'A Corporate Identity Design course project for “Linkeen” (力肯高科): a text-led logo developed into a geometric K mark, documented in a 43-page VI manual.',
      question: 'How can a company mark and its applications express a steady, safe identity?',
      process: [
        ['Develop the graphic mark', 'Moved from a text-led logo to a geometric K-based symbol using negative space and a rising triangle motif.'],
        ['Systemize the identity', 'Defined logo construction, color, typography, Chinese-English combinations, and applications in a 43-page VIS manual.'],
      ],
      processIcons: ['pen', 'grid', 'book'],
      outcomes: [
        'Developed a graphic mark from a text-led logo and set basic identity standards and applications.',
        'Completed the logo, construction drawings, and a 43-page VI manual.',
      ],
      image: '/works/portfolio/factory-safety-vi/vi-cover.jpg',
      gallery: [
        { image: '/works/portfolio/factory-safety-vi/logo-rationale.jpg', alt: 'Logo concept rationale showing the geometric K mark and its construction', caption: 'Logo development: a text-led identity becomes a geometric K mark with a rising triangle.' },
        { image: '/works/portfolio/factory-safety-vi/logo-grid.jpg', alt: 'Geometric construction grid for the corporate logo', caption: 'Logo standardization: proportion and grid rules for consistent reproduction.' },
        { image: '/works/portfolio/factory-safety-vi/logo-combinations.jpg', alt: 'Chinese and English corporate logo combinations', caption: 'Logo combinations: Chinese and English wordmarks paired with the graphic symbol.' },
      ],
      href: '/works/corporate-vi',
    },
    {
      id: 'fridge-timeline',
      title: 'Fridge Timeline System',
      type: 'Product system / Food management',
      category: 'Product system / Food management',
      year: '2022-2023',
      period: 'Undergraduate graduation project · Product system',
      status: 'University graduation project',
      role: 'Solo: competitor review, problem definition, behavior flow, form and CMF, light interaction, C4D animation, 1/4 light model',
      methods: 'Review of 10 fridges, behavior-flow analysis, anthropometric sizing, C4D modeling and animation, 1/4 light model',
      next: 'Undergraduate graduation project · C4D flow animation and 1/4 light model completed; label printing not built, recognition accuracy and real use not tested.',
      description: 'Connects the whole path food takes into the home: scan items while sorting them on the counter next to the fridge, then lights guide where to store them and where to find them later.',
      question: 'Busy two- or three-person households often push groceries into the fridge bag and all. Once it fills up, things get lost, items in the corners are forgotten, and food expires. The 10 fridges reviewed had zones and apps, but logging was tedious and none helped people find things quickly.',
      process: [
        [
          'Scan on the counter',
          'Log each item while unpacking on the counter, before it goes into the fridge.',
        ],
        [
          'Pickup-code order',
          'Shelves by type; on each shelf, new items go right, so nobody has to remember where things are.',
        ],
        [
          'Two-step light guide',
          'A door strip shows which door; a shelf light inside shows which spot.',
        ],
        [
          'Find and take out by phone',
          'Find an item and its date on the phone; its spot lights up.',
        ],
      ],
      processIcons: ['camera', 'pin', 'light', 'phone'],
      outcomes: [
        'Items are registered while sorting on the counter after coming home, rather than recognized only once they are inside the fridge.',
        'Order drives efficiency: one rule, new on the right and old on the left, plus two steps of light, so people don\'t need to remember where each item is.',
      ],
      image: '/works/portfolio/fridge-timeline-system.png',
      gallery: [
        { image: '/works/portfolio/fridge-2023/render-kitchen.jpg', alt: 'Fridge in a kitchen render', caption: '2023 render: fridge right beside the counter' },
        { image: '/works/portfolio/fridge-2023/render-cmf.jpg', alt: 'Four color options', caption: 'CMF: four body colors' },
        { image: '/works/portfolio/generated/fridge-story-triptych.png', alt: 'AI re-creation of usage scenes', caption: '2026 AI re-creation of the scenes, not the original design' },
      ],
      videos: [
        { src: '/works/portfolio/fridge-2023/flow-demo.mp4', poster: '/works/portfolio/fridge-2023/flow-demo-poster.jpg', caption: 'C4D flow animation (2023): take the scanner → scan on the counter → inner light guidance → angled door light.' },
        { src: '/works/portfolio/fridge-2023/scan-view.mp4', poster: '/works/portfolio/fridge-2023/scan-view-poster.jpg', caption: 'Scanning view: placing items into the scan area one by one.' },
      ],
      research: { sample: 'A review of 10 fridges on the market (Samsung, Haier, Xiaomi, Midea, Konka, AUX, Chigo, Casarte, Damier, Viomi) found 6 problems; 3 of them set the design direction.', metrics: [], decisions: [
          [
            'Zones don’t keep things tidy',
            'Most fridges have zones but don’t help users stay organized → fixed places plus light guidance.',
          ],
          [
            'App entry is unclear',
            'Smart apps exist, but entering and managing food is unclear → move entry to counter scanning.',
          ],
          [
            'Hard to find things',
            'Nothing helps users quickly find stored items → two-step light location outside and inside.',
          ],
        ], limitation: 'Undergraduate graduation project · C4D flow animation and 1/4 light model completed; label printing not built, recognition accuracy and real use not tested.' },
      comparison: { title: 'Compared with recent AI fridges', intro: 'Since 2024, Samsung, Casarte and others have released fridges that recognize food with cameras. This design was finished in 2023 with a similar goal — remembering location and dates — but a different entry point: recognition happens on the counter before food goes in, and lights guide where it goes.', columns: [
          'This design (2023 graduation project)',
          'Casarte AI fridge (public info 2025–2026)',
        ], rows: [
          [
            'When it recognizes',
            'Before storing, scanned one by one on the counter',
            'While storing, by the “AI Eye”',
          ],
          [
            'How',
            'Barcode + image recognition (concept)',
            '210+ foods at the 2025 launch; 2,000+ in 2026 reports',
          ],
          [
            'Location guidance',
            'Angled door light + inner shelf lights, in two steps',
            'Not mentioned in public info',
          ],
          [
            'Date management',
            'Phone list and expiry alerts',
            'Proactive expiry alerts, cross-device sync',
          ],
          ['Without a phone', 'Printed labels on food (idea, not built)', '—'],
          ['Stage', 'C4D animation + 1/4 light model', 'Mass-produced product'],
        ], sources: [
          ['GeekPark 2025-06-26', 'https://www.geekpark.net/news/350884'],
          [
            'China.com 2026-08-21',
            'https://mtz.china.com/touzi/2026/0821/260650.html',
          ],
          [
            'Tom’s Guide 2024-01-04 (Samsung AI Vision Inside)',
            'https://www.tomsguide.com/news/samsung-unveils-2024-bespoke-family-hub-refrigerator-with-vision-ai-heres-what-it-can-do',
          ],
        ] },
      modules: [
        { kicker: 'Entry point · Counter scanning', title: 'Log items on the counter, not at the fridge', text: 'Unpacking and sorting happen on the kitchen counter, not at the fridge, so that is the best moment to log items. The scanner is a separate accessory: it charges magnetically beside the door screen and comes off to the counter, where you scan items one by one before putting them away together.', points: [
            'Infrared code scanning + image recognition; label printing was a concept, not built',
            'Cylinder changed to a square column: one fewer moving joint, and easier to snap back onto the fridge',
            'An outline light shows both that it is working and where the scan area is',
          ], images: [
            { src: '/works/portfolio/fridge-2023/behavior-flow-en.svg', alt: 'Storing and taking-out behavior flow', caption: 'Behavior flow (rebuilt from the graduation project)', wide: true },
            { src: '/works/portfolio/fridge-2023/render-scan-beam.jpg', alt: 'Scanner projecting a scan area on the counter', caption: 'On the counter, projecting a scan area' },
            { src: '/works/portfolio/fridge-2023/thesis-scanner-sketch.jpg', alt: 'Scanner form sketches', caption: 'Form study: cylinder to square column' },
            { src: '/works/portfolio/fridge-2023/model-scanner.jpg', alt: 'Scanner physical model', caption: 'Scanner model' },
          ], stacked: true },
        { kicker: 'Order · Parcel pickup codes', title: 'New on the right, old on the left', text: 'Parcel lockers find one package among thousands with a code like 27-5-3002 (shelf, tier, day, number). A fridge holds far fewer items but needs the same order: shelves by type, and on each shelf items run left to right by arrival. People can\'t remember every position, but they can remember one rule.', points: [
            'Two storage modes for different effort levels: simple mode puts whole bags into large boxes pushed left by date; detailed mode repacks and labels each item',
            'The far left is the oldest, so eat that first',
          ], images: [
            { src: '/works/portfolio/fridge-2023/order-rule-en.svg', alt: 'Pickup-code rule and the new-right old-left arrangement', caption: 'Pickup code → arrangement rule inside the fridge (redrawn)', wide: true },
            { src: '/works/portfolio/fridge-2023/midterm-concept.jpg', alt: 'Midterm review: starting concept', caption: 'Midterm: parcel storage → smart storage → light guidance' },
            { src: '/works/portfolio/fridge-2023/midterm-courier-analogy.jpg', alt: 'Courier scanning and labels', caption: 'Reference: courier scanning and labels' },
          ], stacked: true },
        { kicker: 'Light · Two-step guidance', title: 'Outside: which door. Inside: which spot.', text: 'Once a spot is assigned, the strip on the matching door lights up; it runs along the hidden handle and its shape hints at the opening direction. Inside, the matching shelf zone lights up. Taking items out works the same way: drag an item to “take out” on the phone or door screen, and its door light blinks.', points: [
            'Handle zone set from raised-hand heights of the 5th-percentile Chinese woman to the 95th-percentile man',
            'Screen height worked out from standing eye height and a 40 cm operating distance',
            'The door screen stays secondary to the phone: on standby it is a clock whose hands set a timer',
          ], images: [
            { src: '/works/portfolio/fridge-2023/render-fridge.jpg', alt: 'Fridge with angled strips by the handles', caption: 'Outside: angled strips beside the handles', wide: true },
            { src: '/works/portfolio/fridge-2023/render-interior-sequence.jpg', alt: 'Shelf zones lighting step by step', caption: 'Inside: the shelf zone lights up, then turns off' },
            { src: '/works/portfolio/fridge-2023/thesis-ergonomics-sketch.jpg', alt: 'Raised-hand height and handle position sketch', caption: 'Raised-hand height and handle zone' },
          ] },
        { kicker: 'Prototype · 1/4 light model', title: 'A model where the guidance actually lights up', text: 'The body and doors were built at 1/4 scale from PVC board, with 5 V LED strips set into grooves in the doors. A breadboard and switches on the back light each strip separately, to show where the two-step guidance appears and how it looks.', points: [
            'Done: C4D flow animation + 1/4 physical model',
            'Not done: recognition accuracy and user testing',
          ], images: [
            { src: '/works/portfolio/fridge-2023/model-full.jpg', alt: '1/4 fridge model with scanner', caption: 'Body and scanner' },
            { src: '/works/portfolio/fridge-2023/model-lit.jpg', alt: 'Door strips lit', caption: 'Door strips lit one by one' },
            { src: '/works/portfolio/fridge-2023/model-interior.jpg', alt: 'Light strips inside the model', caption: 'Shelf strips inside' },
            { src: '/works/portfolio/fridge-2023/model-wiring.jpg', alt: 'Wiring on the back', caption: 'Wiring with a switch for each strip' },
          ] },
      ],
      href: '/works/fridge-timeline',
    },
  ],
  ja: [
    {
      id: 'co-creative-ai-training',
      title: '個人ならではの判断を引き出すAI共創インターフェース',
      type: 'AIインタラクション / 修士研究',
      category: 'AIインタラクション / 修士研究',
      year: '2025-2026',
      period: '大学院期・HCIとAI体験',
      status: '修士研究進行中',
      role: '単独担当：インタラクション構想、画面設計、確認・補足の仕組み、評価計画',
      methods: 'AI対話テキスト分析、主観評価、比較UIとアイトラッキング（計画）',
      next: '修士研究進行中・比較UIとアイトラッキング実験を準備中。',
      description: '「高級感」のような言葉の受け取り方は人それぞれだが、AIは一般的な解釈で生成するため、両者の理解にずれが生じる。画面でまずAIの解釈を示し、ユーザー独自の判断を入力するよう促し、AIがそれに合わせて調整する。共創の結果が本人の意図に近づく。',
      question: '「高級感」「温かみ」などの感性語を入れると、AIは一般的な解釈で生成しがちで、結果がありきたりになる。ユーザーにはAIの理解が見えず、直すこともできない。',
      process: [
        ['AIの理解を表示', '回答の横に、感性語に対するAIの一般的な解釈を並べ、ずれを見えるようにする。'],
        ['確認または補足', '「この意味で合っている / 違う、こうしたい…」の入口を用意し、自分の基準を補足するよう促す。'],
        ['応答を調整', 'AIが補足に応じて提案、説明、問い返しを変える。'],
      ],
      processIcons: ['eye', 'message', 'refresh', 'check'],
      outcomes: [
        'ユーザーが独自の理解を補い、AIの一般的な理解との隔たりが縮まる。',
        'AIの一般的な理解と個人の基準が同時に見え、誤解をすぐに直せる。',
        '比較UIとアイトラッキングで、提示が実際に注目されるかを検証する計画。',
      ],
      image: '/works/portfolio/ai-understanding-confirmation-ja.svg',
      gallery: [
        { image: '/works/portfolio/generated/ai-cocreation-chat-v2.png', alt: '対話画面の構想', caption: '初期案：「AIが判断 / 一緒に検討 / 自分で判断」の3モードから選ぶ。現在の案では、まずAIの解釈を示し、ユーザーが確認・補足する。', wide: true },
        { image: '/works/portfolio/generated/ai-story-triptych.png', alt: '利用場面の三連図', caption: '初期案の利用場面（AI生成のイメージ）：スケッチから判断の分担、提案の調整まで。', wide: true },
        { image: '/works/portfolio/generated/ai-cocreation-overlay.png', alt: '共創フローの構想', caption: '初期案の3つの判断役割（AI生成のイメージ）。' },
      ],
      href: '/works/ai-judgement',
    },
    {
      id: 'transparent-driving-hud',
      title: '道路を見続けるための運転支援HMI',
      type: '知能運転 / 注意価値HMI',
      category: '知能運転 / 注意価値HMI',
      year: '2025-2026',
      period: '大学院期・運転HMI',
      status: '研究コンセプト',
      role: 'HMIリサーチ、運転注意デザイン、安全境界、主観体験テスト計画',
      methods: '運転場面の分解、表示強度の比較、中国国内の法規・規格の整理、主観評価（計画）',
      next: 'HMIコンセプト段階 · 中国国内の関連法規と取捨選択を整理済み（公表資料と解説に基づく）。主観評価の質問紙を準備中。',
      description: '運転支援中、AIが気にしている対象を一つだけ示し、理由を一文で添える。大量のデータを読む必要はなく、運転者は道路を見続ける。',
      question: '知能運転が安定しても、人の注意と運転したい気持ちをどう残せるか。',
      process: [['運転意欲', '人が座るだけになると、高価値な車の体験も移動手段へ縮小する。'], ['AIの注目を示す', '信頼は基礎にすぎず、AIがどの問題を見ているかを明示する。'], ['感情的な警告', '子どもの飛び出しや隣車線の接近を、表情と短文で直感的に伝える。'], ['法規との取捨', '中国国内の運転支援に関する現行法規・規格を整理し、どの提示が可能で、どこを標準化された警告に譲るべきかを決める。']],
      processIcons: ['target', 'message', 'alert', 'check'],
      outcomes: [
        '距離や速度だけでなく、AIがどの対象をなぜ気にしているかが分かる。',
        '表示は具体的な対象に付き、危険度で強弱を変えて邪魔をしない。法規が求める監視と警報はそのまま働き、この表示は補助にすぎない。',
      ],
      image: '/works/portfolio/generated/hmi-risk-overlay.png',
      gallery: [
        { image: '/works/portfolio/generated/hmi-story-triptych.png', alt: '提示強度の三連図', caption: '三段階の強度（AI生成のイメージ）：低リスクは軽い提示、中リスクは対象表示、高リスクは明確な警告。', wide: true },
        { image: '/works/portfolio/generated/hmi-attention-hero.png', alt: '運転視点の構想', caption: '運転視点（AI生成のイメージ）：AIが最も気にしている対象だけを示し、視界を情報で埋めない。' },
      ],
      comparison: { title: '中国国内の法規と取捨選択', intro: 'この表示を車に載せるには、まず国内法規を満たす必要がある。関係する三つを整理した。法規が定めるのは「運転者は道路を見続ける」「システムは警告する」「フロントガラスに何を出せるか」であり、本案はその範囲内で補うだけにする。公表資料と解説に基づき、規格本文は逐条確認していない。', columns: ['法規の要求（要約）', '本案の取捨選択'], rows: [
          [
            'GB 47955—2026 組合せ運転支援システムの安全要求（強制、2027年1月1日施行）',
            '運転者は交通状況を見続けて車両を操作する。システムは手放しと視線外れを検知し、「監視—警告—制限」の段階で対応し、機能の限界を利用者に知らせる。',
            '表示は注意を保つための補助と位置づけ、法規が求める手放し・視線警報の代わりにはしない。高リスク時は標準化された警告に譲り、感情的な文言は加えない。',
          ],
          [
            '工業情報化部・市場監督管理総局「スマートコネクテッドカーの型式認可・リコール・OTA管理の強化に関する通知」（2025年4月）',
            '機能の境界と安全対応を明確にし、告知義務を果たし、誇大・虚偽の宣伝をしない。',
            '文言は「AIが何を気にしているか」だけを伝え、「対応済み」「安心して」とは言わず、システムが運転を引き受けると示唆しない。「自動運転」という表現も避ける。',
          ],
          [
            'GB/T 46926—2025 小型車の視界補助システムの技術要求と試験方法',
            '前方視界の透明領域の表示を区分して管理：上部領域は非静的情報のみ、不透明画素は50%以下。ARの重ね合わせは実環境と一致させる。',
            '強調は一つの対象だけ、塗りつぶしでなく輪郭線で。説明文は下部領域に短時間だけ表示。実際の対象に追従できない場合は枠を出さない。',
          ],
        ], sources: [
          [
            '工業情報化部 · GB 47955—2026 公表',
            'https://www.miit.gov.cn/jgsj/zbys/qcgy/art/2026/art_7bcb480b0db5432f8542157a9fc12841.html',
          ],
          [
            '搜狐汽車 · GB 47955 解説',
            'https://www.sohu.com/a/1090745157_120325502',
          ],
          ['第一財経 2025-04-17', 'https://www.yicai.com/news/102575851.html'],
          [
            '騰訊ニュース · GB/T 46926—2025 解説',
            'https://news.qq.com/rain/a/20260130A01RUQ00',
          ],
        ] },
      href: '/works/driving-attention',
    },
    {
      id: 'frametrace',
      title: 'FrameTrace',
      type: 'MRグラス / 時間を超えた写真体験',
      category: 'MRグラス / 時間を超えた写真体験',
      year: '2025-2026',
      period: '大学院期・空間HCI / MR',
      status: 'Quest 3プロトタイプ制作中',
      role: '調査、空間UX、MRインタラクション、Quest 3プロトタイプを独立制作',
      methods: '106件の質問紙、感度分析、シナリオ設計、空間プロトタイピング',
      next: '概念のイメージ図で106件の回答を収集し、高リスク回答を除いた主分析はN=82。次はQuest 3で撮影位置の探索、手のジェスチャーによる構図指定、焦点距離の案内を観察する。',
      description: 'FrameTraceには二つの方向がある。一つはMRで他者の撮影位置と視点を現地で体験すること、もう一つは両手のジェスチャーでファインダーのように構図を決め、焦点距離の提案を受けること。',
      question: '完成した写真から、撮影者がどこに立ち、どう構図を決め、どの焦点距離を使ったかを理解できるようにするには。',
      process: [['撮り方を発見', '現地で他者の撮影位置、レンズの方向、ポーズの痕跡を見る。'], ['順序に沿って探索', '複数の撮影地点を一連の体験につなぎ、角度や構図をさらに探すよう導く。'], ['ジェスチャーでファインダー', 'ファインダーを持つ代わりに両手で範囲を囲み、構図を確かめて焦点距離の提案を受ける。'], ['撮影を完了', '現実の位置で構図を合わせ、新しい撮影の痕跡を残し、時間を超えた写真の交流につなげる。']],
      processIcons: ['eye', 'route', 'frame', 'camera'],
      outcomes: ['撮り方を、歩いて確かめ、構図を合わせ、時間を超えて共有できる体験にする。', '主分析N=82で、概念全体の第一印象は5.65/7。', 'プライバシー、推薦理由、歩行安全は次のプロトタイプの優先課題。'],
      image: '/works/portfolio/frametrace-grid-4.jpg',
      href: '/works/frametrace',
    },
    {
      id: 'taste-again',
      title: '好久没吃',
      type: 'WeChatミニプログラム / 個人の食事周期',
      category: 'WeChatミニプログラム / 個人の食事周期',
      year: '2025-2026',
      period: '大学院期・プロダクト体験とミニプログラム',
      status: 'WeChat MVP公開済み',
      role: 'プロダクト定義、調査、UX/UI、ミニプログラム実装を独立制作',
      methods: '形成的調査、行動ループ設計、情報設計、モバイルプロトタイピング',
      next: '57人の形成的質問紙で概念を調査し、その後AI開発ツールを使って実際に動くWeChatミニプログラムを制作・公開した。',
      description: '食べ物ごとに前回いつ食べたかを記録し、自分の目安周期を決める。記録はたまっていつでも探せ、何を食べるか迷った時に久しぶりの味を思い出せる。',
      question: 'しばらく食べていないものを選びたい。何を、どれくらい食べていなくて、今日また食べたいか。',
      process: [
        ['一回の食事を記録', '食べたものと日付を残し、前回からの日数を計算する基礎にする。'],
        ['目安周期を設定', '週に一度、毎日など、味ごとに個人の目安周期を決める。'],
        ['周期を参考に選ぶ', '周期表で目安の日数に達した味を確認し、最後は本人が選ぶ。'],
        ['もう一度記録', '食べた後に日付を更新し、目安周期を個人の実際の行動につなげる。'],
      ],
      processIcons: ['edit', 'calendar', 'list', 'check'],
      outcomes: ['前回からの日数と個人の目安周期を一つの判断で見られ、長期の記録もいつでも探せる。', '食べ物ごとに異なるリズムと目安周期を設定できる。', '57人の概念調査後、AI開発ツールでWeChatミニプログラムを完成・公開した。'],
      image: '/works/portfolio/haojiu-meichi-cover-upscaled.png',
      href: '/works/taste-again',
    },
    {
      id: 'smart-oven-timing',
      title: 'AI予測画像オーブン：仕上がりを見ながら時間と温度を決める',
      type: 'スマート家電インタラクション / Photoshop構想',
      category: 'オーブン操作 / 状態プレビューと時間選択',
      year: '2024-2025',
      period: 'インタラクション探索期・オーブン状態プレビュー',
      status: 'コンセプト＋66名調査・日本感性工学会で発表',
      role: '個人制作：コンセプト、インターフェースデザイン、AI画像生成、アンケート設計と分析',
      methods: '感覚の可視化（色・形・硬さ）、AI画像生成、Photoshopによる画面試作、アンケート3回改訂、66名のコンセプト調査',
      next: 'コンセプトとアンケートの段階 · 予測の正確さ、高温の庫内カメラ、実際の焼き上がりは実機で未検証。',
      description: 'オーブンの横に画像画面があり、いまの時間・温度・乾燥度で焼いたときの様子をリアルタイムに生成する。見ながら調整し「これだ」と感覚で判断すれば、機械は必要な設定値を得る。',
      question: 'オーブンは時間と温度で設定するが、人が思い描くのは「外はきつね色、中はふんわり」という結果。初心者は欲しい食感を数値に置き換えられず、試行錯誤を繰り返す。',
      process: [
        ['見ながら調整', '時間・温度・乾燥度を変えると、横の予測画像がリアルタイムに変わる。'],
        ['感覚で決める', '欲しい見た目になったら焼き始める。設定値は機械が記録。'],
        ['庫内で見守る', '焼成中はカメラが予測画像と比べ、目標に近づくと調整・停止。'],
        ['実験室のデータ', '予測画像は大量の焼成データから学んだタイムライン。'],
      ],
      processIcons: ['sliders', 'eye', 'camera', 'layers'],
      outcomes: [
        '欲しい焼き上がりを選ぶだけで、時間と温度は機械が換算する。',
        '1年かけて何度も方向を変え、企業が一つの製品のために取り組める案に落ち着いた。リスクも明記した。',
      ],
      research: { sample: '66名へのオンラインアンケート（男性23名、女性43名、約半数が26〜35歳）。操作説明図を見たうえで新しい方式を評価し、ダイヤルやボタンと比較した。約70%が操作をおおむね理解できたと回答。', metrics: [], charts: [
          { title: '新方式の利点（複数回答）', unit: '人', total: 66, bars: [
              [
                '試行錯誤が減る',
                43,
                true,
              ],
              [
                '初心者の失敗が減る',
                32,
              ],
            ], note: '利点は「遠回りが減る」こと。' },
          { title: '主な欠点（複数回答）', unit: '人', total: 66, bars: [
              [
                '慣れが必要',
                37,
                true,
              ],
              [
                '操作が複雑になりうる',
                32,
              ],
              [
                '推奨の理由を知りたい',
                25,
              ],
            ], note: '次は学習コストを下げ、推奨の理由を示す。' },
          { title: 'なじみやすい調整の向き', unit: '人', total: 66, bars: [
              [
                '画像を選んで数値へ',
                38,
                true,
              ],
              [
                '数値を変えて画像を見る',
                28,
              ],
            ], note: '多くの人は「欲しい姿」から始めたい。' },
          { title: '最終的に選ぶ設定方法', unit: '人', total: 66, bars: [
              [
                'ダイヤル',
                25,
              ],
              [
                'アイコン',
                19,
              ],
              [
                'AI予測画像',
                18,
                true,
              ],
              [
                '場合による',
                4,
              ],
            ], note: '予測画像はまだ第一候補ではない。' },
        ], decisions: [
          ['双方向の関係を示す', '画像を変えると数値がどう変わり、数値を変えると画像がどう変わるかを分かるようにする。'],
          ['理由を添える', '66名中25名が、AIがなぜそう勧めるのかを知りたいと回答。'],
          ['学習コストを下げる', '最終的な選択は新方式に偏らなかった。もっと覚えやすくする必要がある。'],
        ], limitation: 'コンセプトとアンケートの段階 · 66名の回答は理解と好みを示すもの。予測の正確さ、高温の庫内カメラ、実際の焼き上がりは実機で未検証。' },
      image: '/works/portfolio/oven-state-timing/cover-ai-oven.jpg',
      gallery: [],
      modules: [
        { kicker: '試行錯誤 · 1年で何度も方向転換', title: '「画像で設定」から「見ながら調整」へ', stacked: true, text: '出発点は2023年のALIVEの電子レンジ。スマホの画像カードをつまみにかざして設定を送る案だった。その後、味・温かさ・触感を色・形・硬さに置き換える試みや、調理工程を採点する寄り道を経て、一つの考えに戻った。仕上がりを見ながらオーブンを設定すること。アンケートは3回改訂した。', images: [
            { src: '/works/portfolio/oven-state-timing/iteration-timeline-ja.svg', alt: 'AIオーブン案の変遷', caption: '変遷のタイムライン（各回の報告から整理）', wide: true },
            { src: '/works/portfolio/oven-state-timing/slide-texture-color.jpg', alt: '温度と触感の表現', caption: '2024.11：温かい・冷たい・サクサクを色と質感で表す' },
            { src: '/works/portfolio/oven-state-timing/slide-taste-shape.jpg', alt: '五味の形と色', caption: '2024.11：五味の形と色' },
            { src: '/works/portfolio/oven-state-timing/sim-test-plan.jpg', alt: '模擬実験の計画', caption: '模擬実験の計画：仮想の電子レンジで4種類の表示を比較' },
          ] },
        { kicker: '操作 · 見ながら調整', title: '人は感覚で判断し、数値は機械が覚える', text: '画面の上に予測画像、下に温度と時間。数値を変えれば画像が変わり、逆に「火加減」「硬さ」「焼き色」などの特徴を選んで + / − を押せば数値が換算される。乾燥度のような感覚も調整バーにした。欲しい姿になったらスタート。', points: [
            'AIは柔らかい〜硬い、白い〜焼き色の濃いまで複数の結果を同時に示し、それぞれに時間と温度が付く',
            '双方向：画像から数値へ、数値から画像へ',
          ], images: [
            { src: '/works/portfolio/oven-state-timing/screen-features.jpg', alt: '特徴を切り替える予測画面', caption: '特徴を切り替えて + / −、温度と時間が連動' },
            { src: '/works/portfolio/oven-state-timing/state-grid.jpg', alt: 'AIが生成した複数の焼き上がり', caption: '複数の結果を同時に生成、それぞれに時間と温度' },
          ], stacked: true },
        { kicker: '一体型 · 庫内の見守り', title: '焼いている間、カメラが予測画像と見比べる', text: '生地を入れると庫内カメラが自動で撮影し、予測画像を生成する。焼成中も撮り続けて予測と比べ、目標に近づけば調整や停止を行う。設定時間をただ消化するのではない。高温の庫内での撮影は難しいが、不可能ではない。', images: [
            { src: '/works/portfolio/oven-state-timing/original-state-options.png', alt: '入れる・自動撮影・予測画像の生成', caption: '入れる → 自動撮影 → 予測画像と推奨設定', wide: true },
            { src: '/works/portfolio/oven-state-timing/ai-prediction-interface.jpg', alt: '予測画面付きオーブンの概念図', caption: '一体型のコンセプト（AI生成のイメージ）' },
            { src: '/works/portfolio/oven-state-timing/bake-sequence.jpg', alt: '生から焼き上がりまでの予測', caption: '生から焼き上がりまでの予測（AI生成）' },
          ] },
        { kicker: 'データ · 実験室での焼成記録', title: '焼成の過程をタイムラインとして学ぶ', text: '予測画像は何もないところから描くのではない。企業が実験室で大量に焼き、時間・温度ごとの形と色を記録して、連続して変化する画像のタイムラインをモデルに学ばせる想定だ。設定を変えることは、この軸の上を動くことになる。', points: ['研究段階ではAI生成画像で代用し、次は3Dモデルで生と焼き上がりのパンを統制した刺激をつくる計画'], images: [
            { src: '/works/portfolio/oven-state-timing/data-pipeline-ja.svg', alt: '実験室データから画像のタイムラインへ', caption: 'データ → 画像タイムライン → ユーザーの設定', wide: true },
          ], stacked: true },
      ],
      href: '/works/oven-state-timing',
    },
    {
      id: 'alive-energy-link',
      title: 'ALIVE｜ライトリングでつながるスマート家電',
      type: 'インダストリアルデザイン / 家電システム',
      category: 'インダストリアルデザイン / スマート家電',
      year: '2023-2024',
      period: '卒業後の個人制作・スマート家電',
      status: 'インダストリアルデザイン構想',
      role: '個人制作：製品定義、調査、造形とCMF、ライトリングのインタラクション、C4Dモデリングとレンダリング',
      methods: 'コンセント使用の問題整理、家電の電力分布調査、人間工学分析、C4Dモデリングとアニメーション',
      next: 'インダストリアルデザイン構想 · レンダリング、構造表現、リングのアニメーションを制作。機能試作は未制作。',
      description: '電源タップから出発し、一つのライトリングでタップ・電気ケトル・電子レンジをつなぐ。光の色で消費電力を示し、リングが同時に変化することで、機械どうしがつながり、どこか「生きている」ように感じられる。',
      question: 'タップにプラグが密集し、ある家電を抜こうとしても対応する線が見つからない。どの家電が電力を多く使っているかも見えない。家電はそれぞれ別の表示灯を点けており、互いに関係がない。',
      process: [
        ['電源タップ：色で電力を示す', '電力に応じて色が変わり、絡まった配線でもプラグが見つかる。放置で消灯、触れると起動。'],
        ['機器の間：リングが同期', '三つの家電のリングが一緒に変わり、生きているように呼応する。'],
        ['ケトル：情報は上面に', 'ケトルは上から見ることが多いので、水量と温度をふたのリングに表示。'],
        ['レンジ：かざして設定', 'スマホの円とつまみの円が対応し、かざすと時間と温度が届く。'],
      ],
      processIcons: ['plug', 'refresh', 'eye', 'phone'],
      outcomes: [
        '三つの家電が同じライトリングを使い、互いの状態が対応する。',
        '各家電は使い方に合わせて情報を置く：ケトルは上面、レンジはスマホをかざす。',
      ],
      image: '/works/portfolio/alive-energy-link/cover-three-appliances.jpg',
      gallery: [],
      modules: [
        { kicker: '出発点 · 電源タップ', title: '色が電力を伝え、絡まった配線でもプラグが見つかる', text: '調査でコンセント使用の問題を11項目整理した（「配線が乱れて対応プラグが見つからない」「どの差込口が電気を使っているか分からない」など）。差込口のリングは電力に応じて色を変える。家庭では低電力の機器が多いため、0〜300 Wで色の変化を細かくした。色によって節電意識も高まり、一番電力を使う機器がひと目で分かる。', points: [
            '配線が乱れても、消費電力から対応するプラグを推測',
            '10秒で休止、振動で起動し、ライト自体の電力を抑える',
            '規格とインターフェースは汎用品に合わせ、無駄を減らす',
          ], images: [
            { src: '/works/portfolio/alive-2023/power-color-ja.svg', alt: '色とパワーの対応', caption: '色とパワーの対応（元の作品集をもとに再描画）', wide: true },
            { src: '/works/portfolio/alive-2023/power-pie.jpg', alt: '家電の電力分布の円グラフ', caption: '家電の電力分布：低電力が多数' },
            { src: '/works/portfolio/alive-2023/strip-sketch-use.jpg', alt: '使い方スケッチ：触れて起動、消費電力でプラグを探す', caption: '使い方スケッチ：触れて起動、消費電力でプラグを探す' },
            { src: '/works/portfolio/alive-2023/strip-exploded.jpg', alt: 'タップ内部の分解図', caption: '内部構造：ライト、ボタンと保護、センサー、制御、電源変換', wide: true },
          ] },
        { kicker: 'システム · 機器の間', title: 'リングが一緒に変わり、家電が「生きて」くる', text: '三つの家電は同じライトリングの言語を共有する。機器が動くと、本体のリングとタップの対応する差込口のリングが同期して変わり、独立した機器同士に連動感が生まれ、生きているように呼応し合う。', images: [
            { src: '/works/portfolio/alive-2023/three-nodes.jpg', alt: '3つの家電がそれぞれ表示する内容', caption: '3つの家電がそれぞれ表示する内容', wide: true },
            { src: '/works/portfolio/alive-2023/ring-sketch.jpg', alt: 'ライトリングの構造スケッチ：上が導光リング、下がLEDベースと駆動部', caption: 'ライトリングの構造スケッチ：上が導光リング、下がLEDベースと駆動部', wide: true },
          ] },
        { kicker: '電気ケトル · 人間工学', title: '人は上から見る。だから情報は上面に', text: 'ケトルは目線より低い台に置かれることが多く、人は上から見下ろす。側面の水位窓は膝と腰を曲げないと見えず負担になる。また人は沸騰で100 ℃を感じられても、他の温度は判断しにくい。そこで水量と温度を蓋のリングに表示し、台座のリングも同期して「通電しているか、沸かしているか」に応える。', images: [
            { src: '/works/portfolio/alive-2023/kettle-top-cyan.jpg', alt: 'ケトル上面のリング', caption: '上面のリングで水量と温度を表示', wide: true },
            { src: '/works/portfolio/alive-2023/kettle-ergonomics.jpg', alt: '側面を見る姿勢と上から見る姿勢', caption: '側面窓はかがむ必要があり、上から見るのが自然' },
            { src: '/works/portfolio/alive-2023/kettle-top-orange.jpg', alt: '加熱中のリング', caption: '加熱中は暖色に' },
          ] },
        { kicker: '電子レンジ · かざして設定', title: 'スマホの円と本体の円が対応する', text: 'スマホで料理カードを選ぶと、カードの円と本体ダイヤルの円が自然に対応し、スマホをかざすよう促す。NFCで時間と温度を一度に送り、ダイヤル外周のプログレスバーが残り時間を示して待つ不安を和らげる。当時は温度の表現とデザイン言語の統一を主に考えていた。「画像で設定する」というアイデアは、後のAI予測画像オーブンへ発展した。', images: [
            { src: '/works/portfolio/alive-2023/oven-phone-render.jpg', alt: 'ダイヤルにスマホをかざす', caption: 'ダイヤルにかざして設定を送る', wide: true },
            { src: '/works/portfolio/alive-2023/oven-knobs-render.jpg', alt: 'ダイヤル外周のプログレスバー', caption: 'ダイヤル外周：進捗と火力', wide: true },
          ] },
      ],
      videos: [
        { src: '/works/portfolio/alive-2023/alive-demo.mp4', poster: '/works/portfolio/alive-2023/alive-demo-poster.jpg', caption: 'C4Dデモ：0:04 電源タップ（電力に応じて点灯、10秒で消灯、ぶつけると起動）→ 0:20 ケトル（ベース、水量と温度、点滅で知らせる）→ 0:48 電子レンジ（時間と火力の設定、進行表示）。元動画は低解像度。' },
      ],
      href: '/works/alive-energy-link',
    },
    {
      id: 'factory-planning',
      title: '鑫豊科技インターン｜BtoBの工場計画とブランドVI',
      type: 'インターン / 空間計画',
      category: 'インターン / BtoB工場計画とブランド',
      year: '2023',
      period: '学部在学中のインターン・鑫豊科技（2023年1〜2月）',
      status: '企業インターンでの制作',
      role: 'インターン：工場の3Dモデリングとレンダリング、ゾーンと動線の表示、ロゴデザインとVIの展開',
      methods: 'C4Dモデリングとレンダリング、Illustrator、VIガイドライン',
      next: '企業インターン · 1・2階のレンダリングと会社ロゴを納品。VIの展開ページはポートフォリオ制作時に追加。',
      description: '建設機械関連の企業でのインターン。3Dレンダリングで工場計画を分かりやすくし、機械設計の担当者とすばやく認識を合わせた。会社ロゴもデザインし、簡潔なVIに展開した。',
      question: 'BtoBの案件では計画をデザイン・エンジニアリング・管理の間で何度も確認し、平面図と文章では伝わりにくく誤解も生じやすい。ブランド面では、以前の「金鑫」マークは社名と一致せず名刺にしか使われず、設備銘板は黒地に白文字だけだった。',
      process: [
        ['レンダリングで合意', '1・2階を3Dにし、機械設計の担当者とゾーンごとに確認。'],
        ['ゾーンと動線', '生産・倉庫・事務エリア、見学動線、防火扉、物流扉を表示。'],
        ['ブランド刷新', '「金鑫」から、「鑫」と「豊」から直接形をとったマークへ。赤は落ち着きを表す。'],
        ['すべての接点で統一', 'マーク・色・書体を図面、資料、銘板、サインに展開。'],
      ],
      processIcons: ['cube', 'route', 'pen', 'layers'],
      outcomes: [
        '平面図と長い説明の代わりに3Dレンダリングを使い、技術者が図を見てすぐ確認や指摘をできるようにした。',
        '名刺にしかなかった「金鑫」から、社名と一致する「鑫豊」へ。生産工場から設備製品のブランドへ向かう一歩として、マスターブランドの下で事業と設備の種類ごとに名前を付け、設備を見ればどの会社のものか分かるようにした。',
      ],
      image: '/works/portfolio/factory-safety-vi/factory-first-floor.jpg',
      gallery: [],
      modules: [
        { kicker: 'BtoBのコミュニケーション · 工場計画', title: '説明の代わりにレンダリングで、機械設計者とすばやく合意', text: '計画はデザイン・エンジニアリング・管理の間で繰り返し確認が必要だった。C4Dで1・2階をモデル化してゾーンと動線を示し、そのレンダリングを使って機械設計の担当者と設備位置や通路をゾーンごとに確認した。平面図と文章よりも問題が一目で指摘でき、やり取りの回数が大きく減った。', points: ['1階：生産、倉庫、部品、サービスエリア', '2階：生産エリア、見学動線、事務所', '防火扉や物流扉など安全に関わる位置を表示'], images: [
            { src: '/works/portfolio/factory-safety-vi/factory-second-floor.jpg', alt: '工場2階の計画レンダリング', caption: '2階：生産エリア、見学動線、事務所', wide: true },
          ] },
        { kicker: 'ブランド刷新 · 「金鑫」から「鑫豊」へ', title: 'マークと社名がようやく一致した', text: '以前は「金鑫」と読める回転する鉤形のマークと、緑地に金文字の名刺を使っていた。社名と一致せず、細い線は銘板サイズでつぶれ、配色も商社や宝飾店のよう。新しいマークは三つの扇形が「鑫」の三つの「金」を表し、下に「丰」を置く。黒みのある赤に墨黒と鋼グレーを合わせ、設備メーカーらしい印象にした。', images: [
            { src: '/works/portfolio/xinfeng/vi-upgrade.jpg', alt: '刷新前後の比較（VIの展開ページはポートフォリオ制作時に追加、以下同）', caption: '刷新前後の比較（VIの展開ページはポートフォリオ制作時に追加、以下同）', wide: true },
            { src: '/works/portfolio/xinfeng/logo-construction.jpg', alt: 'インターン時の作図', caption: '2023年の原稿：モノクロと作図' },
            { src: '/works/portfolio/xinfeng/logo-combination.jpg', alt: 'インターン時の和英組み合わせ', caption: '2023年の原稿：組み合わせと色番号' },
          ] },
        { kicker: 'ブランド計画 · 一つのマスターブランド', title: '先にルールを決め、機械とすべての接点に展開する', stacked: true, text: '原稿にはすでに「鑫豊化工／鑫豊冶金」の組み合わせがあり、それをルールにした。マークは同じで名称だけを替える。設備はカテゴリーで番号を振り（EL 電解、IN 溶解、EX 抽出）、消耗品は周辺に位置づける。同じ電解設備で三段階を比べた：旧マーク、ロゴだけ差し替え、統一した識別。最後の段階で初めて「鑫豊のどの種類の、どの一台か」が分かる。先にルールを決めて一貫させる考え方は、後の製品計画にも生きている。', points: [
            '機体：マークは左上に固定、カテゴリーと型番は右、赤い線で区切る',
            '銘板の資料番号を技術資料の表紙番号と一致させ、機械から説明書と図面をたどれる',
            '用途は三つだけ：設備、銘板と資料、名刺',
          ], images: [
            { src: '/works/portfolio/xinfeng/vi-machine.jpg', alt: '同じ設備の三段階（機体はAI生成のイメージ）', caption: '同じ設備の三段階（機体はAI生成のイメージ）', wide: true },
            { src: '/works/portfolio/xinfeng/vi-brand.jpg', alt: 'マスターブランドと事業', caption: 'マスターブランドと事業' },
            { src: '/works/portfolio/xinfeng/vi-nameplate.jpg', alt: '銘板と技術資料の対応', caption: '銘板と技術資料の対応' },
            { src: '/works/portfolio/xinfeng/vi-card.jpg', alt: '名刺', caption: '名刺' },
          ] },
      ],
      href: '/works/factory-planning',
    },
    {
      id: 'corporate-vi',
      title: '力肯高科 企業VI｜企業イメージデザイン課題',
      type: '授業課題 / 企業識別',
      category: '授業課題 / ロゴ・VI規定',
      year: '2022',
      period: '学部授業・企業イメージデザイン',
      status: '授業の設計課題',
      role: 'ロゴデザイン、標準作図、VIマニュアル編集',
      methods: 'ロゴ作図、標準色・書体の規定、アプリケーション設計',
      next: '授業課題のため実際のブランドでは使用していない。43ページのVIマニュアルが残っている。',
      description: '企業イメージデザインの授業課題。「力肯高科」を対象に、文字中心のロゴを幾何学的なKマークへ展開し、43ページのVIマニュアルにまとめた。',
      question: '企業マークとその展開で、落ち着きと安心感をどう伝えるか？',
      process: [
        ['図形ロゴへの展開', 'Kの字を基に余白と上向きの三角で図形マークを構成し、落ち着いた安心感を表現。'],
        ['VI規定の整備', '43ページのマニュアルでロゴ比率、標準色、書体、和英の組み合わせ、応用場面を規定。'],
      ],
      processIcons: ['pen', 'grid', 'book'],
      outcomes: [
        '文字中心のロゴから図形マークを展開し、企業識別の基本規定と応用を整えた。',
        'ロゴ、標準作図、43ページのVIマニュアルを制作した。',
      ],
      image: '/works/portfolio/factory-safety-vi/vi-cover.jpg',
      gallery: [
        { image: '/works/portfolio/factory-safety-vi/logo-rationale.jpg', alt: '幾何学的なKマークの由来と構成を示すページ', caption: 'ロゴ展開：文字中心の識別から上向きの三角を備えた幾何学Kマークへ。' },
        { image: '/works/portfolio/factory-safety-vi/logo-grid.jpg', alt: '企業ロゴの幾何学的な作図グリッド', caption: 'ロゴの標準化：比率とグリッドで再現性を確保。' },
        { image: '/works/portfolio/factory-safety-vi/logo-combinations.jpg', alt: '企業ロゴの中国語・英語の組み合わせ', caption: 'ロゴの組み合わせ：中国語・英語の名称と図形マークの組み合わせ。' },
      ],
      href: '/works/corporate-vi',
    },
    {
      id: 'fridge-timeline',
      title: 'Fridge Timeline System',
      type: 'プロダクトシステム / 食材管理',
      category: 'プロダクトシステム / 食材管理',
      year: '2022-2023',
      period: '学部卒業制作・プロダクトシステム',
      status: '大学卒業制作',
      role: '個人制作：市場調査、課題定義、行動フロー、造形とCMF、ライトのインタラクション、C4Dアニメーション、1/4ライトモデル',
      methods: '冷蔵庫10機種の調査、行動フロー分析、人体寸法による検討、C4Dモデリングとアニメーション、1/4ライトモデル',
      next: '学部卒業制作 · C4Dの流れアニメーションと1/4ライトモデルを制作。ラベル印刷は未実装、認識精度と実際の使用は未検証。',
      description: '食材が家に入ってから冷蔵庫に収まるまでをつなぐ：冷蔵庫横の台で整理しながらスキャンし、ライトがどこに入れるか、後でどこから取るかを順に示す。',
      question: '忙しい2〜3人の家庭では、買い物袋ごと冷蔵庫に押し込みがち。物が増えると見つからず、隅の物ほど忘れられ、期限切れで捨てることになる。調べた市販の冷蔵庫10機種はゾーン分けやアプリがあるものの、登録が面倒で、物をすぐ見つける助けにはならない。',
      process: [
        ['テーブルでスキャン', '食材を整理するテーブルで一つずつスキャンし、冷蔵庫に入れる前に登録する。'],
        ['受取番号式の秩序', '種類で段を分け、同じ段では新しい物を右へ。位置を覚えなくてよい。'],
        ['2段階のライト誘導', '扉のライトがどの扉かを、庫内のライトがどの位置かを示す。'],
        ['スマホで確認・取り出し', 'スマホで食材と日付を探すと、その位置が光る。'],
      ],
      processIcons: ['camera', 'pin', 'light', 'phone'],
      outcomes: [
        '帰宅後にテーブルで整理するときに登録し、冷蔵庫に入れてから認識するのを待たない。',
        '効率の核は秩序。「新しい物は右、古い物は左」という一つの規則と2段階のライトで、物の位置を覚えなくてよくなる。',
      ],
      image: '/works/portfolio/fridge-timeline-system.png',
      gallery: [
        { image: '/works/portfolio/fridge-2023/render-kitchen.jpg', alt: 'キッチンの冷蔵庫レンダリング', caption: '2023年のレンダリング：調理台のすぐ横に置く' },
        { image: '/works/portfolio/fridge-2023/render-cmf.jpg', alt: '4つの配色', caption: 'CMF：本体4色' },
        { image: '/works/portfolio/generated/fridge-story-triptych.png', alt: 'AIによる利用シーンの再制作', caption: '2026年にAIで再制作した利用シーン（元のデザインではない）' },
      ],
      videos: [
        { src: '/works/portfolio/fridge-2023/flow-demo.mp4', poster: '/works/portfolio/fridge-2023/flow-demo-poster.jpg', caption: 'C4Dの流れアニメーション（2023）：スキャナーを外す → 卓上でスキャン → 庫内ライト誘導 → ドアの斜めのライト。' },
        { src: '/works/portfolio/fridge-2023/scan-view.mp4', poster: '/works/portfolio/fridge-2023/scan-view-poster.jpg', caption: 'スキャン視点：食材を一つずつスキャン範囲に置く。' },
      ],
      research: { sample: '市販の冷蔵庫10機種（サムスン、ハイアール、シャオミ、美的、コンカ、オークス、志高、カサーテ、ダミエル、雲米）を調べ、6つの問題を整理した。そのうち3つが設計の方向を決めた。', metrics: [], decisions: [
          ['区分けは整理を助けない', '多くの冷蔵庫に区分けはあるが、整頓を手伝ってはくれない → 決まった位置とライトで誘導。'],
          ['アプリの登録が分かりにくい', 'スマートアプリはあるが、登録と管理が分かりにくい → 登録を卓上スキャンへ移す。'],
          ['物が多いと見つからない', '収納した物をすぐ見つける手段がない → ドア外と庫内の二段階ライトで位置を示す。'],
        ], limitation: '学部卒業制作 · C4Dの流れアニメーションと1/4ライトモデルを制作。ラベル印刷は未実装、認識精度と実際の使用は未検証。' },
      comparison: { title: '近年のAI冷蔵庫との比較', intro: '2024年以降、サムスンやカサーテなどがカメラで食材を認識する冷蔵庫を発売している。本設計は2023年に完成し、「位置と日付を覚える」という目標は近いが、切り口が異なる：冷蔵庫に入れる前の卓上整理の段階で認識し、ライトで置き場所を導く。', columns: ['本設計（2023 学部卒業制作）', 'カサーテ AI冷蔵庫（2025–2026 公開情報）'], rows: [
          ['認識のタイミング', '入れる前に、卓上で一つずつスキャン', '入れる時に「AIの眼」が自動認識'],
          ['認識方法', 'バーコード＋画像認識（構想）', '2025年発表時は210種類以上、2026年の報道では2000種類以上'],
          ['位置の誘導', 'ドアの斜めのライト＋庫内の段ライトで二段階に誘導', '公開情報では言及なし'],
          ['日付の管理', 'スマホのリストと期限通知', '期限通知を自動送信、デバイス間で同期'],
          ['スマホなしの場合', 'ラベルを印刷して食材に貼る（構想、未実装）', '—'],
          ['完成度', 'C4Dアニメーション＋1/4ライトモデル', '量産製品'],
        ], sources: [
          ['极客公园 2025-06-26', 'https://www.geekpark.net/news/350884'],
          [
            '中国网 2026-08-21',
            'https://mtz.china.com/touzi/2026/0821/260650.html',
          ],
          [
            'Tom’s Guide 2024-01-04（サムスン AI Vision Inside）',
            'https://www.tomsguide.com/news/samsung-unveils-2024-bespoke-family-hub-refrigerator-with-vision-ai-heres-what-it-can-do',
          ],
        ] },
      modules: [
        { kicker: '着眼点 · テーブルでのスキャン', title: '冷蔵庫の前ではなく、テーブルで登録する', text: '袋を開けて仕分けるのは冷蔵庫の前ではなくキッチンのテーブル。そこが登録にいちばん合う瞬間だ。そこでスキャナーを独立した付属品にした。普段は扉の画面の横に磁石で付いて充電し、使うときは外してテーブルへ。一つずつスキャンしてから、まとめて冷蔵庫に入れる。', points: [
            '赤外線コード読み取り＋画像認識。ラベル印刷は構想のみで未実装',
            '円柱形から角柱形へ。可動部が一つ減り、冷蔵庫にも磁石で戻しやすい',
            '輪郭のライトが「動作中」とスキャン範囲を同時に示す',
          ], images: [
            { src: '/works/portfolio/fridge-2023/behavior-flow-ja.svg', alt: '入れる・取り出す行動フロー', caption: '行動フロー（卒業制作をもとに再構成）', wide: true },
            { src: '/works/portfolio/fridge-2023/render-scan-beam.jpg', alt: 'テーブルにスキャン範囲を投影するスキャナー', caption: 'テーブルに置いてスキャン範囲を投影' },
            { src: '/works/portfolio/fridge-2023/thesis-scanner-sketch.jpg', alt: 'スキャナーの形態スケッチ', caption: '形態検討：円柱から角柱へ' },
            { src: '/works/portfolio/fridge-2023/model-scanner.jpg', alt: 'スキャナーの模型', caption: 'スキャナーの模型' },
          ], stacked: true },
        { kicker: '秩序 · 宅配便の受取番号から', title: '新しい物は右、古い物は左', text: '宅配便の拠点では 27-5-3002（棚・段・日付・番号）のような番号で、数千個の荷物から一つを見つける。冷蔵庫の物はずっと少ないが、同じ秩序が要る。種類で段を分け、同じ段では入れた順に左から右へ並べる。位置は覚えられなくても、規則一つなら覚えられる。', points: [
            '手間のかけ方で2つの収納：シンプル版は袋ごと大きな箱に入れ、日付順に箱ごと左へ寄せる。細分版は一つずつ詰め替えてラベルを貼る',
            'いちばん左が最も古い物。まずそれから食べる',
          ], images: [
            { src: '/works/portfolio/fridge-2023/order-rule-ja.svg', alt: '受取番号の規則と冷蔵庫内の並べ方', caption: '受取番号 → 冷蔵庫内の並べ方（再作図）', wide: true },
            { src: '/works/portfolio/fridge-2023/midterm-concept.jpg', alt: '中間発表：コンセプトの出発点', caption: '中間発表：宅配の倉庫管理 → スマート管理 → ライト誘導' },
            { src: '/works/portfolio/fridge-2023/midterm-courier-analogy.jpg', alt: '宅配のスキャン登録', caption: '参考：宅配のスキャン登録とラベル' },
          ], stacked: true },
        { kicker: 'ライト · 2段階の誘導', title: '扉の外で場所を、扉の中で位置を示す', text: '位置が決まると、まず該当する扉のライトが点く。ライトは隠し取っ手に沿い、形で開ける向きを示す。扉を開けると該当する段のライトが点く。取り出しも同じで、スマホか扉の画面で食材を「取り出す」へドラッグすると、その扉のライトが点滅する。', points: [
            '取っ手の範囲は中国人成人女性5パーセンタイルから男性95パーセンタイルまでの手を上げた高さで決めた',
            '画面の高さは立位の目の高さと操作距離40 cmから算出',
            '扉の画面はスマホの補助に徹する。待機画面は針を回してタイマーを設定できる時計',
          ], images: [
            { src: '/works/portfolio/fridge-2023/render-fridge.jpg', alt: '取っ手横の角形ライト', caption: '扉の外：取っ手横の角形ライト', wide: true },
            { src: '/works/portfolio/fridge-2023/render-interior-sequence.jpg', alt: '段ごとに点灯する庫内ライト', caption: '扉の中：該当する段が点灯し、入れると消える' },
            { src: '/works/portfolio/fridge-2023/thesis-ergonomics-sketch.jpg', alt: '手を上げた高さと取っ手位置のスケッチ', caption: '手を上げた高さと取っ手の範囲' },
          ] },
        { kicker: '試作 · 1/4ライトモデル', title: '誘導が実際に光るモデル', text: 'PVC板で1/4の本体と扉をつくり、扉の溝に5 VのLEDテープを埋め込んだ。背面のブレッドボードとスイッチで1本ずつ点灯でき、2段階の誘導がどこにどう見えるかを示す。', points: ['実施：C4Dの流れアニメーション＋1/4の実物模型', '未実施：認識精度とユーザーテスト'], images: [
            { src: '/works/portfolio/fridge-2023/model-full.jpg', alt: '1/4冷蔵庫模型とスキャナー', caption: '本体とスキャナー' },
            { src: '/works/portfolio/fridge-2023/model-lit.jpg', alt: '扉のライトが点灯', caption: '扉のライトを1本ずつ点灯' },
            { src: '/works/portfolio/fridge-2023/model-interior.jpg', alt: '模型内部のライト', caption: '庫内の段のライト' },
            { src: '/works/portfolio/fridge-2023/model-wiring.jpg', alt: '背面の配線', caption: '背面の配線、1本ずつスイッチで制御' },
          ] },
      ],
      href: '/works/fridge-timeline',
    },
  ],
  zh: [
    {
      id: 'co-creative-ai-training',
      title: '引导用户输入独特判断的 AI 共创界面',
      type: 'AI 交互 / 硕士研究',
      category: 'AI 交互 / 硕士研究',
      year: '2025-2026',
      period: '研究生阶段 · 人机交互与 AI 体验',
      status: '硕士研究进行中',
      role: '独立完成：交互概念、界面设计、确认与补充机制、评价方案',
      methods: 'AI 对话文本分析、主观评价、比较界面与眼动（计划）',
      next: '硕士研究进行中 · 正在准备界面比较与眼动实验。',
      description: '每个人对“高级感”这类词的理解都不一样，AI 却按大众理解来生成，两边的理解有隔阂。界面先把 AI 的理解摆出来，引导用户输入自己独特的判断，AI 再据此调整，共创的结果更接近本人想要的。',
      question: '用户输入“高级感”“温馨”等感性词，AI 往往按大众理解生成，结果趋于平庸；用户也看不到 AI 是怎么理解的，无从纠正。',
      process: [
        ['显示 AI 的理解', '在回答旁列出 AI 对感性词的常规解释，哪里理解得不一样，一眼就能看出来。'],
        ['确认或补充', '提供“是我的意思 / 不是，我想要…”入口，引导用户补充自己的标准。'],
        ['调整回应', 'AI 根据补充改变提案、解释和追问方式。'],
      ],
      processIcons: ['eye', 'message', 'refresh', 'check'],
      outcomes: [
        '用户把自己独特的理解补进来，个人理解和 AI 通用理解之间的隔阂变小。',
        'AI 的常规理解与个人标准同时可见，误解可以被及时纠正。',
        '计划用比较界面和眼动测试，看用户到底有没有注意到这些提示。',
      ],
      image: '/works/portfolio/ai-understanding-confirmation-zh.svg',
      gallery: [
        { image: '/works/portfolio/generated/ai-cocreation-chat-v2.png', alt: '早期方案的对话界面', caption: '早期方案：用户在“AI 判断 / 共同协商 / 自己判断”三种模式间选择。现方案改为先显示 AI 的理解，再由用户确认或补充。', wide: true },
        { image: '/works/portfolio/generated/ai-story-triptych.png', alt: '早期方案使用场景', caption: '早期方案的使用场景（AI 生成示意）：从草图、判断分配到调整提案。', wide: true },
        { image: '/works/portfolio/generated/ai-cocreation-overlay.png', alt: '早期方案的判断角色', caption: '早期方案的三种判断角色（AI 生成示意）。' },
      ],
      href: '/works/ai-judgement',
    },
    {
      id: 'transparent-driving-hud',
      title: '让驾驶者继续看路的辅助驾驶 HMI',
      type: '智能驾驶 / HMI 概念',
      category: '智能驾驶 / HMI 概念',
      year: '2025-2026',
      period: '研究生阶段 · 智能驾驶 HMI',
      status: 'HMI 概念方案',
      role: '独立完成：驾驶场景分析、HMI 概念、提示分级与文案、评价方案设计',
      methods: '驾驶场景拆解、提示强度比较、国内法规与标准梳理、主观评价（计划）',
      next: 'HMI 概念阶段 · 已梳理国内相关法规与取舍（依据公开发布与解读）；主观评价问卷准备中。',
      description: '辅助驾驶时，只标出 AI 正在担心的那一个对象，并用一句话说明原因：驾驶者不用读一堆数据，也会继续留意路面。',
      question: '辅助驾驶越稳定，驾驶者越容易放松观察；系统只显示距离、速度等参数，人不知道它“在担心什么”，风险出现时难以及时理解。',
      process: [
        ['只标一个对象', '按风险优先级，只高亮当前最需要注意的儿童、邻车等对象。'],
        ['说明担心什么', '用简短语句说明原因，例如“小朋友可能突然冲出”。'],
        ['按风险调强度', '低风险用轻提示维持注意，高风险只保留明确、标准化的警示。'],
        ['对照法规取舍', '调查国内现行辅助驾驶相关法规与标准，判断哪些提示可以做、哪些必须让位给标准化警示。'],
      ],
      processIcons: ['target', 'message', 'alert', 'check'],
      outcomes: [
        '驾驶者看到的是 AI 在担心哪个对象、为什么，而不只是距离和车速。',
        '提示跟着具体对象走，按风险分轻重，尽量不打扰；法规要求的监测和报警照常工作，这些提示只是补充。',
      ],
      image: '/works/portfolio/generated/hmi-risk-overlay.png',
      gallery: [
        { image: '/works/portfolio/generated/hmi-story-triptych.png', alt: '提示强度三连图', caption: '三种强度（AI 生成示意）：低风险轻提示、中风险标出对象、高风险明确警示。', wide: true },
        { image: '/works/portfolio/generated/hmi-attention-hero.png', alt: '驾驶视角示意', caption: '驾驶视角（AI 生成示意）：只标出 AI 当前最在意的对象，不让风挡被信息占满。' },
      ],
      comparison: { title: '国内法规与取舍', intro: '这类提示要上车，先要过国内法规这一关。下面按与本方案相关的三项整理：法规管的是“驾驶员必须盯路、系统必须提醒、风挡上能放什么”，本方案只在这些边界之内做补充。依据为公开发布与解读，未逐条核对标准原文。', columns: ['法规要求（摘要）', '本方案的取舍'], rows: [
          [
            'GB 47955—2026 组合驾驶辅助系统安全要求（强制，2027.1.1 实施）',
            '驾驶员须持续观察交通并控制车辆；系统须检测脱手和视线脱离，按“监测—提醒—限制”逐级响应，并对功能边界做用户告知。',
            '提示定位为“维持注意”的补充，不替代法规要求的脱手、视线报警；进入高风险时让位给标准化警示，不加情感化文案。',
          ],
          [
            '工信部、市场监管总局《关于进一步加强智能网联汽车产品准入、召回及软件在线升级管理的通知》（2025.4）',
            '明确系统功能边界和安全响应措施，严格履行告知义务，不得夸大和虚假宣传。',
            '文案只说“AI 在担心什么”，不说“已处理”“请放心”，也不暗示系统能接管；措辞避免“自动驾驶”。',
          ],
          [
            'GB/T 46926—2025 轻型汽车视野辅助系统技术要求及试验方法',
            '前方视野透明区域内的显示分区管理：上部区域只允许非静态信息，不透明像素占比不超过 50%；AR 叠加须与真实环境对准。',
            '只标一个对象，用描边而不是实心色块；说明文字放在下部区域、短暂出现；对象框必须跟准真实目标，否则不显示。',
          ],
        ], sources: [
          [
            '工信部 · GB 47955—2026 发布',
            'https://www.miit.gov.cn/jgsj/zbys/qcgy/art/2026/art_7bcb480b0db5432f8542157a9fc12841.html',
          ],
          [
            '搜狐汽车 · GB 47955 解读',
            'https://www.sohu.com/a/1090745157_120325502',
          ],
          ['第一财经 2025-04-17', 'https://www.yicai.com/news/102575851.html'],
          [
            '腾讯新闻 · GB/T 46926—2025 解读',
            'https://news.qq.com/rain/a/20260130A01RUQ00',
          ],
        ] },
      href: '/works/driving-attention',
    },
    {
      id: 'frametrace',
      title: 'FrameTrace',
      type: 'MR 眼镜 / 跨时间摄影',
      category: 'MR 眼镜 / 跨时间摄影',
      year: '2025-2026',
      period: '研究生阶段 · 空间交互与 MR',
      status: 'Quest 3 原型进行中',
      role: '独立完成：调研、空间 UX、MR 交互、Quest 3 原型',
      methods: '106 份概念问卷、场景设计、Quest 3 原型',
      next: 'Quest 3 原型开发中 · 尚未进行实地行为测试。',
      description: 'MR 跨时间摄影，两个方向：一是体验别人在同一地点的机位、取景方向和姿势，走过去对齐构图；二是用双手手势实现类似取景器的功能，框出画面并获得焦距建议。',
      question: '到了景点，多数人在入口拍一张全景就离开；看到好照片，也不知道“站在哪、朝哪拍、用多少焦距”。',
      process: [
        ['看见机位', '在现场显示他人拍摄时的位置、镜头方向与姿势虚影。'],
        ['串联路线', '把多个拍摄点连成路线，引导继续寻找角度。'],
        ['手势取景器', '不用另拿取景器，双手比出画框即可预览构图，系统推荐焦距。'],
        ['对齐拍摄', '在原机位对齐构图完成拍摄，留下自己的痕迹。'],
      ],
      processIcons: ['eye', 'route', 'frame', 'camera'],
      outcomes: [
        '看到一张好照片，可以走到当时的机位，对齐后拍出自己的一张。',
        '106 份概念问卷（主分析 N=82）：整体第一印象 5.65/7，公共机位复现最受关注。',
        '隐私、推荐理由和行走安全是下一版原型的重点。',
      ],
      image: '/works/portfolio/frametrace-grid-4.jpg',
      href: '/works/frametrace',
    },
    {
      id: 'taste-again',
      title: '好久没吃',
      type: '微信小程序 / 个人饮食周期',
      category: '微信小程序 / 个人饮食周期',
      year: '2025-2026',
      period: '研究生阶段 · 产品体验与小程序',
      status: '微信小程序 MVP 已上线',
      role: '独立完成：需求定义、调研、UX/UI，借助 AI 开发工具实现并上线',
      methods: '57 人概念问卷、行为流程设计、微信小程序开发',
      next: '已上线 MVP · 尚未开展用户测试与使用数据分析。',
      description: '记下每种食物上次是什么时候吃的，再给它设一个自己的周期。记录攒久了随时能查，纠结今天吃什么时，能把好久没吃的味道找回来。已上线微信小程序。',
      question: '决定吃什么时，人往往只想得起最近吃过的几样，喜欢的味道就这样被遗忘；而每种食物多久想吃一次因人而异，统一的提醒并不适用。',
      process: [
        ['一键记录', '吃过就记一笔，自动算出“距上次多少天”。'],
        ['设定个人周期', '为不同食物设定自己的节奏：有的一周一次，有的每天都行。'],
        ['到期浮现', '到了周期的食物排到前面，成为“今天可以吃”的候选。'],
        ['选择留给用户', '只给参考不替人决定，吃完再记录，形成循环。'],
      ],
      processIcons: ['edit', 'calendar', 'list', 'check'],
      outcomes: [
        '“好久没吃”有了具体天数，还能和自己的周期对照；记录越攒越多，随时能查。',
        '咖啡可以天天喝，有的店一周去一次，周期各自设定，不用统一提醒。',
        '57 人概念问卷后，借助 AI 开发工具完成小程序并上线。',
      ],
      image: '/works/portfolio/haojiu-meichi-cover-upscaled.png',
      href: '/works/taste-again',
    },
    {
      id: 'smart-oven-timing',
      title: 'AI 预测图像烤箱：看着成品图调时间和温度',
      type: '智能家电交互 / PS 界面概念',
      category: '烤箱交互 / 时间选择与状态预览',
      year: '2024-2025',
      period: '本科毕业后 · AI 家电交互探索',
      status: '概念方案 + 66 人调研 · 日本感性工学会发表',
      role: '独立完成：概念提出、界面设计、AI 图像生成、问卷设计与分析',
      methods: '感觉的视觉化（颜色 / 形状 / 软硬）、AI 图像生成、PS 界面原型、三轮问卷设计、66 人概念调研',
      next: '概念与问卷阶段 · 预测准确性、高温腔内摄像和实际烤制效果都还没有用真实设备测试。',
      description: '烤箱侧边是一块图像屏：按当前设定的时间、温度和干燥度，实时生成烤好后的样子。用户边调边看，凭直觉判断“就是这个”，机器随之得到合适的参数。',
      question: '烤箱要用时间和温度来设定，但人心里想的是“外皮金黄、里面松软”这样的结果。新手很难把想要的口感换算成参数，只能反复试错。',
      process: [
        ['边调边看', '调时间、温度、干燥度，旁边的预想图实时变化。'],
        ['凭直觉确认', '看到想要的样子就开始烤，参数由机器记下。'],
        ['腔内监控', '烤制中摄像头对照预想图，接近目标就调整或停止。'],
        ['实验室数据', '预想图来自企业大量烤制数据学成的时间轴。'],
      ],
      processIcons: ['sliders', 'eye', 'camera', 'layers'],
      outcomes: [
        '用户只管挑想要的样子，时间和温度由机器换算。',
        '一年里换了几次方向，最后落在一个企业能为单款产品做的方案上，并写清了它的风险。',
      ],
      research: { sample: '66 人线上问卷（男 23、女 43，26–35 岁约占一半）：看过操作说明图后评价新方式，并与旋钮、按键比较。约 70% 表示基本看懂了操作。', metrics: [], charts: [
          { title: '认为新方式的好处（可多选）', unit: '人', total: 66, bars: [
              [
                '减少试错',
                43,
                true,
              ],
              [
                '新手更少失败',
                32,
              ],
            ], note: '好处集中在“少走弯路”。' },
          { title: '认为的主要不足（可多选）', unit: '人', total: 66, bars: [
              [
                '需要适应新界面',
                37,
                true,
              ],
              [
                '操作可能更复杂',
                32,
              ],
              [
                '希望说明推荐依据',
                25,
              ],
            ], note: '下一版重点：降低学习成本、说明推荐理由。' },
          { title: '更习惯的调整方向', unit: '人', total: 66, bars: [
              [
                '先选图像，再定参数',
                38,
                true,
              ],
              [
                '先调参数，再看图像',
                28,
              ],
            ], note: '多数人更愿意从“想要的样子”出发。' },
          { title: '最终会选择的设定方式', unit: '人', total: 66, bars: [
              [
                '传统旋钮',
                25,
              ],
              [
                '图标模式',
                19,
              ],
              [
                'AI 预测图像',
                18,
                true,
              ],
              [
                '视情况而定',
                4,
              ],
            ], note: '预测图像还不是首选。' },
        ], decisions: [
          ['说清双向调节', '让人看懂改图像如何改变参数，改参数又如何改变图像。'],
          ['补充推荐理由', '66 人中有 25 人希望知道 AI 为什么这样推荐。'],
          ['降低学习成本', '最终选择没有偏向新方式，新操作要更容易上手。'],
        ], limitation: '概念与问卷阶段 · 66 人调研反映的是理解与偏好；预测准确性、高温腔内摄像和实际烤制效果还没有用真实设备测试。' },
      image: '/works/portfolio/oven-state-timing/cover-ai-oven.jpg',
      gallery: [],
      modules: [
        { kicker: '试错 · 一年里换了几次方向', title: '从“用图像设定”到“看着图调参数”', stacked: true, text: '起点是 2023 年 ALIVE 的微波炉：手机上的图像卡片贴到旋钮上传参数。之后先试着把味道、温度、触感翻译成颜色、形状和软硬，也走过“给做菜过程打分”的岔路，最后收回到一件事：让人看着成品图来设定烤箱。问卷前后改了三轮。', images: [
            { src: '/works/portfolio/oven-state-timing/iteration-timeline-zh.svg', alt: 'AI 烤箱方案的迭代时间线', caption: '迭代时间线（根据各次报告整理）', wide: true },
            { src: '/works/portfolio/oven-state-timing/slide-texture-color.jpg', alt: '温度与触感的视觉表现', caption: '2024.11：温暖、冰凉、酥脆分别对应什么颜色和纹理' },
            { src: '/works/portfolio/oven-state-timing/slide-taste-shape.jpg', alt: '五味的形状与颜色', caption: '2024.11：五种味道的形状与颜色' },
            { src: '/works/portfolio/oven-state-timing/sim-test-plan.jpg', alt: '模拟实验方案', caption: '模拟实验方案：在虚拟微波炉上比较 4 种信息显示' },
          ] },
        { kicker: '交互 · 边调边看', title: '人凭直觉判断，机器记下参数', text: '图像屏上方是预想图，下方是温度和时间。调参数，图跟着变；反过来点“火候”“硬度”“焦色”等特征再按 + / −，参数自动换算。干燥度这类感觉也做成可调的进度条。看到想要的样子，按开始。', points: ['AI 同时给出几种结果：柔软到硬、白到焦，每种都带时间和温度', '双向调节：从图到参数，或从参数到图'], images: [
            { src: '/works/portfolio/oven-state-timing/screen-features.jpg', alt: '预想图界面：特征切换与温度时间', caption: '点特征切换，+ / − 调整，温度时间随之变化' },
            { src: '/works/portfolio/oven-state-timing/state-grid.jpg', alt: 'AI 生成的多种烤制结果', caption: '一次生成多种结果，各自对应时间与温度' },
          ], stacked: true },
        { kicker: '一体机 · 腔内监控', title: '烤的时候，用摄像头对照预想图', text: '放进生面团，腔内摄像头自动拍下食材，生成预想图。烤制中继续拍摄，和预想图对照，快到目标就调整或停止，而不是只按设定时间走完。高温下的腔内摄像有难度，但并非做不到。', images: [
            { src: '/works/portfolio/oven-state-timing/original-state-options.png', alt: '放入食材、自动拍摄、生成预想图的步骤', caption: '放入 → 自动拍摄 → 生成预想图与推荐参数', wide: true },
            { src: '/works/portfolio/oven-state-timing/ai-prediction-interface.jpg', alt: '带预想图屏的烤箱概念图', caption: '一体机概念（AI 生成示意）' },
            { src: '/works/portfolio/oven-state-timing/bake-sequence.jpg', alt: '面包从生到熟的预想序列', caption: '从生到熟的预想序列（AI 生成）' },
          ] },
        { kicker: '数据 · 实验室烤制记录', title: '把烤制过程学成一条时间轴', text: '预想图不是凭空画的：设想由企业在实验室里大量烤制，记录不同时间、温度下食材的形状和颜色，让模型学成一条连续变化的图像时间轴。用户调参数，就是在这条轴上移动。', points: ['研究阶段先用 AI 生成图模拟，下一步计划用 3D 建模做可控的生 / 熟面包'], images: [
            { src: '/works/portfolio/oven-state-timing/data-pipeline-zh.svg', alt: '实验室数据到图像时间轴', caption: '数据 → 图像时间轴 → 用户设定', wide: true },
          ], stacked: true },
      ],
      href: '/works/oven-state-timing',
    },
    {
      id: 'alive-energy-link',
      title: 'ALIVE｜以灯环串联的智能家电系统',
      type: '工业设计 / 智能家电系统',
      category: '工业设计 / 产品系统',
      year: '2023-2024',
      period: '本科毕业后独立作品 · 智能家电系统',
      status: '工业设计概念方案',
      role: '独立完成：产品定义、调研、造型与 CMF、灯环交互、C4D 建模与渲染',
      methods: '插座使用问题梳理、家电功率分布调研、人机工程分析、C4D 建模与动画',
      next: '工业设计概念 · 完成渲染、结构表达与灯环动画，未制作功能样机。',
      description: '从插排出发，用一圈灯环把插排、热水壶和微波炉连起来：灯的颜色表示功耗，几台机器的灯环同步变化，有一种“活着”的联动感。',
      question: '插排上插头挤成一团，想拔掉某台电器却找不到对应的那根线；家里谁是耗电大头也看不见。各个家电各自闪着不同的指示灯，彼此毫无关系。',
      process: [
        ['插排：颜色说出功耗', '按功耗变色，乱线里找到插头；闲置熄灯、碰一下唤醒。'],
        ['机器之间：灯环同步', '机器运行时，机身和插排上对应插孔的灯环同步变化。'],
        ['热水壶：信息在顶面', '人多从上往下看，水量和温度放在顶盖灯环上。'],
        ['微波炉：贴一贴设定', '手机上的圆对应旋钮的圆，贴上即传时间和温度。'],
      ],
      processIcons: ['plug', 'refresh', 'eye', 'phone'],
      outcomes: ['三件家电用同一种灯环，彼此的状态能对得上。', '每件家电再按自己的使用方式放置信息：热水壶看顶面，微波炉贴手机。'],
      image: '/works/portfolio/alive-energy-link/cover-three-appliances.jpg',
      gallery: [],
      modules: [
        { kicker: '起点 · 智能插排', title: '颜色说出功耗，在乱线里找到插头', text: '调研归纳了 11 个插座使用问题，例如“线乱了找不到对应插头”“看不出哪个插孔在用电”。插孔灯环按功率变色：家里低功率电器更多，所以 0–300 W 区间的颜色变化更密集，方便区分。顺带也能一眼看出谁是耗电大头。', points: ['线材混乱时，按功耗推断对应插头', '闲置 10 秒休眠，震动唤醒，减少灯本身的耗电', '规格和接口沿用通用标准，减少浪费'], images: [
            { src: '/works/portfolio/alive-2023/power-color-zh.svg', alt: '颜色与功率的对应', caption: '颜色与功率的对应（据原作品集重绘）', wide: true },
            { src: '/works/portfolio/alive-2023/power-pie.jpg', alt: '家用电器功率分布饼图', caption: '家用电器按功率分布：低功率占多数' },
            { src: '/works/portfolio/alive-2023/strip-sketch-use.jpg', alt: '使用方式草图：贴近唤醒、按功耗找插头', caption: '使用方式草图：贴近唤醒、按功耗找插头' },
            { src: '/works/portfolio/alive-2023/strip-exploded.jpg', alt: '插排内部结构拆解', caption: '内部结构：灯光、按键与保护、传感、控制与电源转换', wide: true },
          ] },
        { kicker: '系统 · 机器之间', title: '灯环一起变化，让家电“活”起来', text: '三件家电共用同一种灯环。设备运行时，机身灯环与插排上对应插孔的灯环同步变化，原本各管各的机器就有了联动感，像是活的。', images: [
            { src: '/works/portfolio/alive-2023/three-nodes.jpg', alt: '三个家电节点各自显示的内容', caption: '三个家电节点各自显示的内容', wide: true },
            { src: '/works/portfolio/alive-2023/ring-sketch.jpg', alt: '灯环结构草图：上层导光环，下层 LED 底环与驱动', caption: '灯环结构草图：上层导光环，下层 LED 底环与驱动', wide: true },
          ] },
        { kicker: '热水壶 · 人机工程', title: '人是从上往下看的，所以信息放在顶面', text: '热水壶大多放在低于视线的台面上，人通常从上往下看。侧面的水位窗要弯腰屈膝才看得清，对膝盖和腰都是负担；而人只能凭沸腾感知 100 ℃，其他温度很难判断。所以把水量和温度都放到顶盖的灯环上；底座灯环同步变色，回应“通电了没有、是不是在烧”。', images: [
            { src: '/works/portfolio/alive-2023/kettle-top-cyan.jpg', alt: '热水壶顶面灯环', caption: '顶面灯环显示水量与温度', wide: true },
            { src: '/works/portfolio/alive-2023/kettle-ergonomics.jpg', alt: '侧面看与从上看的姿势对比', caption: '侧窗需要弯腰屈膝，从上看更自然' },
            { src: '/works/portfolio/alive-2023/kettle-top-orange.jpg', alt: '加热中的顶面灯环', caption: '加热时灯环变暖色' },
          ] },
        { kicker: '微波炉 · 贴一贴设定', title: '手机上的圆，对应机身上的圆', text: '在手机上选好料理卡片，卡片里的圆形与机身旋钮的圆形自然对应，暗示用户把手机贴上去，通过 NFC 一次传好时间和温度；旋钮外圈的进度条显示剩余时间，减少等待的不安。当时主要考虑的是温度表达和设计语言的统一；“用图像来设定”这个想法，后来延伸成了 AI 预测图像烤箱。', images: [
            { src: '/works/portfolio/alive-2023/oven-phone-render.jpg', alt: '手机贴在旋钮上传输设定', caption: '手机贴上旋钮，一次传好时间和温度', wide: true },
            { src: '/works/portfolio/alive-2023/oven-knobs-render.jpg', alt: '旋钮外圈进度条', caption: '旋钮外圈：进度与火力', wide: true },
          ] },
      ],
      videos: [
        { src: '/works/portfolio/alive-2023/alive-demo.mp4', poster: '/works/portfolio/alive-2023/alive-demo-poster.jpg', caption: 'C4D 演示动画：0:04 插排（按功率亮灯、10 秒熄灭、碰一下唤醒）→ 0:20 热水壶（底座、容量与温度、闪烁提示）→ 0:48 微波炉（设定时间与火力、进度显示）。原片分辨率较低。' },
      ],
      href: '/works/alive-energy-link',
    },
    {
      id: 'factory-planning',
      title: '鑫丰科技实习｜B 端厂区规划与品牌 VI',
      type: '企业实习 / 空间规划',
      category: '企业实习 / B 端厂区规划与品牌',
      year: '2023',
      period: '本科期间实习 · 鑫丰科技（2023.01–02）',
      status: '企业实习项目',
      role: '实习：厂区三维建模与效果图、分区与动线标注、Logo 设计与 VI 延展',
      methods: 'C4D 建模与渲染、Illustrator、VI 规范',
      next: '企业实习 · 交付一、二层效果图与公司 Logo；VI 应用页为作品集整理时的延展。',
      description: '在一家工程机械相关企业实习：用三维效果图把厂区规划讲清楚，和机械设计人员快速对齐；同时设计公司 Logo，并延展成一套精简 VI。',
      question: 'B 端项目里，规划方案要在设计、工程和管理之间反复确认，平面图加文字说明不直观，沟通慢、容易误解。品牌上，公司原来用的“金鑫”标志和公司名对不上，只出现在名片上，设备铭牌只有黑底白字。',
      process: [
        ['快速出图对齐', '先把一、二层做成三维效果图，再和机械设计人员逐区确认。'],
        ['分区与动线', '标出生产、仓储、办公区，以及参观动线、消防门和物流门。'],
        ['品牌升级', '从“金鑫”换成直接取形于“鑫”“丰”的标志，红色取其沉稳。'],
        ['统一到每个触点', '把标志、色彩和字体落到图纸、文件、铭牌和导视上。'],
      ],
      processIcons: ['cube', 'route', 'pen', 'layers'],
      outcomes: [
        '用三维效果图代替平面图加长篇说明，工程人员看图就能直接确认或指出问题。',
        '标志从只印在名片上的“金鑫”换成和公司名一致的“鑫丰”，公司也从生产工厂往设备产品品牌走：主品牌下按业务线和设备类别命名，设备上认得出是谁家的。',
      ],
      image: '/works/portfolio/factory-safety-vi/factory-first-floor.jpg',
      gallery: [],
      modules: [
        { kicker: 'B 端沟通 · 厂区规划', title: '用效果图代替解释，和机械设计人员快速对齐', text: '方案要在设计、工程和管理之间反复确认。我先用 C4D 把厂房一、二层搭成三维模型，标出功能分区和动线，再拿着效果图和工程机械设计人员逐区确认设备位置和通道。比起平面图加文字，对方一眼就能指出问题，来回次数少了很多。', points: ['一层：生产、仓储、配件与服务区', '二层：生产区、参观动线与办公', '标出消防门、物流门等安全相关位置'], images: [
            { src: '/works/portfolio/factory-safety-vi/factory-second-floor.jpg', alt: '厂房二层空间规划效果图', caption: '二层：区分生产区、参观动线与办公室', wide: true },
          ] },
        { kicker: '品牌升级 · 从“金鑫”到“鑫丰”', title: '标志和公司名终于对上了', text: '升级前，公司用一个读作“金鑫”的旋转钩形标志，配绿底金字的名片：名字对不上，细线条缩到铭牌上会糊，配色也像商贸和金店。新标志的三块扇形对应“鑫”的三个“金”，下方是“丰”；深红带一点黑，配墨黑和钢灰，更像一家做设备的工业企业。', images: [
            { src: '/works/portfolio/xinfeng/vi-upgrade.jpg', alt: '升级前后对比（VI 应用为作品集整理时延展，下同）', caption: '升级前后对比（VI 应用为作品集整理时延展，下同）', wide: true },
            { src: '/works/portfolio/xinfeng/logo-construction.jpg', alt: '实习时的标准制图', caption: '2023 原稿：黑白稿与标准制图' },
            { src: '/works/portfolio/xinfeng/logo-combination.jpg', alt: '实习时的中英文组合', caption: '2023 原稿：中英文组合与色号' },
          ] },
        { kicker: '品牌规划 · 一个主品牌', title: '先定规则，再落到机器和每个触点', stacked: true, text: '原稿里已经做了“鑫丰化工 / 鑫丰冶金”的组合，我把它定成规则：同一个图形，只换后面的名称；设备按类别编号（EL 电解、IN 熔铸、EX 萃取），耗材作为配套。落地时用同一台电解设备比较三个阶段：旧标、只换 Logo、统一识别。最后一步才让人看清“这是鑫丰的哪类设备、哪一台”。先定规则、再处处照着用，这个经验后来做产品规划时也用得上。', points: [
            '机身：标志固定在左上，类别与型号在右，红线分隔',
            '铭牌上的资料编号对应技术资料封面编号，看设备就能找到说明书和图纸',
            '只做三类用途：设备、铭牌与资料、名片',
          ], images: [
            { src: '/works/portfolio/xinfeng/vi-machine.jpg', alt: '同一台设备的三个阶段（机身为 AI 生成示意底图）', caption: '同一台设备的三个阶段（机身为 AI 生成示意底图）', wide: true },
            { src: '/works/portfolio/xinfeng/vi-brand.jpg', alt: '主品牌与业务线', caption: '主品牌与业务线' },
            { src: '/works/portfolio/xinfeng/vi-nameplate.jpg', alt: '铭牌与技术资料对应', caption: '铭牌与技术资料对应' },
            { src: '/works/portfolio/xinfeng/vi-card.jpg', alt: '名片', caption: '名片' },
          ] },
      ],
      href: '/works/factory-planning',
    },
    {
      id: 'corporate-vi',
      title: '力肯高科企业 VI｜企业形象设计课程作业',
      type: '课程设计 / 企业识别',
      category: '课程设计 / Logo 与 VI 规范',
      year: '2022',
      period: '本科课程 · 企业形象设计',
      status: '课程设计作业',
      role: '独立完成：标志设计、标准制图、VI 手册编排',
      methods: 'Illustrator 标准制图、色彩与字体规范',
      next: '本科课程作业 · 完成 43 页 VI 手册。',
      description: '企业形象设计课程作业：为「力肯高科」设计图形标志，并整理成 43 页 VI 手册。',
      question: '以文字为主的标志难以单独识别，也不易在名片、标识、文件等不同载体上保持一致；企业需要一个能传达稳重、可靠的图形符号。',
      process: [
        ['提炼图形', '以 K 字母为骨架，用留白和底部向上的三角构成图形标志，表达稳重与向上。'],
        ['建立规范', '用网格与比例制图规定标志构成，统一标准色、字体与中英文组合。'],
        ['展开应用', '在手册中整理各类应用场景的使用方式。'],
      ],
      processIcons: ['pen', 'grid', 'book'],
      outcomes: [
        '从文字标志发展出可以单独使用的图形符号。',
        '用网格制图和色彩、字体规范，保证不同载体上的一致性。',
      ],
      image: '/works/portfolio/factory-safety-vi/vi-cover.jpg',
      gallery: [
        { image: '/works/portfolio/factory-safety-vi/logo-rationale.jpg', alt: '由文字型标志发展出的几何 K 图形标志释义', caption: '标志演进：从文字型 Logo 到几何 K 图形，底部三角寓意向上发展。' },
        { image: '/works/portfolio/factory-safety-vi/logo-grid.jpg', alt: '企业 Logo 的标准网格与比例制图', caption: '标准制图：通过网格与比例规范标志的使用。' },
        { image: '/works/portfolio/factory-safety-vi/logo-combinations.jpg', alt: '企业中文和英文名称与图形标志的组合方式', caption: '标志组合：建立中文、英文名称与图形标志的多种组合。' },
      ],
      href: '/works/corporate-vi',
    },
    {
      id: 'fridge-timeline',
      title: 'FRIDGE TIMELINE SYSTEM：冰箱物品日期与位置管理',
      type: '大学毕业设计 / 概念设计',
      category: '大学毕业设计 / 概念设计',
      year: '2022-2023',
      period: '本科毕业设计 · 冰箱产品系统',
      status: '大学毕业设计',
      role: '独立完成：竞品调研、问题定义、行为流程、造型与 CMF、灯光交互、C4D 动画、1/4 灯光模型',
      methods: '10 款冰箱竞品调研、行为流程分析、人机尺寸推算、C4D 建模与动画、1/4 灯光模型',
      next: '本科毕业设计 · 完成 C4D 流程动画与 1/4 灯光模型；标签打印未实现，识别准确度和用户使用都未测试。',
      description: '把“食材进家门”的整段过程串起来：在冰箱旁的桌面整理时顺手扫描登记，冰箱再用灯光一步步指引放到哪里、之后去哪里拿。',
      question: '忙碌的两三口之家买菜回来，常常连袋子一起塞进冰箱；东西一多就找不到，放在角落的更容易忘，最后过期丢掉。调研的 10 款市售冰箱虽有分区和 App，但录入麻烦，也不能帮人快速找到东西。',
      process: [
        ['桌面扫描登记', '在整理食材的桌面上逐个扫描，登记放到放进冰箱之前。'],
        ['取件码式的秩序', '按类型分层，同层新的放右边，不必记住每样东西在哪。'],
        ['两步灯光指引', '门外灯条指出开哪扇门，门内灯区指出放哪一格。'],
        ['手机查看与取出', '在手机上找到食材、看日期，对应位置的灯亮起。'],
      ],
      processIcons: ['camera', 'pin', 'light', 'phone'],
      outcomes: [
        '把登记放在进家门后的桌面整理这一步，不等东西进了冰箱再去识别。',
        '秩序是效率的核心：一条“新右旧左”的规则加两步灯光，人不必记住每样东西放在哪。',
      ],
      image: '/works/portfolio/fridge-timeline-system.png',
      gallery: [
        { image: '/works/portfolio/fridge-2023/render-kitchen.jpg', alt: '厨房中的冰箱渲染', caption: '2023 渲染：冰箱紧挨厨房台面' },
        { image: '/works/portfolio/fridge-2023/render-cmf.jpg', alt: '四种配色方案', caption: 'CMF：四种机身配色' },
        { image: '/works/portfolio/generated/fridge-story-triptych.png', alt: 'AI 二次创作的使用场景', caption: '2026 年 AI 二次创作的场景示意，非原设计' },
      ],
      videos: [
        { src: '/works/portfolio/fridge-2023/flow-demo.mp4', poster: '/works/portfolio/fridge-2023/flow-demo-poster.jpg', caption: 'C4D 流程动画（2023）：取下扫描终端 → 桌面扫描 → 门内灯区指引 → 门外角形灯带。' },
        { src: '/works/portfolio/fridge-2023/scan-view.mp4', poster: '/works/portfolio/fridge-2023/scan-view-poster.jpg', caption: '扫描视角：把食材逐个放进扫描区域。' },
      ],
      research: { sample: '对 10 款市售冰箱（三星、海尔、小米、美的、康佳、奥克斯、志高、卡萨帝、达米尔、云米）的调研，归纳出 6 个问题，其中 3 个直接决定了设计方向。', metrics: [], decisions: [
          ['分区不会帮人整理', '多数冰箱有空间划分，却不能主动帮用户保持整洁 → 用固定位置 + 灯光引导摆放。'],
          ['App 录入不清晰', '有智能 App 的冰箱，食材录入与管理并不清晰 → 把录入放到桌面扫描这一步，简单快捷。'],
          ['东西多就找不到', '无法帮用户快速找到存放的东西 → 门外 + 门内两段灯光定位。'],
        ], limitation: '本科毕业设计 · 完成 C4D 流程动画与 1/4 灯光模型；标签打印未实现，识别准确度和用户使用都未测试。' },
      comparison: { title: '与近年 AI 冰箱的对比', intro: '2024 年起，三星、卡萨帝等陆续推出用摄像头自动识别食材的冰箱。本设计完成于 2023 年，“记住位置与日期”的目标相近，切入点不同：识别发生在放进冰箱之前的桌面整理环节，并用灯光指引摆放。', columns: ['本设计（2023 本科毕业设计）', '卡萨帝 AI 冰箱（2025–2026 公开资料）'], rows: [
          ['识别时机', '放入前，在桌面整理时逐个扫描', '放入时由“AI 之眼”自动识别'],
          ['识别方式', '红外扫码 + 图像识物（概念）', '2025 年发布时称可识别 210 多种食材，2026 年报道称 2000 多种'],
          ['位置指引', '门外角形灯带 + 门内层架灯区，两步指引放哪里、去哪拿', '公开资料未提及'],
          ['日期管理', '手机清单与临期提醒', '主动推送临期提醒，跨设备同步'],
          ['不看手机时', '打印标签贴在食物上（设想，未实现）', '—'],
          ['完成度', 'C4D 动画 + 1/4 灯光模型', '量产产品'],
        ], sources: [
          ['极客公园 2025-06-26', 'https://www.geekpark.net/news/350884'],
          [
            '中国网 2026-08-21',
            'https://mtz.china.com/touzi/2026/0821/260650.html',
          ],
          [
            'Tom’s Guide 2024-01-04（三星 AI Vision Inside）',
            'https://www.tomsguide.com/news/samsung-unveils-2024-bespoke-family-hub-refrigerator-with-vision-ai-heres-what-it-can-do',
          ],
        ] },
      modules: [
        { kicker: '切入点 · 桌面扫描', title: '在桌面登记，而不是在冰箱前', text: '拆袋、分类发生在厨房桌面，而不是冰箱前，这是最适合登记的时刻。所以扫描终端做成独立配件：平时吸在冰箱门屏旁充电，用时取下放到桌面，拿起一样扫一样，扫完一起放进冰箱。', points: [
            '红外扫码 + 图像识物；打印标签为设想，未实现',
            '从圆柱形改为方柱形：少一个活动关节，也更容易磁吸贴回冰箱',
            '轮廓灯同时提示“正在工作”和扫描范围',
          ], images: [
            { src: '/works/portfolio/fridge-2023/behavior-flow-zh.svg', alt: '存入与取出的行为流程图', caption: '行为流程（根据毕业设计重建）', wide: true },
            { src: '/works/portfolio/fridge-2023/render-scan-beam.jpg', alt: '扫描终端在桌面投出扫描区域', caption: '放在桌面，投出扫描区域' },
            { src: '/works/portfolio/fridge-2023/thesis-scanner-sketch.jpg', alt: '扫描终端形态草图', caption: '形态推敲：圆柱改为方柱' },
            { src: '/works/portfolio/fridge-2023/model-scanner.jpg', alt: '扫描终端实物模型', caption: '扫描终端模型' },
          ], stacked: true },
        { kicker: '秩序 · 借用快递取件码', title: '新的放右边，旧的在左边', text: '快递站靠取件码 27-5-3002（货架—层—日期—序号）在上千件包裹里定位。冰箱里东西少得多，但同样需要秩序：按类型分层，同一层按放入先后从左到右排。人记不住每样东西的位置，却记得住一条规则。', points: ['按勤快程度给两种收纳：简约版整袋放进大盒子，按日期整盒往左推；细分版逐件分装、贴标签', '最左边就是放得最久的，先吃它'], images: [
            { src: '/works/portfolio/fridge-2023/order-rule-zh.svg', alt: '取件码规则与冰箱内的新右旧左排列', caption: '取件码 → 冰箱内的排列规则（重绘）', wide: true },
            { src: '/works/portfolio/fridge-2023/midterm-concept.jpg', alt: '中期汇报：概念出发点', caption: '中期汇报：快递仓管 → 智能仓管 → 灯光引导' },
            { src: '/works/portfolio/fridge-2023/midterm-courier-analogy.jpg', alt: '快递仓管的扫码录入', caption: '参考：快递站扫码录入与标签' },
          ], stacked: true },
        { kicker: '灯光 · 两步指引', title: '门外指区域，门内指位置', text: '系统分好位置后，先亮对应门上的灯条：灯条贴着暗把手，形状暗示开门方向；开门后再亮对应层架的灯区。取出也一样：在手机或门屏上把食材拖到“取出”，对应的门灯闪烁。', points: [
            '把手区域按中国成人 5% 女性到 95% 男性的抬手高确定',
            '门屏高度按站姿眼高和 40 cm 操作距离推算',
            '门屏只做手机的附属：待机是一块可以拨指针定时的钟',
          ], images: [
            { src: '/works/portfolio/fridge-2023/render-fridge.jpg', alt: '整机与门把手旁的角形灯条', caption: '门外：把手旁的角形灯条', wide: true },
            { src: '/works/portfolio/fridge-2023/render-interior-sequence.jpg', alt: '门内灯区逐步亮起', caption: '门内：对应层架灯区亮起，放入后熄灭' },
            { src: '/works/portfolio/fridge-2023/thesis-ergonomics-sketch.jpg', alt: '抬手高与把手位置草图', caption: '抬手高与把手区域' },
          ] },
        { kicker: '原型 · 1/4 灯光模型', title: '把两步指引做成能亮的模型', text: '用 PVC 板搭出 1/4 的机身和门板，在门上开槽嵌入 5 V LED 灯条，背部用面包板和开关接线，每根灯条可以单独点亮，用来演示门外、门内两步指引的位置和观感。', points: ['完成：C4D 流程动画 + 1/4 实物模型', '未做：识别准确度测试与用户测试'], images: [
            { src: '/works/portfolio/fridge-2023/model-full.jpg', alt: '1/4 冰箱模型与扫描终端', caption: '机身与扫描终端' },
            { src: '/works/portfolio/fridge-2023/model-lit.jpg', alt: '门上灯条点亮', caption: '门上灯条单独点亮' },
            { src: '/works/portfolio/fridge-2023/model-interior.jpg', alt: '模型内部灯条', caption: '内部层架灯条' },
            { src: '/works/portfolio/fridge-2023/model-wiring.jpg', alt: '背部接线', caption: '背部接线，逐根开关控制' },
          ] },
      ],
      href: '/works/fridge-timeline',
    },
  ],
}

export const workGroups = [
  { key: 'main', ids: ['taste-again', 'co-creative-ai-training', 'smart-oven-timing', 'fridge-timeline'] },
  { key: 'explore', ids: ['frametrace', 'transparent-driving-hud', 'alive-energy-link'] },
  { key: 'other', ids: ['factory-planning', 'corporate-vi'] },
] as const
const priorityWorkIds: string[] = workGroups.flatMap((group) => [...group.ids])
const timelineWorkIds = [
  'co-creative-ai-training',
  'transparent-driving-hud',
  'frametrace',
  'taste-again',
  'smart-oven-timing',
  'alive-energy-link',
  'fridge-timeline',
  'corporate-vi',
  'factory-planning',
]

export function getTimelinePortfolioWorks(language: Language) {
  const timelinePriority = new Map(timelineWorkIds.map((id, index) => [id, index] as const))

  return [...portfolioWorks[language]].sort((left, right) => {
    const yearDifference = Number(right.year.slice(0, 4)) - Number(left.year.slice(0, 4))
    return yearDifference || (timelinePriority.get(left.id) ?? 0) - (timelinePriority.get(right.id) ?? 0)
  })
}

export function getOrderedPortfolioWorks(language: Language) {
  const priority = new Map(priorityWorkIds.map((id, index) => [id, index] as const))
  return [...portfolioWorks[language]].sort(
    (left, right) => (priority.get(left.id) ?? priority.size) - (priority.get(right.id) ?? priority.size),
  )
}

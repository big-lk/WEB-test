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
      role: 'Solo: research design, survey and study plans, interaction concept, test interface',
      methods: 'Scenario comparison survey (47 people), interface scenario study, live conversation + eye tracking (planned)',
      next: 'Stage 1 survey done (47 people) · stage 2 interface study in progress · stage 3 eye-tracking study planned.',
      description: 'People understand a word like “premium” differently, but AI generates from the common reading, leaving a gap between the person and the AI. The interface first shows how the AI reads the word, then prompts the user to enter their own judgment; the AI adjusts to it, and the co-created result gets closer to what they meant.',
      question: 'Users type kansei words like “premium” or “cozy”, and AI tends to generate the average reading, so results become ordinary. Users also cannot see how the AI understood them, so they cannot correct it.',
      process: [
        [
          'Say what you want',
          'Describe it in your own words, often with a hard-to-pin-down word like “special”.',
        ],
        [
          'See how the AI reads it',
          'The side panel splits the message into value items, showing the AI’s guessed meaning, its reason, and the order.',
        ],
        [
          'Spot the gap',
          'Compare with what you meant and find two kinds of gap: meaning narrowed, priority decided early.',
        ],
        [
          'Correct it',
          'Add a sentence to fix meaning or order, or change who decides an item: me, together, or the AI.',
        ],
      ],
      processIcons: ['message', 'eye', 'refresh', 'check'],
      outcomes: [
        'Users add their own reading, narrowing the gap between their understanding and the AI’s common one.',
        'Each value item can have its own decider, so users neither hand over the whole conversation nor decide everything alone.',
        'Next, an eye-tracking study checks whether people look back at the panel and edit after noticing a gap.',
      ],
      image: '/works/portfolio/ai-cocreation-steps-en.svg',
      gallery: [
        { image: '/works/portfolio/generated/ai-cocreation-chat-v2.png', alt: 'Early concept chat interface', caption: 'Early concept (AI-generated illustration): choose between “AI decides / discuss together / I decide”. The current design puts these three choices on each value item and shows the AI’s reading first.' },
        { image: '/works/portfolio/generated/ai-story-triptych.png', alt: 'Early concept usage scenes', caption: 'Usage scenes of the early concept (AI-generated illustration).' },
        { image: '/works/portfolio/generated/ai-cocreation-overlay.png', alt: 'Early concept judgment roles', caption: 'The three judgment roles of the early concept (AI-generated illustration).' },
      ],
      research: { sample: 'Stage 1 scenario comparison: 47 people read four AI conversations about the same dinner plan (gives a conclusion / thinks it through together × food only / extends to the dining atmosphere), rated each, then ranked them. They were split into three groups by whether they valued the food or the atmosphere more.', metrics: [
          ['47', 'Scenario comparison', '4 conversation conditions × 5 ratings'],
          [
            '18 / 6 / 23',
            'Group sizes',
            'Food first / atmosphere first / about equal',
          ],
          [
            '0.97 vs 0.43',
            'Spread across conditions',
            'The food-first group reacted more to conversation style (p=.0021)',
          ],
        ], decisions: [
          [
            'Make the AI’s reading visible',
            'Feeling involved did not mean wanting to continue, so users need to see what the AI took a vague word to mean and what it put first.',
          ],
          [
            'Decide per value item',
            'People value different things, so the choice of who decides should be made for each value item, not once for the whole conversation.',
          ],
        ], limitation: 'The atmosphere-first group had only 6 people, so its results are exploratory; stage 2 rates impressions of screen scenarios, not real use; the stage 3 eye-tracking study is still planned.' },
      modules: [
        { kicker: 'Research process', title: 'Three stages: find the problem, compare interfaces, then watch real conversations', text: 'Stage 1 found that feeling involved and wanting to continue do not move together. Stage 2 compares three screens: history only, the AI’s reading shown, and an editable reading with per-item deciders. Stage 3 uses six real turns with eye tracking to see whether people edit after noticing a gap.', stacked: true, images: [
            { src: '/works/portfolio/ai-research-stages-en.svg', alt: 'Three research stages: scenario comparison, interface scenario study, live conversation with eye tracking', wide: true },
          ] },
        { kicker: 'Test interface', title: 'Conversation on the left, the AI’s reading and who decides on the right', text: 'The test interface built for the eye-tracking study, still in development. Each card on the right is a value item: the AI’s guess, its reason, confidence, and the turn it is based on, with three buttons to choose who decides. At the bottom, an example of what to say next can be generated from the current settings. Conversations use simulated personas, with no real participant data.', stacked: true, images: [
            { src: '/works/portfolio/ai-test-ui-turn1.jpg', alt: 'Test interface: three value items after turn 1', caption: 'After turn 1: the AI splits the message into three value items (test build, mixed Chinese and Japanese)', wide: true },
            { src: '/works/portfolio/ai-test-ui-turn3.jpg', alt: 'Test interface: checking a gap at turn 3', caption: 'Turn 3: checking the gap between portion and the original criteria (Japanese build)', wide: true },
          ] },
      ],
      href: '/works/ai-judgement',
    },
    {
      id: 'transparent-driving-hud',
      title: 'Driving HMI That Keeps Eyes on the Road',
      type: 'Intelligent driving / AR-HUD risk cues',
      category: 'Intelligent driving / AR-HUD risk cues',
      year: '2025-2026',
      period: 'Graduate study · Driving HMI',
      status: 'Blender concept prototype',
      role: 'Solo: scenarios and risk levels, HUD display language, Blender prototype, regulatory zone check, VR test plan',
      methods: 'Driver-view simulation in Blender (generated with Python), three scenarios × three schemes, display-zone pixel check, Quest 3 + eye tracking (planned)',
      next: 'Blender concept prototype done (three scenarios × three schemes), with an approximate display-zone check; the long-drive VR study has not started.',
      description: 'In L2 assisted driving, risk cues stay at the lower edge of the HUD and use shape, color and position to tell the driver what it is, how urgent, and which side. The only words are “L2” and “Take over”, so eyes stay on the road.',
      question: 'The steadier driver assistance gets, the more drivers drift off, yet at L2 the driver is still responsible. Too many cues block the view and distract; showing only distance and speed leaves the driver unsure where the risk is and how urgent it is.',
      process: [
        ['Lower edge only', 'All cues sit below the core line of sight, never covering the road the car will cross in the next 2–4 s or the hazard itself.'],
        ['Shape · color · position · motion', 'One capsule badge holds everything: the icon gives the category, cyan / amber / red the urgency, horizontal position the direction; only red blinks.'],
        ['Fade, don’t jump', 'Calm → detect → escalate → respond → step down. Cues fade in and out over 0.5 s and adjacent levels cross-fade, so nothing pops in or vanishes.'],
        ['HUD never warns alone', '“Take over” is repeated on the instrument cluster and the steering-wheel light strip. Text is limited to “L2” and “Take over”; no “autonomous” wording.'],
      ],
      processIcons: ['eye', 'layers', 'refresh', 'alert'],
      outcomes: [
        'S1, the direction band, is the main scheme: it works with a production HUD, covers the least, and is not thrown off by tracking errors.',
        'S2 ground rings are more direct but need a large-field HUD and cover more of the road; S3 is what many cars do today and stays as the control, to measure how much keeping cues ahead actually helps.',
        'Next: a roughly 20-minute drive in Quest 3 with eye tracking, measuring every 5 minutes the share of gaze on the road ahead and reaction times.',
      ],
      image: '/works/portfolio/hmi/hero.jpg',
      videos: [
        { src: '/works/portfolio/hmi/compare_ch1.mp4', poster: '/works/portfolio/hmi/compare_ch1_poster.jpg', caption: 'Scenario 1, a child runs out between parked cars (16 s): partly visible → runs toward the lane → automatic emergency braking to a stop → cues step down after the child passes. Top left S1, top right S2, bottom left S3, bottom right the risk-level timeline.' },
        { src: '/works/portfolio/hmi/compare_ch2.mp4', poster: '/works/portfolio/hmi/compare_ch2_poster.jpg', caption: 'Scenario 2, a car cuts in (18 s): signals → crosses the line → cuts in close; the system slows to yield → cues clear once the gap recovers.' },
        { src: '/works/portfolio/hmi/compare_ch3.mp4', poster: '/works/portfolio/hmi/compare_ch3_poster.jpg', caption: 'Scenario 3, roadworks ahead (18 s): cones detected far ahead → the system slows but cannot change lanes → take-over request on HUD, cluster and wheel light → the driver changes lanes to the right.' },
      ],
      modules: [
        { kicker: 'Display language', title: 'One container × four icons × three colors', text: 'Every cue sits in the same hollow capsule badge: the icon only says what it is, and there are only three colors, following ISO 2575 meanings.', stacked: true, points: [
            'L1 cyan: detected, “it is over there”.',
            'L2 amber: the risk is closing in; the system starts slowing or yielding.',
            'L3 red: danger or take over; the only state that moves.',
            'When tracking confidence drops below 0.8, elements attached to the target are hidden and only the coarse direction band remains.',
          ], images: [
            { src: '/works/portfolio/hmi/attribute.jpg', alt: 'Display language legend: capsule badge, four icons, three colors', caption: 'Display language legend (labels in Chinese): pedestrian / vehicle / static obstacle / system × cyan / amber / red', wide: true },
          ] },
        { kicker: 'Three schemes', title: 'Split by display location, to compare which keeps eyes ahead best', text: 'All three share the “L2” status on the HUD, the scenario 3 “Take over”, the cluster and the wheel light strip; they differ only in how the risk itself is shown.', stacked: true, points: [
            'S1 HUD direction band (main scheme): a colored bar along the lower edge whose horizontal position is the hazard’s direction, with a badge for the category; off-screen targets get an edge arrow. It does not follow the target, so tracking jitter does not matter and it covers the least.',
            'S2 AR ground ring + predicted path: a ring under the target and its position 0.4–2 s ahead; roadworks get hatching over the closed lane. Most direct, but the rings sit on the lane, so it covers the most. With a production 13°×6° field most targets fall outside it, so S2 is designed for 24°×6.5°.',
            'S3 center-screen top view (control): nothing on the HUD; a top-down card pops up on the driver side of the navigation screen. A driver who does not look down gets no direction at L3, which is the trade-off the test will measure.',
          ], images: [
            { src: '/works/portfolio/hmi/s1_child_l3.jpg', alt: 'S1 HUD direction band, scenario 1 L3', caption: 'S1: the red bar sits right below the child’s direction' },
            { src: '/works/portfolio/hmi/s2_merge_l3.jpg', alt: 'S2 AR ground ring, scenario 2 L3', caption: 'S2: ring and predicted arrow under the cutting-in car' },
            { src: '/works/portfolio/hmi/s3_child_l3.jpg', alt: 'S3 center-screen top view, scenario 1 L3', caption: 'S3: top-down risk card on the navigation screen' },
          ] },
        { kicker: 'Regulation check', title: 'Render the HUD alone and count pixels by zone', text: 'Zones follow the UN R176 draft and GB/T 46926—2025; each scenario is checked at its L1, L2 and L3 moments. This is an in-project approximation, not a type-approval test, and night, glare and eyebox offset were not assessed.', stacked: true, points: [
            'Cue pixels in zone 1 are 0 everywhere; the largest opaque area in zone 2 is 11.4 deg² (limit 66 deg²).',
            'Largest share of the core line of sight covered: about 2% for S1 and about 8% for S2; a user test must show whether that distracts.',
          ], images: [
            { src: '/works/portfolio/hmi/compliance.jpg', alt: 'Regulation and sight-line check board', caption: 'Regulation / sight-line check (labels in Chinese): three scenarios × S1 and S2; S3 shows risk on the center screen, and its HUD part matches S1', wide: true },
          ] },
      ],
      gallery: [
        { image: '/works/portfolio/generated/hmi-story-triptych.png', alt: 'Early concept triptych', caption: 'Early concept (AI-generated illustration): mark one object and add a short emotional line explaining why. After reviewing Chinese regulations, the emotional wording was dropped for a wordless visual language, and the scope was narrowed to L2.' },
      ],
      comparison: { title: 'Chinese regulations and trade-offs', intro: 'Regulations govern that the driver must keep watching the road, that the system must warn, and what may appear on the windshield; this concept only adds within those limits. Zone calculations also follow the UN R176 draft (ECE/TRANS/WP.29/2024/155). Based on official announcements and published commentary; the full standard texts were not checked clause by clause.', columns: ['Requirement (summary)', 'Trade-off in this concept'], rows: [
          [
            'GB 47955—2026 Safety requirements for combined driver assistance (mandatory, from 1 Jan 2027)',
            'The driver must keep observing traffic and control the vehicle; the system must detect hands-off and eyes-off states, respond in steps from monitoring to warning to restriction, and inform users of its limits.',
            'Cues only help maintain attention and never replace the required hands-off or eyes-off warnings. “Take over” is repeated on the cluster and the wheel light strip so the HUD never warns alone. The emotional lines of the early concept were removed.',
          ],
          [
            'MIIT and SAMR notice on market access, recalls and OTA for intelligent connected vehicles (Apr 2025)',
            'Define functional limits and safety responses, fully inform users, and avoid exaggerated or false promotion.',
            'The HUD always shows “L2” as a reminder that the driver is responsible. Text is limited to “L2” and “Take over”, with no “autonomous” wording and no hint that the system handles everything.',
          ],
          [
            'GB/T 46926—2025 Technical requirements and test methods for field-of-vision assistance systems of light vehicles',
            'Displays in the forward transparent area are zoned: the upper zone allows only non-static information with at most 50% opaque pixels, and AR overlays must align with the real scene.',
            'All cues sit in zone 2 at the lower edge, with 0 pixels in zone 1. Badges are hollow outlines with no dark backing. Elements attached to a target hide when tracking confidence falls below 0.8, leaving only the direction band.',
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
      role: '単独担当：研究設計、調査・実験計画、インタラクション構想、テスト画面',
      methods: '対話条件の場面比較調査（47名）、UIシナリオ比較調査、実対話＋視線計測（計画）',
      next: '第1段階の調査完了（47名）・第2段階のUI比較調査を実施中・第3段階の視線計測実験を計画中。',
      description: '「高級感」のような言葉の受け取り方は人それぞれだが、AIは一般的な解釈で生成するため、両者の理解にずれが生じる。画面でまずAIの解釈を示し、ユーザー独自の判断を入力するよう促し、AIがそれに合わせて調整する。共創の結果が本人の意図に近づく。',
      question: '「高級感」「温かみ」などの感性語を入れると、AIは一般的な解釈で生成しがちで、結果がありきたりになる。ユーザーにはAIの理解が見えず、直すこともできない。',
      process: [
        ['考えを伝える', '自分の言葉で伝える。「特別」のような言い表しにくい言葉が入りやすい。'],
        ['AIの読み取りを見る', '右側パネルが文を価値項目に分け、AIが推測した意味・推測理由・優先順位を示す。'],
        ['ずれに気づく', '自分の考えと照らし合わせ、「意味の限定」と「優先順位の先取り」の二つのずれを見つける。'],
        ['修正する', '一文を補って意味や順番を直すか、項目ごとに誰が判断するかを変える（自分で判断／AIと相談／AIに任せる）。'],
      ],
      processIcons: ['message', 'eye', 'refresh', 'check'],
      outcomes: [
        'ユーザーが独自の理解を補い、AIの一般的な理解との隔たりが縮まる。',
        '価値項目ごとに誰が判断するかを選べ、対話全体をAIに任せることも、すべて自分で決めることもしなくてよい。',
        '今後、視線計測で、ずれに気づいた後にパネルを見返して修正するかを確かめる。',
      ],
      image: '/works/portfolio/ai-cocreation-steps-ja.svg',
      gallery: [
        { image: '/works/portfolio/generated/ai-cocreation-chat-v2.png', alt: '初期構想の対話画面', caption: '初期構想（AI生成のイメージ）：「AIが判断／一緒に検討／自分で判断」の3モードから選ぶ。現在の案では、この三つの選択を価値項目ごとに置き、先にAIの解釈を示す。' },
        { image: '/works/portfolio/generated/ai-story-triptych.png', alt: '初期構想の利用場面', caption: '初期構想の利用場面（AI生成のイメージ）。' },
        { image: '/works/portfolio/generated/ai-cocreation-overlay.png', alt: '初期構想の判断役割', caption: '初期構想の3つの判断役割（AI生成のイメージ）。' },
      ],
      research: { sample: '第1段階の場面比較調査：47名が同じ夕食構想について4種類のAI対話（結論型／共議型 × 料理中心／会話・雰囲気まで拡張）を読み、個別に評価した後、4場面を比較して順位づけた。料理と食事場面のどちらを重視するかで三群に分けて比較した。', metrics: [
          ['47名', '場面比較調査', '4条件 × 5項目の評価'],
          ['18 / 6 / 23', '三群の人数', '料理重視／食事場面重視／同程度'],
          ['0.97 vs 0.43', '条件評価差', '料理重視群は対話条件の違いに敏感（p=.0021）'],
        ], decisions: [
          [
            'AIの解釈を見えるようにする',
            '関与できると感じても続けたいとは限らない。AIが曖昧な言葉をどの意味に絞り、何を優先したかを利用者が確認できる必要がある。',
          ],
          [
            '判断分担を価値項目ごとに',
            '重視するものは人によって違うため、対話全体で一律に決めず、価値項目ごとに誰が判断するかを選べるようにする。',
          ],
        ], limitation: '食事場面重視群は6名のみで探索的な結果。第2段階は画面シナリオへの印象評価で実際の操作ではなく、第3段階の視線計測実験は計画段階。' },
      modules: [
        { kicker: '研究の流れ', title: '三段階で検証：課題を見つけ、画面を比べ、実際の対話を見る', text: '第1段階で「関与できる感覚」と「続けたい気持ち」が一致しないことが分かった。第2段階では対話履歴のみ・AIの解釈表示・解釈編集と判断分担の三つの画面を比較し、第3段階では6ターンの実対話と視線計測で、ずれに気づいた後に修正するかを見る。', stacked: true, images: [
            { src: '/works/portfolio/ai-research-stages-ja.svg', alt: '研究の三段階：場面比較調査、UIシナリオ比較、実対話と視線計測', wide: true },
          ] },
        { kicker: 'テスト画面', title: '左に対話、右にAIの読み取りと判断分担', text: '視線計測実験用のテスト画面（開発中）。右側の各カードが一つの価値項目で、AI推測・推測理由・確信度・根拠となったターンを示し、下の三つのボタンで誰が判断するかを選ぶ。下部では現在の設定から次に伝える例文を作れる。対話は模擬キャラクターによるもので、実在の参加者データは含まない。', stacked: true, images: [
            { src: '/works/portfolio/ai-test-ui-turn1.jpg', alt: 'テスト画面：ターン1後の三つの価値項目', caption: 'ターン1後：AIが発話を三つの価値項目に分ける（テスト版、中日混在）', wide: true },
            { src: '/works/portfolio/ai-test-ui-turn3.jpg', alt: 'テスト画面：ターン3でずれを確認', caption: 'ターン3：料理の重さと最初の基準のずれを確認する（日本語版）', wide: true },
          ] },
      ],
      href: '/works/ai-judgement',
    },
    {
      id: 'transparent-driving-hud',
      title: '道路を見続けるための運転支援HMI',
      type: '知能運転 / AR-HUDのリスク提示',
      category: '知能運転 / AR-HUDのリスク提示',
      year: '2025-2026',
      period: '大学院期・運転HMI',
      status: 'Blenderコンセプト試作',
      role: '個人制作：場面とリスク段階の設定、HUD表示言語、Blender試作、法規の区分チェック、VR検証計画',
      methods: 'Blenderによる運転者視点シミュレーション（Pythonで生成）、3場面×3案の比較、表示区分の画素チェック、Quest 3＋視線計測（計画）',
      next: 'Blenderのコンセプト試作は完成（3場面×3案）、表示区分は近似チェック済み。VRでの長時間行動テストは未実施。',
      description: 'L2運転支援中、リスク提示はHUD視野の下端だけに置き、形・色・位置で「何が・どれほど急ぎで・どちら側に」を伝える。文字は「L2」と「運転を交代」の2つだけで、視線は道路から離れない。',
      question: '運転支援が安定するほど運転者は気が緩むが、L2では責任は運転者にある。提示が多いと視界を遮って気が散り、距離や車速だけでは危険がどちらにあり、どれほど急ぐのかが分からない。',
      process: [
        ['視野の下端だけ', '提示はすべて中心視線より下に置き、2〜4秒後に通る路面も危険対象そのものも覆わない。'],
        ['形・色・位置・動き', '入れ物はカプセル型バッジ一つ。図形で種類、青緑／琥珀／赤で緊急度、横位置で方向を示し、点滅するのは赤だけ。'],
        ['跳ばずに移る', '平常 → 発見 → 上昇 → 対処 → 段階的に解除。0.5秒でフェードし、隣り合う段階はクロスフェードするので、急に出たり消えたりしない。'],
        ['HUDだけで警告しない', '「運転を交代」はメーターとステアリングのライトにも同時に出す。文字は「L2」と「運転を交代」のみで、「自動運転」などの語は使わない。'],
      ],
      processIcons: ['eye', 'layers', 'refresh', 'alert'],
      outcomes: [
        '主案はS1の方位バー：量産級HUDで実現でき、遮る面積が最も小さく、対象追跡の誤差にも左右されない。',
        'S2の路面リングはより直感的だが、大視野HUDが必要で遮る面積も大きい。S3は多くの車の現行方式で、対照として残し、「提示を前方に置く」効果がどれほどかを測る。',
        '次はQuest 3に視線計測を加え、約20分の長時間運転で、5分ごとに前方への視線の割合と反応時間を集計する。',
      ],
      image: '/works/portfolio/hmi/hero.jpg',
      videos: [
        { src: '/works/portfolio/hmi/compare_ch1.mp4', poster: '/works/portfolio/hmi/compare_ch1_poster.jpg', caption: '場面1 駐車車両の間から子どもが飛び出す（16秒）：半分見える → 車線へ走る → 自動緊急ブレーキで停止 → 通過後に段階的に解除。左上S1、右上S2、左下S3、右下はリスク段階のタイムライン。' },
        { src: '/works/portfolio/hmi/compare_ch2.mp4', poster: '/works/portfolio/hmi/compare_ch2_poster.jpg', caption: '場面2 隣の車の割り込み（18秒）：ウインカー → 車線をまたぐ → 近距離で割り込み、システムが減速して譲る → 車間が戻ると解除。' },
        { src: '/works/portfolio/hmi/compare_ch3.mp4', poster: '/works/portfolio/hmi/compare_ch3_poster.jpg', caption: '場面3 前方の工事（18秒）：遠くでコーンを認識 → 減速するが自分では車線変更できない → 運転交代の要求（HUD・メーター・ステアリングライト同時）→ 運転者が右へ車線変更して回避。' },
      ],
      modules: [
        { kicker: '表示言語', title: '入れ物一つ × 図形4種 × 色3段階', text: 'すべての提示は輪郭だけの同じカプセル型バッジに入る。図形は「何か」だけを表し、色は3段階でISO 2575の意味に合わせる。', stacked: true, points: [
            'L1 青緑：検知済み。「そこにいる」と知らせる。',
            'L2 琥珀：危険が近づき、システムが減速・譲りを始める。',
            'L3 赤：危険、または運転交代。唯一動く状態。',
            '追跡の信頼度が0.8を下回ると、対象に重ねる要素は隠し、大まかな方位バーだけを残す。',
          ], images: [
            { src: '/works/portfolio/hmi/attribute.jpg', alt: '表示言語の凡例：カプセル型バッジ、図形4種、色3段階', caption: '表示言語の凡例（図中は中国語）：歩行者／車両／静止障害物／システム × 青緑／琥珀／赤', wide: true },
          ] },
        { kicker: '3つの案', title: '表示位置で分け、どれが最も視線を前方に保てるかを比べる', text: '3案ともHUDの「L2」表示、場面3の「運転を交代」、メーター、ステアリングライトは共通で、違うのはリスクそのものの見せ方だけ。', stacked: true, points: [
            'S1 HUD方位バー（主案）：視野下端の色付きバーで、横位置がそのまま危険の方向、バッジが種類を示す。視野外の対象は端に寄せて矢印を付ける。対象を追いかけないので追跡の揺れに影響されず、遮る面積も最小。',
            'S2 ARの路面リング＋軌跡予測：対象の足元にリングを描き、0.4〜2秒後の位置も示す。工事場面では閉鎖車線に斜線を描く。最も直感的だが、リングは車線上に描くため遮る割合が最も高い。量産の13°×6°視野では対象の多くが視野外になるため、24°×6.5°で設計した。',
            'S3 センター画面の俯瞰（対照）：HUDにはリスクを出さず、ナビ画面の運転席側に俯瞰カードを出す。画面を見なければL3でも方向が分からない。これがテストで比べたい取捨選択。',
          ], images: [
            { src: '/works/portfolio/hmi/s1_child_l3.jpg', alt: 'S1 HUD方位バー、場面1のL3', caption: 'S1：赤いバーが子どもの方向の真下に出る' },
            { src: '/works/portfolio/hmi/s2_merge_l3.jpg', alt: 'S2 ARの路面リング、場面2のL3', caption: 'S2：割り込み車の足元のリングと予測矢印' },
            { src: '/works/portfolio/hmi/s3_child_l3.jpg', alt: 'S3 センター画面の俯瞰、場面1のL3', caption: 'S3：ナビ画面に出る俯瞰のリスクカード' },
          ] },
        { kicker: '法規チェック', title: 'HUDだけを描画し、区分ごとに画素を数える', text: '区分はUN R176草案とGB/T 46926—2025に従い、各場面のL1・L2・L3の3時点で確認した。プロジェクト内の近似計算で型式認証試験ではなく、夜間・グレア・アイボックスのずれは評価していない。', stacked: true, points: [
            '領域1内の提示画素はすべて0、領域2の不透明面積は最大11.4°²（上限66°²）。',
            '中心視線を覆う最大割合はS1が約2%、S2が約8%。気が散るかどうかは実験で確かめる。',
          ], images: [
            { src: '/works/portfolio/hmi/compliance.jpg', alt: '法規と視線のチェックボード', caption: '法規・視線チェック（図中は中国語）：3場面 × S1・S2。S3はリスクをセンター画面に出し、HUD部分はS1と同じ', wide: true },
          ] },
      ],
      gallery: [
        { image: '/works/portfolio/generated/hmi-story-triptych.png', alt: '初期案の三連図', caption: '初期案（AI生成のイメージ）：対象を一つだけ示し、理由を感情的な短文で添えていた。国内法規を確認したうえで感情的な文言をやめ、文字を使わない図形言語に変え、範囲もL2に絞った。' },
      ],
      comparison: { title: '中国国内の法規と取捨選択', intro: '法規が定めるのは「運転者は道路を見続ける」「システムは警告する」「フロントガラスに何を出せるか」であり、本案はその範囲内で補うだけにする。区分の計算はUN R176草案（ECE/TRANS/WP.29/2024/155）も参照した。公表資料と解説に基づき、規格本文は逐条確認していない。', columns: ['法規の要求（要約）', '本案の取捨選択'], rows: [
          [
            'GB 47955—2026 組合せ運転支援システムの安全要求（強制、2027年1月1日施行）',
            '運転者は交通状況を見続けて車両を操作する。システムは手放しと視線外れを検知し、「監視—警告—制限」の段階で対応し、機能の限界を利用者に知らせる。',
            '表示は注意を保つための補助で、法規が求める手放し・視線警報の代わりにはしない。「運転を交代」はメーターとステアリングライトにも出し、HUDだけに警告を任せない。初期案の感情的な短文はやめた。',
          ],
          [
            '工業情報化部・市場監督管理総局「スマートコネクテッドカーの型式認可・リコール・OTA管理の強化に関する通知」（2025年4月）',
            '機能の境界と安全対応を明確にし、告知義務を果たし、誇大・虚偽の宣伝をしない。',
            'HUDに常に「L2」を出し、責任が運転者にあることを示す。文字は「L2」と「運転を交代」だけで、「自動運転」などの語も、システムが何でも引き受けるという示唆も避ける。',
          ],
          [
            'GB/T 46926—2025 小型車の視界補助システムの技術要求と試験方法',
            '前方視界の透明領域の表示を区分して管理：上部領域は非静的情報のみ、不透明画素は50%以下。ARの重ね合わせは実環境と一致させる。',
            '提示はすべて視野下端の領域2に置き、領域1は0画素。バッジは輪郭だけで暗い下地を敷かない。対象に重ねる要素は追跡の信頼度が0.8未満なら隠し、方位バーだけを残す。',
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
      role: '独立完成：研究设计、调查与实验方案、交互概念、测试界面',
      methods: '场景比较调查（47 人）、界面剧本比较、实际对话 + 眼动追踪（计划）',
      next: '第 1 阶段调查已完成（47 人）· 第 2 阶段界面比较调查进行中 · 第 3 阶段眼动实验计划中。',
      description: '每个人对“高级感”这类词的理解都不一样，AI 却按大众理解来生成，两边的理解有隔阂。界面先把 AI 的理解摆出来，引导用户输入自己独特的判断，AI 再据此调整，共创的结果更接近本人想要的。',
      question: '用户输入“高级感”“温馨”等感性词，AI 往往按大众理解生成，结果趋于平庸；用户也看不到 AI 是怎么理解的，无从纠正。',
      process: [
        ['说出想法', '用自己的话描述要什么，里面常有“特别”这类说不清的词。'],
        ['看见 AI 的理解', '右侧面板把这句话拆成价值项目，写出 AI 推测的意思、推测理由和先后顺序。'],
        ['发现偏差', '对照自己的想法，找出两种偏差：意思被限定、顺序被抢先决定。'],
        ['修正', '补一句话改意思或顺序，或者改某个项目由谁判断：自己判断、和 AI 商量、交给 AI。'],
      ],
      processIcons: ['message', 'eye', 'refresh', 'check'],
      outcomes: [
        '用户把自己独特的理解补进来，个人理解和 AI 通用理解之间的隔阂变小。',
        '每个价值项目都能选由谁来判断，不必整段对话都交给 AI，也不必样样自己定。',
        '接下来用眼动实验看：用户发现偏差后，会不会回看理解面板再修改。',
      ],
      image: '/works/portfolio/ai-cocreation-steps-zh.svg',
      gallery: [
        { image: '/works/portfolio/generated/ai-cocreation-chat-v2.png', alt: '早期概念的对话界面', caption: '早期概念（AI 生成示意）：在“AI 判断 / 共同协商 / 自己判断”三种模式间选择。现方案把这三个选项放到每个价值项目上，并先显示 AI 的理解。' },
        { image: '/works/portfolio/generated/ai-story-triptych.png', alt: '早期概念的使用场景', caption: '早期概念的使用场景（AI 生成示意）。' },
        { image: '/works/portfolio/generated/ai-cocreation-overlay.png', alt: '早期概念的判断角色', caption: '早期概念的三种判断角色（AI 生成示意）。' },
      ],
      research: { sample: '第 1 阶段场景比较调查：47 人阅读同一个晚餐构想的 4 种 AI 对话（给结论 / 一起商量 × 只谈料理 / 扩展到用餐氛围），先逐个评价，再一起排序。按更看重料理还是用餐氛围，把人分成三组比较。', metrics: [
          ['47 人', '场景比较调查', '4 种对话条件 × 5 项评价'],
          ['18 / 6 / 23', '三组人数', '看重料理 / 看重用餐氛围 / 两者相当'],
          ['0.97 vs 0.43', '条件评价差', '看重料理的一组对对话方式更敏感（p=.0021）'],
        ], decisions: [
          ['让 AI 的理解看得见', '觉得能参与，不等于想继续用。所以要让用户看到 AI 把模糊的词理解成了什么、把哪件事排在了前面。'],
          ['判断分担细到每个项目', '不同的人看重的东西不同，不能整段对话一刀切，要让用户对每个价值项目分别选由谁判断。'],
        ], limitation: '看重用餐氛围的一组只有 6 人，结果只作探索参考；第 2 阶段是对画面剧本的印象评价，不是实际操作；第 3 阶段的眼动实验还在计划中。' },
      modules: [
        { kicker: '研究过程', title: '分三步验证：先找问题，再比界面，最后看真实对话', text: '第 1 阶段发现“能参与”和“想继续用”并不同步；第 2 阶段比较三种界面：只有对话记录、显示 AI 的理解、理解可编辑并能分担判断；第 3 阶段用 6 轮真实对话和眼动追踪，看用户发现偏差后会不会修改。', stacked: true, images: [
            { src: '/works/portfolio/ai-research-stages-zh.svg', alt: '研究分三个阶段：场景比较调查、界面剧本比较、实际对话与眼动', wide: true },
          ] },
        { kicker: '测试界面', title: '左边是对话，右边是 AI 的理解和判断分担', text: '眼动实验用的测试界面，还在开发中。右侧每张卡片是一个价值项目：AI 推测、推测理由、可信度和依据的轮次，下面三个按钮选由谁判断；底部可以按当前设定生成下一句例文。对话用的是模拟角色，不含真实参与者数据。', stacked: true, images: [
            { src: '/works/portfolio/ai-test-ui-turn1.jpg', alt: '测试界面：第 1 轮后右侧列出三个价值项目', caption: '第 1 轮后：AI 把用户的话拆成三个价值项目（测试版，中日混排）', wide: true },
            { src: '/works/portfolio/ai-test-ui-turn3.jpg', alt: '测试界面：第 3 轮确认偏差', caption: '第 3 轮：确认料理分量与最初标准之间的偏差（日文版）', wide: true },
          ] },
      ],
      href: '/works/ai-judgement',
    },
    {
      id: 'transparent-driving-hud',
      title: '让驾驶者继续看路的辅助驾驶 HMI',
      type: '智能驾驶 / AR-HUD 风险提示',
      category: '智能驾驶 / AR-HUD 风险提示',
      year: '2025-2026',
      period: '研究生阶段 · 智能驾驶 HMI',
      status: 'Blender 概念原型',
      role: '独立完成：场景与风险分级、HUD 显示语言、Blender 原型、法规分区自检、VR 验证方案',
      methods: 'Blender 驾驶视角模拟（Python 程序生成）、三场景 × 三方案对比、显示分区像素自检、Quest 3 + 眼动（计划）',
      next: 'Blender 概念原型完成（三个场景 × 三个方案），法规分区做了近似自检；VR 长时间行为测试还没开始。',
      description: 'L2 辅助驾驶时，风险提示只放在 HUD 视场下缘，用图形、颜色和位置告诉驾驶员“是什么、多急、在哪边”。全程只有「L2」「请接管」两处文字，视线不用离开路面。',
      question: '辅助驾驶越稳定，驾驶员越容易走神，但 L2 下责任仍在驾驶员。提示多了会挡视线、让人分心；只显示距离和车速，又不知道风险在哪边、有多急。',
      process: [
        ['只放在视场下缘', '提示都在核心视线以下，不压住本车 2–4 秒要经过的路面，也不压住风险目标本身。'],
        ['形 · 色 · 位 · 动', '胶囊徽章是唯一的容器：图形表示类别，青 / 琥珀 / 红表示紧急度，横向位置表示方位，只有红色会闪。'],
        ['渐变而不是跳变', '平静 → 发现 → 升级 → 处置 → 逐级解除。提示 0.5 秒渐入渐出，相邻两档交叉过渡，不会突然出现或消失。'],
        ['HUD 不单独报警', '「请接管」同步到仪表屏和方向盘灯带；文字只留「L2」「请接管」，不出现“自动驾驶 / 智驾”。'],
      ],
      processIcons: ['eye', 'layers', 'refresh', 'alert'],
      outcomes: [
        '主方案选 S1 方位光带：量产级 HUD 就能实现，遮挡最少，也不受目标跟踪误差影响。',
        'S2 贴地光圈更直观，但要大视场 HUD、遮挡更多；S3 是很多车的现有做法，留作对照，用来测“把提示留在前方”到底差多少。',
        '下一步在 Quest 3 里加眼动做约 20 分钟的长时间驾驶，每 5 分钟统计一次视线落在前方的比例和反应时间。',
      ],
      image: '/works/portfolio/hmi/hero.jpg',
      videos: [
        { src: '/works/portfolio/hmi/compare_ch1.mp4', poster: '/works/portfolio/hmi/compare_ch1_poster.jpg', caption: '第 1 章 儿童从停放车辆间跑出（16 秒）：半露 → 跑向车道 → 自动紧急制动至停车 → 走过后逐级解除。左上 S1、右上 S2、左下 S3，右下是风险档时间轴。' },
        { src: '/works/portfolio/hmi/compare_ch2.mp4', poster: '/works/portfolio/hmi/compare_ch2_poster.jpg', caption: '第 2 章 邻车加塞（18 秒）：打灯 → 压线并入 → 近距离切入，系统减速让行 → 车距恢复后解除。' },
        { src: '/works/portfolio/hmi/compare_ch3.mp4', poster: '/works/portfolio/hmi/compare_ch3_poster.jpg', caption: '第 3 章 前方施工（18 秒）：远处识别锥桶 → 减速但无法自行变道 → 请接管（HUD、仪表屏、方向盘灯带同步）→ 驾驶员向右变道绕行。' },
      ],
      modules: [
        { kicker: '显示语言', title: '一种容器 × 四类图形 × 三级颜色', text: '所有提示装在同一种描边中空的胶囊徽章里：图形只表示“是什么”，颜色只有三级，语义参照 ISO 2575。', stacked: true, points: [
            'L1 青色：系统发现了，告诉你“它在那里”。',
            'L2 琥珀：风险在靠近，系统开始减速或让行。',
            'L3 红色：危险或请接管，唯一会动的状态。',
            '跟踪置信度低于 0.8 时，贴合目标的元素直接隐藏，只保留粗粒度的方位光带。',
          ], images: [
            { src: '/works/portfolio/hmi/attribute.jpg', alt: '属性语言图例：胶囊徽章、四类图形与三级颜色', caption: '属性语言图例：行人 / 车辆 / 静态障碍 / 系统 × 青 / 琥珀 / 红', wide: true },
          ] },
        { kicker: '三个方案', title: '按显示位置区分，比较哪种最能把视线留在前方', text: '三个方案共用 HUD 上的「L2」状态、第 3 章的「请接管」、仪表屏和方向盘灯带，只在风险怎么显示上不同。', stacked: true, points: [
            'S1 HUD 方位光带（主方案）：视场下缘一条彩色光条，横向位置就是风险方位，徽章表示类别；目标在视场外时贴边加箭头。不跟着目标移动，不受跟踪抖动影响，遮挡最少。',
            'S2 AR 贴地光圈 + 轨迹预测：目标脚下画光圈，再画出它 0.4–2 秒后的位置；施工场景画封闭车道斜纹。最直观，但光圈本来就画在车道上，遮挡比例最高；按量产 13°×6° 视场，这些目标大多落在视场外，所以按 24°×6.5° 设计。',
            'S3 中控屏鸟瞰（对照组）：HUD 不画风险，中控屏导航界面靠驾驶员一侧弹出俯视卡片。没看中控屏的话，L3 时不知道风险方向，这正是要测试比较的取舍。',
          ], images: [
            { src: '/works/portfolio/hmi/s1_child_l3.jpg', alt: 'S1 HUD 方位光带，第 1 章 L3', caption: 'S1：红色光条在儿童方位正下方' },
            { src: '/works/portfolio/hmi/s2_merge_l3.jpg', alt: 'S2 AR 贴地光圈，第 2 章 L3', caption: 'S2：切入车辆脚下的光圈与预测箭头' },
            { src: '/works/portfolio/hmi/s3_child_l3.jpg', alt: 'S3 中控屏鸟瞰，第 1 章 L3', caption: 'S3：导航界面上弹出的俯视风险卡片' },
          ] },
        { kicker: '法规自检', title: '把 HUD 单独渲染，按分区规则统计像素', text: '按 UN R176 草案与 GB/T 46926—2025 的分区，三章各取 L1 / L2 / L3 三个时刻检测。这是项目内的近似算法，不是认证测试，也没评估夜间、眩光和眼盒偏移。', stacked: true, points: [
            '区域 1 内的提示像素都是 0；区域 2 不透明面积最大 11.4°²（限值 66°²）。',
            '遮挡核心视线的最大比例：S1 约 2%，S2 约 8%，需要真人测试确认会不会分心。',
          ], images: [
            { src: '/works/portfolio/hmi/compliance.jpg', alt: '法规与视线自检图板', caption: '法规 / 视线自检：三章 × S1、S2，S3 的风险提示在中控屏上，HUD 部分同 S1', wide: true },
          ] },
      ],
      gallery: [
        { image: '/works/portfolio/generated/hmi-story-triptych.png', alt: '早期方案三连图', caption: '早期方案（AI 生成示意）：只标出一个对象，并配一句情感化短句说明原因。对照国内法规后去掉了情感化文案，改为不用文字的图形语言，并把方案收窄到 L2。' },
      ],
      comparison: { title: '国内法规与取舍', intro: '法规管的是“驾驶员必须盯路、系统必须提醒、风挡上能放什么”，本方案只在这些边界之内做补充。分区计算另参照 UN R176 草案（ECE/TRANS/WP.29/2024/155）。依据为公开发布与解读，未逐条核对标准原文。', columns: ['法规要求（摘要）', '本方案的取舍'], rows: [
          [
            'GB 47955—2026 组合驾驶辅助系统安全要求（强制，2027.1.1 实施）',
            '驾驶员须持续观察交通并控制车辆；系统须检测脱手和视线脱离，按“监测—提醒—限制”逐级响应，并对功能边界做用户告知。',
            '提示定位为维持注意的补充，不替代法规要求的脱手、视线报警；「请接管」同步到仪表屏和方向盘灯带，不让 HUD 单独承担警告；早期方案里的情感化短句已去掉。',
          ],
          [
            '工信部、市场监管总局《关于进一步加强智能网联汽车产品准入、召回及软件在线升级管理的通知》（2025.4）',
            '明确系统功能边界和安全响应措施，严格履行告知义务，不得夸大和虚假宣传。',
            'HUD 常显「L2」，提醒驾驶员仍要负责；文字只保留「L2」「请接管」，不出现“自动驾驶 / 智驾”，也不暗示系统能接管一切。',
          ],
          [
            'GB/T 46926—2025 轻型汽车视野辅助系统技术要求及试验方法',
            '前方视野透明区域内的显示分区管理：上部区域只允许非静态信息，不透明像素占比不超过 50%；AR 叠加须与真实环境对准。',
            '所有提示放在区域 2（视场下缘），区域 1 为 0 像素；徽章描边中空，不画深色底板；贴合目标的元素在跟踪置信度低于 0.8 时隐藏，只保留方位光带。',
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

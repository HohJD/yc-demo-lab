import type { RfsRequest } from "./types";

// Scraped from https://www.ycombinator.com/rfs (all editions shown on the page). Excerpts are short quotes for attribution.
export const LATEST_EDITION = "Winter 2027";

export const EDITIONS: string[] = ["Winter 2027", "Fall 2026", "Summer 2026", "Spring 2026", "Fall 2025", "Summer 2025", "Spring 2025", "Winter 2025", "Summer 2024"];

export const EDITION_INTROS: Record<string, string> = {
  "Winter 2027": "AI's biggest bottlenecks are moving beyond the models. We're excited about a new wave of startups building the hardware, infrastructure, financial systems, and specialized software needed to bring intelligence into the real economy, from factories and data centers to government and space.",
  "Fall 2026": "AI is moving into the physical world. We're excited about a new wave of startups rebuilding the systems that power the real world, from education and healthcare to defense, finance, infrastructure, and work itself. This batch's requests come from YC partners and founders building on the frontier, and include, for the first time, one from the sitting U.S. Secretary of the Army.",
  "Summer 2026": "AI has stopped being a feature and started being the foundation. We're excited about a new wave of startups rebuilding software, services, and silicon— and pushing AI into the physical world. Several come directly from YC founders sharing what they're seeing on the frontier.",
  "Spring 2026": "The way startups are built has shifted quickly. AI-native companies can now be built faster, cheaper, and with more ambition than ever. We're excited about a range of startup ideas that span AI-native workflows, new financial primitives, modernized industrial systems, and more. This time around, a few even come directly from YC founders sharing opportunities they're seeing on the frontier.",
  "Fall 2025": "The last few years were about proving what AI can do. Now, it's about building with it. We've put together a new list of startup ideas we're especially excited about— ideas that treat AI not as a feature, but as a foundation. They reflect where we think some of the biggest opportunities are right now.",
  "Summer 2025": "2025 is indeed shaping up to be the \"year of AI agents\". We've put together a list of AI Agent startup ideas that we think are especially promising. Some of these draw attention to trends that are already in full swing, and some of them are where we think things are going next.",
  "Spring 2025": "From the AI breakthroughs of the last few months, a wave of new startup opportunities have been unlocked. We used to publish requests for startups no more than once a year, but we decided to publish this list just 3 months after our last one to help point founders to the idea spaces that have just opened up.",
  "Winter 2025": "Now is the best time in history to be a builder. We just watched giant robotic chopsticks pluck a falling skyscraper out of the sky. AI is transforming how we all work — particularly builders — faster than any technology in history. It feels like we are entering a golden age of building and we can use it to build things to make the country better. Below are some of the ideas we think will be especially cool to build in this golden age.",
  "Summer 2024": "These are the requests for startups we published in the summer of 2024, our first big list since the start of the new AI wave. The incredible explosion of AI capability has made this the best time to start a company in two decades. These are just some of the ideas we think are especially promising."
};

export const RFS_REQUESTS: RfsRequest[] = [
  {
    "slug": "startups-in-a-world-of-abundant-space-access",
    "edition": "Winter 2027",
    "title": "Startups in a World of Abundant Space Access",
    "author": "Ankit Gupta",
    "excerpt": "SpaceX is projecting a near future in which there will be 10,000 Starship launches per year.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "the-15-an-hour-expert",
    "edition": "Winter 2027",
    "title": "The $15-an-Hour Expert",
    "author": "Brad Flora",
    "excerpt": "Most people talk about AI replacing workers.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "robots-made-in-america",
    "edition": "Winter 2027",
    "title": "Robots Made in America",
    "author": "Diana Hu",
    "excerpt": "The best robot foundation models are starting to transfer skills from one robot to another, and I think the bottleneck is moving to the hardware.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "llms-that-write-well",
    "edition": "Winter 2027",
    "title": "LLMs That Write Well",
    "author": "Jared Friedman",
    "excerpt": "As LLMs have gotten better at coding and math, they've actually gotten worse at writing.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "plaid-for-government-benefits",
    "edition": "Winter 2027",
    "title": "Plaid for Government Benefits",
    "author": "Gustaf Alströmer",
    "excerpt": "If you've ever applied for government benefits, you know how it works.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "wall-street-for-the-physical-buildout",
    "edition": "Winter 2027",
    "title": "Wall Street for the Physical Buildout",
    "author": "Brad Flora",
    "excerpt": "Software is cheap to start. Robots, GPU clusters, and data centers aren't.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "vertical-foundation-models",
    "edition": "Winter 2027",
    "title": "Vertical Foundation Models",
    "author": "Diana Hu",
    "excerpt": "I think Jev hit a nerve because it gives developers a typed decision and a probability instead of generated text, without training a classifier for every task.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "ai-for-city-hall",
    "edition": "Winter 2027",
    "title": "AI for City Hall",
    "author": "Gustaf Alströmer",
    "excerpt": "If you want to build a house or start a business in America, you first need permission from your city.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "data-center-supply-chain",
    "edition": "Winter 2027",
    "title": "Data Center Supply Chain",
    "author": "Jared Friedman",
    "excerpt": "The AI data center buildout is the largest capital investment project in American history - bigger than the railroads, the highways, and the Manhattan Project - combined.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "ai-for-the-air-gapped-economy",
    "edition": "Winter 2027",
    "title": "AI for the Air-Gapped Economy",
    "author": "Brad Flora",
    "excerpt": "The most valuable data in the world isn't in the cloud.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "own-your-intelligence",
    "edition": "Winter 2027",
    "title": "Own Your Intelligence",
    "author": "Jon Xu",
    "excerpt": "Today, nearly every company building with AI rents its intelligence.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": true
  },
  {
    "slug": "the-primer",
    "edition": "Fall 2026",
    "title": "The Primer",
    "author": "Andrew Miklas",
    "excerpt": "In Neal Stephenson's The Diamond Age, a young girl is given an interactive book called A Young Lady's Illustrated Primer.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "the-future-of-american-defense",
    "edition": "Fall 2026",
    "title": "The Future of American Defense",
    "author": "Daniel P. Driscoll, US Secretary of the Army",
    "excerpt": "Warfare is at an inflection point, and the old ways of Army acquisition simply don't keep pace with modern threats.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "a-cloud-for-small-software",
    "edition": "Fall 2026",
    "title": "A Cloud for Small Software",
    "author": "Pete Koomen",
    "excerpt": "Using agents to build personal software to solve your own problems is a lot of fun.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "multiplayer-ai",
    "edition": "Fall 2026",
    "title": "Multiplayer AI",
    "author": "Aaron Epstein",
    "excerpt": "The best work tools of the last two decades won by going multiplayer.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "compute-at-sea",
    "edition": "Fall 2026",
    "title": "Compute at Sea",
    "author": "Francois Chaubard",
    "excerpt": "Artificial intelligence is running out of compute.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-powered-consumer-products-for-1-billion-people",
    "edition": "Fall 2026",
    "title": "AI-Powered Consumer Products for 1 Billion People",
    "author": "Raphael Schaad",
    "excerpt": "Every platform shift mints consumer giants.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-for-the-aging-population",
    "edition": "Fall 2026",
    "title": "AI for the Aging Population",
    "author": "Max Kolysh",
    "excerpt": "By 2030, one in five Americans will be over 65, and there's nowhere near enough people to take care of everyone.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "new-operating-systems-for-the-physical-world",
    "edition": "Fall 2026",
    "title": "New Operating Systems for the Physical World",
    "author": "Charlie Warren",
    "excerpt": "80% of the global workforce doesn't sit at a desk.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "the-best-time-to-build-in-crypto",
    "edition": "Fall 2026",
    "title": "The Best Time to Build in Crypto",
    "author": "Nemil Dalal",
    "excerpt": "It's a dispiriting moment in crypto: prices are down, hot narratives have fallen flat, and many builders are leaving.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "data-for-the-real-world",
    "edition": "Fall 2026",
    "title": "Data for the Real World",
    "author": "Austin Tindle and Diana Hu",
    "excerpt": "AI has gotten remarkably good at learning from data.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "proving-you-re-human",
    "edition": "Fall 2026",
    "title": "Proving You're Human",
    "author": "Max Kolysh",
    "excerpt": "Recently, a finance worker joined a video call with his CFO and several colleagues, and wired out $25 million.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-native-compliance-infrastructure",
    "edition": "Fall 2026",
    "title": "AI-Native Compliance Infrastructure",
    "author": "Daivik Goel",
    "excerpt": "Financial compliance is still stitched together with spreadsheets, siloed tools, and expensive headcount.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "self-maintaining-apis",
    "edition": "Fall 2026",
    "title": "Self-Maintaining APIs",
    "author": "Harsha Gaddipati",
    "excerpt": "Over the past year, I've worked with over 50 API vendors, mostly early-stage startups.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-for-low-pesticide-agriculture",
    "edition": "Summer 2026",
    "title": "AI for Low-Pesticide Agriculture",
    "author": "Garry Tan",
    "excerpt": "Modern agriculture runs on chemicals. That worked for a while.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-native-discovery-engines",
    "edition": "Summer 2026",
    "title": "AI-Native Discovery Engines",
    "author": "Jon Xu",
    "excerpt": "For centuries, scientific discovery has run on the same loop: hypothesize, experiment, interpret, repeat.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-native-service-companies",
    "edition": "Summer 2026",
    "title": "AI-Native Service Companies",
    "author": "Gustaf Alströmer",
    "excerpt": "AI models are improving really fast, and they're now able to do complex work far beyond engineering.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-personalized-medicine",
    "edition": "Summer 2026",
    "title": "AI Personalized Medicine",
    "author": "Ankit Gupta",
    "excerpt": "Intelligent agents are enabling a new level of personalization in medical care.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "company-brain",
    "edition": "Summer 2026",
    "title": "Company Brain",
    "author": "Tom Blomfield",
    "excerpt": "The biggest blocker to AI automation of companies is no longer the models, they just got so good so quickly.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "counter-swarm-defense",
    "edition": "Summer 2026",
    "title": "Counter-Swarm Defense",
    "author": "Tyler Bosmeny",
    "excerpt": "Last month, a swarm of cheap Iranian drones took out an AWS data center.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "dynamic-software-interfaces",
    "edition": "Summer 2026",
    "title": "Dynamic Software Interfaces",
    "author": "Ankit Gupta",
    "excerpt": "Before AI, users of a piece of software all interacted with the same interface.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "electronics-in-space",
    "edition": "Summer 2026",
    "title": "Electronics in Space",
    "author": "Philip Johnston",
    "excerpt": "We are about to see an absolutely huge increase in the capacity that humanity has to put things in space because of reusable rockets from SpaceX and Stoke Space.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "hardware-supply-chain",
    "edition": "Summer 2026",
    "title": "Hardware Supply Chain",
    "author": "Nicolas Dessaigne",
    "excerpt": "We are funding more and more hardware companies, from medical devices to home robots to space companies.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "industrial-capabilities-in-space",
    "edition": "Summer 2026",
    "title": "Industrial Capabilities in Space",
    "author": "Adi Oltean",
    "excerpt": "The broad idea we would like to see is developing industrial capabilities on the moon and in space, particularly extracting raw materials such as silicon, aluminum, iron, and titanium through electrolysis and 3D printing…",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "inference-chips-for-agent-workflows",
    "edition": "Summer 2026",
    "title": "Inference Chips for Agent Workflows",
    "author": "Diana Hu",
    "excerpt": "Most AI chips are designed for a world where inference means \"prompt in, response out.\" Agents don't work that way.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "saas-challengers",
    "edition": "Summer 2026",
    "title": "SaaS Challengers",
    "author": "Jared Friedman",
    "excerpt": "Everyone's talking about how AI coding means the end of SaaS.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "software-for-agents",
    "edition": "Summer 2026",
    "title": "Software for Agents",
    "author": "Aaron Epstein",
    "excerpt": "The next trillion users on the internet won't be people, they'll be AI agents.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "startups-that-want-to-sell-to-huge-companies",
    "edition": "Summer 2026",
    "title": "Startups That Want to Sell to Huge Companies",
    "author": "Harshita Arora and Brad Flora",
    "excerpt": "One of PG's wisest pieces of advice has always been that startups should sell to other startups.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "supply-chain-2-0-for-semiconductors",
    "edition": "Summer 2026",
    "title": "Supply Chain 2.0 for Semiconductors",
    "author": "Diana Hu",
    "excerpt": "A single advanced AI chip goes through about 1,400 process steps, crosses a dozen countries, and takes five months to build.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "the-ai-operating-system-for-companies",
    "edition": "Summer 2026",
    "title": "The AI Operating System for Companies",
    "author": "Diana Hu",
    "excerpt": "The best AI-native companies we're seeing have figured out something most haven't: they've made their entire company queryable.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "cursor-for-product-managers",
    "edition": "Spring 2026",
    "title": "Cursor for Product Managers",
    "author": "Andrew Miklas",
    "excerpt": "Over the last few years, we've seen an explosion of AI tools for writing code.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-native-hedge-funds",
    "edition": "Spring 2026",
    "title": "AI-Native Hedge Funds",
    "author": "Charlie Holtz",
    "excerpt": "In the 1980s, a small group of funds started using computers to analyze markets.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-native-agencies",
    "edition": "Spring 2026",
    "title": "AI-Native Agencies",
    "author": "Aaron Epstein",
    "excerpt": "Agencies have always been crazy hard to scale.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "stablecoin-financial-services",
    "edition": "Spring 2026",
    "title": "Stablecoin Financial Services",
    "author": "Daivik Goel",
    "excerpt": "Stablecoins are rapidly becoming critical infrastructure for global finance, yet much of the financial services layer remains unbuilt.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-for-government",
    "edition": "Spring 2026",
    "title": "AI for Government",
    "author": "Tom Blomfield",
    "excerpt": "The first wave of AI companies has helped businesses and normal people fill in forms and complete online applications with unprecedented speed and accuracy.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "modern-metal-mills",
    "edition": "Spring 2026",
    "title": "Modern Metal Mills",
    "author": "Zane Hengsperger",
    "excerpt": "When people talk about reindustrializing America, they usually focus on labor costs or geopolitics.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-guidance-for-physical-work",
    "edition": "Spring 2026",
    "title": "AI Guidance for Physical Work",
    "author": "David Lieb",
    "excerpt": "You know that scene in The Matrix, where Neo plugs a cable into the back of his head and wakes up a while later and says \"I know Kung Fu\"?",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "large-spatial-models",
    "edition": "Spring 2026",
    "title": "Large Spatial Models",
    "author": "Ryan McLinko",
    "excerpt": "Large language models have driven most of the recent breakthroughs in AI, but their impact has been constrained to domains that can be expressed primarily through language.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "infra-for-government-fraud-hunters",
    "edition": "Spring 2026",
    "title": "Infra for Government Fraud Hunters",
    "author": "Garry Tan",
    "excerpt": "We want to fund startups that bring government fraud investigation into the modern era.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "make-llms-easy-to-train",
    "edition": "Spring 2026",
    "title": "Make LLMs Easy to Train",
    "author": "Gabriel Birnbaum",
    "excerpt": "Training large language models is still surprisingly difficult.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "retraining-workers-for-the-ai-economy",
    "edition": "Fall 2025",
    "title": "Retraining Workers for the AI Economy",
    "author": "Harj Taggar",
    "excerpt": "We talk a lot about the AI revolution in terms of models, chips, and software.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "video-generation-as-a-primitive",
    "edition": "Fall 2025",
    "title": "Video Generation as a Primitive",
    "author": "David Lieb",
    "excerpt": "Video generation models are getting really good.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "the-first-10-person-100b-company",
    "edition": "Fall 2025",
    "title": "The First 10-person, $100B Company",
    "author": "Aaron Epstein",
    "excerpt": "Thanks to new AI tools, we believe it's now possible for small, high-agency teams – even solo founders – to build multi-billion dollar companies with as little as just $500k in funding from YC.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "infrastructure-for-multi-agent-systems",
    "edition": "Fall 2025",
    "title": "Infrastructure for Multi-Agent Systems",
    "author": "Pete Koomen",
    "excerpt": "AI agents are evolving from single-threaded loops into distributed workflows that fan out many sub‑agent calls in a single run.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-native-enterprise-software",
    "edition": "Fall 2025",
    "title": "AI Native Enterprise Software",
    "author": "Andrew Miklas",
    "excerpt": "Salesforce and ServiceNow are two of the world's largest enterprise software vendors, each making more than $10B a year in revenue, and each with a market cap of more than $200B.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "using-llms-instead-of-government-consulting",
    "edition": "Fall 2025",
    "title": "Using LLMs Instead of Government Consulting",
    "author": "Gustaf Alstromer",
    "excerpt": "The U.S. government spends over $100 billion a year on consulting.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "full-stack-ai-companies",
    "edition": "Summer 2025",
    "title": "Full-stack AI Companies",
    "author": "Jared Friedman",
    "excerpt": "At YC, I would like to fund more founders working on full-stack AI companies.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "more-design-founders",
    "edition": "Summer 2025",
    "title": "More Design Founders",
    "author": "Aaron Epstein",
    "excerpt": "More designers should be founders. Over the next decade, as new coding tools make it easier than ever to build and ship products quickly, great design is going to matter even more.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "voice-ai",
    "edition": "Summer 2025",
    "title": "Voice AI",
    "author": "Gustaf Alströmer",
    "excerpt": "Humans interact with businesses in many ways, but one way hasn't changed much in almost 100 years—and that's phone calls.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-for-scientific-advancement",
    "edition": "Summer 2025",
    "title": "AI for Scientific Advancement",
    "author": "Diana Hu",
    "excerpt": "A lot of the software tools used for scientific applications in chemistry, biology, materials science, or operations research haven't changed much in decades.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-personal-assistant",
    "edition": "Summer 2025",
    "title": "AI Personal Assistant",
    "author": "Tom Blomfield",
    "excerpt": "Despite decades of productivity apps, emails still pile up, calendars get full, and tasks remain undone.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "healthcare-ai",
    "edition": "Summer 2025",
    "title": "Healthcare AI",
    "author": "Gustaf Alströmer",
    "excerpt": "The US healthcare system is over 17% of GDP or over 4 trillion dollars.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-personal-tutor-for-everyone",
    "edition": "Summer 2025",
    "title": "AI Personal Tutor for Everyone",
    "author": "Harj Taggar",
    "excerpt": "The idea of using computers to help people learn things has been a dream of computer nerds going back to the 1940's with Vannevar Bush's Memex idea, JCR Licklider's \"Man-Computer Symbiosis\" paper in the 60's, and Alan Ka…",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "software-tools-to-make-robots",
    "edition": "Summer 2025",
    "title": "Software Tools To Make Robots",
    "author": "Diana Hu",
    "excerpt": "Robotics hasn't had its ChatGPT moment yet, but we think it's almost here.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "the-future-of-education",
    "edition": "Summer 2025",
    "title": "The Future of Education",
    "author": "Tom Blomfield",
    "excerpt": "Education is one of the world's largest and most important industries, yet it's also one of the most difficult to disrupt.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-residential-security",
    "edition": "Summer 2025",
    "title": "AI Residential Security",
    "author": "Tyler Bosmeny",
    "excerpt": "Consumers spend $20B year on home security.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "internal-agent-builder",
    "edition": "Summer 2025",
    "title": "Internal Agent Builder",
    "author": "Pete Koomen",
    "excerpt": "Soon, all companies will have one thing in common: every employee will build their own agents to automate the repetitive parts of their jobs.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-research-labs",
    "edition": "Summer 2025",
    "title": "AI Research Labs",
    "author": "Jared Friedman",
    "excerpt": "At YC, we want to fund more AI Research Labs.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-voice-assistants-for-email",
    "edition": "Summer 2025",
    "title": "AI Voice Assistants for Email",
    "author": "Tyler Bosmeny",
    "excerpt": "I want to meet teams who can help me process my inbox – with just my voice.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-for-personal-finance",
    "edition": "Summer 2025",
    "title": "AI for Personal Finance",
    "author": "Gustaf Alströmer",
    "excerpt": "Most humans are not rational about their finances.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "a-secure-ai-app-store",
    "edition": "Spring 2025",
    "title": "A Secure AI App Store",
    "author": "Garry Tan",
    "excerpt": "We want a new kind of AI App Store and OS layer that sits on your computer or phone.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "datacenters",
    "edition": "Spring 2025",
    "title": "Datacenters",
    "author": "Diana Hu",
    "excerpt": "We need more data centers that can be built faster and at a lower cost to support the infrastructure needed for AI progress.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "compliance-and-audit",
    "edition": "Spring 2025",
    "title": "Compliance and Audit",
    "author": "Tom Blomfield",
    "excerpt": "Almost 4 million people in the US and Europe (roughly 1% of the entire workforce) work in compliance and audit.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "browser-computer-automation",
    "edition": "Spring 2025",
    "title": "Browser & Computer Automation",
    "author": "Jared Friedman",
    "excerpt": "AI agents can now browse the web and use desktop applications.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-personal-staff-for-everyone",
    "edition": "Spring 2025",
    "title": "AI Personal Staff for Everyone",
    "author": "David Lieb",
    "excerpt": "Software is a proven way to bring to everyone what only the rich could afford before.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "devtools-for-ai-agents",
    "edition": "Spring 2025",
    "title": "Devtools for AI Agents",
    "author": "Nicolas Dessaigne",
    "excerpt": "In the past 2 years, we have funded many startups using AI to disrupt legacy players.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "the-future-of-software-engineering",
    "edition": "Spring 2025",
    "title": "The Future of Software Engineering",
    "author": "Pete Koomen",
    "excerpt": "Language models can already write code better than most humans.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-commercial-open-source-software-aicoss",
    "edition": "Spring 2025",
    "title": "AI Commercial Open Source Software (AICOSS)",
    "author": "Dalton Caldwell",
    "excerpt": "There is a pattern with open source and open source startups.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-coding-agents-for-hardware-optimized-code",
    "edition": "Spring 2025",
    "title": "AI Coding Agents for Hardware-Optimized Code",
    "author": "Diana Hu",
    "excerpt": "AI hardware is still constrained by software.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "b2a-software-where-the-customers-will-all-be-agents",
    "edition": "Spring 2025",
    "title": "B2A: Software Where the Customers Will All Be Agents",
    "author": "Dalton Caldwell",
    "excerpt": "A significant percentage of internet traffic consists of non-humans scraping and looking for information.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "vertical-ai-agents",
    "edition": "Spring 2025",
    "title": "Vertical AI Agents",
    "author": "Jared Friedman",
    "excerpt": "From 2005-2020, the invention of the interactive web application enabled a massive wave of B2B SaaS companies.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "inference-ai-infrastructure-in-the-world-of-test-time-compute",
    "edition": "Spring 2025",
    "title": "Inference AI Infrastructure in the World of Test-Time Compute",
    "author": "Diana Hu",
    "excerpt": "Until recently compute spend went into pre-training foundation models.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "government-software",
    "edition": "Winter 2025",
    "title": "Government Software",
    "author": "Harj Taggar",
    "excerpt": "Selling software to the government is notoriously hard and not something most builders would even think about doing.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "public-safety-technology",
    "edition": "Winter 2025",
    "title": "Public Safety Technology",
    "author": "Garry Tan",
    "excerpt": "We all deserve to be safe in our homes, and while walking around on our streets.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "manufacture-in-the-usa",
    "edition": "Winter 2025",
    "title": "Manufacture in the USA",
    "author": "Jared Friedman",
    "excerpt": "The UK became the world's richest country in the 19th century by being the workshop of the world.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "stablecoins-2-0",
    "edition": "Winter 2025",
    "title": "Stablecoins 2.0",
    "author": "Brad Flora and Harj Taggar",
    "excerpt": "At the start of this year, we posted a request for more stablecoin startups and since then things have only gotten better for stablecoins.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "llms-for-chip-design",
    "edition": "Winter 2025",
    "title": "LLMs for Chip Design",
    "author": "Garry Tan",
    "excerpt": "Each breakthrough in AI creates demand for more powerful chips to train larger models.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "fintech-2-0",
    "edition": "Winter 2025",
    "title": "Fintech 2.0",
    "author": "Dalton Caldwell",
    "excerpt": "The last two years have been a rough time for fintech startups.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "new-space-companies",
    "edition": "Winter 2025",
    "title": "New Space Companies",
    "author": "Jared Friedman and Dalton Caldwell",
    "excerpt": "The cost to reach orbit is falling fast, having fallen over 10x since SpaceX's first launch in 2006.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-aided-engineering-tools",
    "edition": "Winter 2025",
    "title": "AI-Aided Engineering Tools",
    "author": "Diana Hu",
    "excerpt": "Engineering tools for the physical world have barely evolved in decades.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "one-million-jobs-2-0",
    "edition": "Winter 2025",
    "title": "One Million Jobs 2.0",
    "author": "Dalton Caldwell",
    "excerpt": "We would like to fund startups that have a useful need to employ a million workers in a way that uniquely needs humans to do the job and there will be no structural need for the job to be done with AI.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "using-machine-learning-to-simulate-the-physical-world",
    "edition": "Summer 2024",
    "title": "Using Machine Learning to Simulate the Physical World",
    "author": "Diana Hu and Jared Friedman",
    "excerpt": "Many essential software tools work by simulating the world using known principles of physics and chemistry.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "new-defense-technology",
    "edition": "Summer 2024",
    "title": "New Defense Technology",
    "author": "Jared Friedman and Gustaf Alströmer",
    "excerpt": "The US is now engaged in large-scale conflicts in several regions that threaten to change our world.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "commercial-open-source-companies",
    "edition": "Summer 2024",
    "title": "Commercial Open Source Companies",
    "author": "Nicolas Dessaigne and Diana Hu",
    "excerpt": "Open source companies move more quickly than closed source companies.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "spatial-computing",
    "edition": "Summer 2024",
    "title": "Spatial Computing",
    "author": "Diana Hu",
    "excerpt": "Spatial computing is the use of technology to create experiences that merge the physical and digital worlds.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "new-enterprise-resource-planning-software",
    "edition": "Summer 2024",
    "title": "New Enterprise Resource Planning Software",
    "author": "Dalton Caldwell",
    "excerpt": "As companies get larger they end up adopting some software suite to help run their business.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "developer-tools-inspired-by-existing-internal-tools",
    "edition": "Summer 2024",
    "title": "Developer Tools Inspired by Existing Internal Tools",
    "author": "Dalton Caldwell",
    "excerpt": "If a developer has worked at a company with some amount of success, they have likely encountered tools or frameworks that were built by programmers at the company to help solve their own particularly painful or repetitive problems.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "llms-for-manual-back-office-processes-in-legacy-enterprises",
    "edition": "Summer 2024",
    "title": "LLMs for Manual Back Office Processes in Legacy Enterprises",
    "author": "Tom Blomfield",
    "excerpt": "Legacy enterprises have many manual back office processes that are ripe for automation with LLMs.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "ai-to-build-enterprise-software",
    "edition": "Summer 2024",
    "title": "AI to Build Enterprise Software",
    "author": "Harj Taggar",
    "excerpt": "Enterprise software has a reputation among smart programmers as being boring to work on.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "stablecoin-finance",
    "edition": "Summer 2024",
    "title": "Stablecoin Finance",
    "author": "Brad Flora",
    "excerpt": "Stablecoins are digital currencies that peg their value to some external reference.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "a-way-to-end-cancer",
    "edition": "Summer 2024",
    "title": "A Way to End Cancer",
    "author": "Surbhi Sarna",
    "excerpt": "The technology to diagnose cancer at an early stage already exists.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "foundation-models-for-biological-systems",
    "edition": "Summer 2024",
    "title": "Foundation Models for Biological Systems",
    "author": "Surbhi Sarna",
    "excerpt": "The vast majority of scientific innovation fails – either on the bench during early experimentation or while in clinical trials.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "the-managed-service-organization-model-for-healthcare",
    "edition": "Summer 2024",
    "title": "The Managed Service Organization Model for Healthcare",
    "author": "Surbhi Sarna",
    "excerpt": "Private equity is consuming small and large private clinics all over the country.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "eliminating-middlemen-in-healthcare",
    "edition": "Summer 2024",
    "title": "Eliminating Middlemen in Healthcare",
    "author": "Surbhi Sarna",
    "excerpt": "The US spends more money per person on healthcare than any other developed nation, yet our patient outcomes are no better.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "small-fine-tuned-models-as-an-alternative-to-giant-generic-ones",
    "edition": "Summer 2024",
    "title": "Small Fine-tuned Models as an Alternative to Giant Generic Ones",
    "author": "Nicolas Dessaigne",
    "excerpt": "Giant generic models with a lot of parameters are very impressive.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "explainable-ai",
    "edition": "Summer 2024",
    "title": "Explainable AI",
    "author": "Diana Hu and Nicolas Dessaigne",
    "excerpt": "Would you trust an AI to diagnose you? Would you swear that a model is unbiased?",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  },
  {
    "slug": "applying-machine-learning-to-robotics",
    "edition": "Summer 2024",
    "title": "Applying Machine Learning to Robotics",
    "author": "Diana Hu and Jared Friedman",
    "excerpt": "Robotics hasn't yet had its GPT moment, but we think it's close.",
    "sourceUrl": "https://www.ycombinator.com/rfs",
    "latest": false
  }
];

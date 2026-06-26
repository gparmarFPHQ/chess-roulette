// ============================================================================
// MBA Case Study Platform — Coffee Wars in India Sample Case Data
// ============================================================================
// Full structured knowledge base for "Coffee Wars in India: Café Coffee Day
// Takes On the Global Brands" (HBS 9-714-527).
//
// This file is a drop-in scaffold. In production, the ingestion pipeline parses
// a teacher-edition PDF and produces the same structure automatically.
// ============================================================================

import type { KnowledgeBase, CaseChunk, CharacterAccessMap, PersonaProfile } from './types';
import type { Exhibit } from '../features/exhibits/types';

const chunks: CaseChunk[] = [
  {
    id: 'ccd-001',
    text:     `On January 30, 2012, V.G. Siddhartha, founder and chairman of Amalgamated Bean Coffee (ABC) Trading Company and Café Coffee Day (CCD), sipped a cup of freshly brewed coffee in his Bangalore office. Outside, the Indian coffee market was simmering with unprecedented competition. Starbucks, the global giant, had just announced a 50:50 joint venture with the Tata Group to enter India. The announcement followed years of speculation and sent ripples through the industry. For Siddhartha, who had spent more than two decades building India's largest home-grown coffee chain, the entry of Starbucks was both a threat and a validation of the market he had pioneered.`,
    visibility: 'student',
    topic: 'market entry',
    section: 'CCD\'s Business Model',
    characterAttribution: 'all',
    attributionMode: 'narrator',
    pageNumber: 1,
  },
  {
    id: 'ccd-002',
    text:     `Café Coffee Day, the flagship retail brand of ABC, operated more than 1,400 cafés across India. Founded in 1996, CCD had created the café culture in India almost single-handedly. Its value proposition was simple: affordable coffee, youthful ambiance, and a place for urban Indians to socialize. CCD's average ticket size was about ₹100, a fraction of what global chains charged abroad. Yet the chain had survived, scaled, and even attracted private equity investment. Now, with Starbucks opening stores at premium locations in Delhi and Mumbai, the question on everyone's mind was whether CCD could hold its ground against a competitor with legendary brand power and deep pockets.`,
    visibility: 'student',
    topic: 'competitive landscape',
    section: 'CCD\'s Business Model',
    characterAttribution: 'all',
    attributionMode: 'narrator',
    pageNumber: 1,
  },
  {
    id: 'ccd-003',
    text:     `V.G. Siddhartha came from a family of coffee planters in Chikmagalur, Karnataka. In the early 1990s, he noticed that Indian coffee farmers received a fraction of the price that consumers paid abroad. He decided to change that. In 1993, he bought a coffee curing unit with borrowed money and began exporting directly to international buyers. His timing was perfect: global coffee prices spiked in the mid-1990s, and his company, ABC, grew rapidly. By the late 1990s, ABC was one of India's largest coffee exporters.`,
    visibility: 'student',
    topic: 'founder background',
    section: 'V.G. Siddhartha and CCD\'s Birth',
    characterAttribution: 'V.G. Siddhartha',
    attributionMode: 'narrator',
    pageNumber: 2,
  },
  {
    id: 'ccd-004',
    text:     `"The coffee business was in my blood," Siddhartha often said. "But I wanted to own the entire value chain — from bean to cup." This vision led him to open the first Café Coffee Day outlet on Brigade Road in Bangalore in 1996. The café was an immediate hit with young Indians who had limited options for informal socializing outside the home. Siddhartha expanded aggressively, opening new stores in cities, on highways, in bookstores, and even in corporate campuses.`,
    visibility: 'student',
    topic: 'founder vision',
    section: 'V.G. Siddhartha and CCD\'s Birth',
    characterAttribution: 'V.G. Siddhartha',
    attributionMode: 'character',
    pageNumber: 2,
  },
  {
    id: 'ccd-005',
    text:     `Siddhartha was known for his ambition and risk appetite. He had raised capital from private equity firms, including KKR, and dreamed of taking CCD global. In an interview, he said, "We want to be among the top three coffee chains in the world." He believed that CCD's vertical integration — owning coffee plantations, curing plants, roasting facilities, and retail outlets — gave it a cost advantage that no global competitor could easily replicate.`,
    visibility: 'student',
    topic: 'strategic ambition',
    section: 'V.G. Siddhartha and CCD\'s Birth',
    characterAttribution: 'V.G. Siddhartha',
    attributionMode: 'character',
    pageNumber: 3,
  },
  {
    id: 'ccd-006',
    text:     `CCD's business model rested on three pillars: vertical integration, affordable pricing, and rapid expansion. The company sourced a significant portion of its coffee from its own plantations in Chikmagalur, reducing raw material costs. It also operated its own roasting facilities and sold packaged coffee through retail channels. This integration allowed CCD to price a cappuccino at roughly ₹50-70, while Starbucks charged ₹150-250 abroad. In India, CCD targeted mass-market consumers rather than premium coffee connoisseurs.`,
    visibility: 'student',
    topic: 'business model',
    section: 'CCD\'s Business Model',
    characterAttribution: 'all',
    attributionMode: 'narrator',
    pageNumber: 4,
  },
  {
    id: 'ccd-007',
    text:     `The company operated multiple formats. A typical CCD café was 1,000-1,500 square feet, with 30-40 seats, wooden furniture, music, and a relaxed atmosphere. CCD also experimented with lounge formats such as CCD Square, which offered premium food and beverages in larger spaces. In addition, it ran smaller kiosks in high-traffic locations like airports and shopping malls. This multi-format strategy allowed CCD to enter locations where a full café would not be economically viable.`,
    visibility: 'student',
    topic: 'store formats',
    section: 'CCD\'s Business Model',
    characterAttribution: 'all',
    attributionMode: 'narrator',
    pageNumber: 4,
  },
  {
    id: 'ccd-008',
    text:     `Venu Madhav, director of CCD, explained the rationale: "We have a format for every location and every consumer segment. Our standard café works in neighborhoods and colleges. Our lounges target professionals and shoppers. Our kiosks serve travelers and office workers." This flexibility gave CCD broad geographic coverage, but it also created operational complexity. Each format required different menus, staffing, and capital investments.`,
    visibility: 'student',
    topic: 'format strategy',
    section: 'CCD\'s Business Model',
    characterAttribution: 'Venu Madhav',
    attributionMode: 'character',
    pageNumber: 5,
  },
  {
    id: 'ccd-009',
    text:     `CCD's marketing positioned it as the default hangout for young India. Its tagline, "A lot can happen over coffee," became part of urban youth culture. The brand sponsored music festivals, college events, and television shows. Store interiors used warm colors, comfortable seating, and contemporary music to create an inviting environment. Ramakrishnan, CCD's president of marketing, emphasized that the brand stood for affordability and accessibility rather than luxury.`,
    visibility: 'student',
    topic: 'marketing',
    section: 'Marketing and Brand Positioning',
    characterAttribution: 'Ramakrishnan',
    attributionMode: 'character',
    pageNumber: 5,
  },
  {
    id: 'ccd-010',
    text:     `"We don't sell coffee. We sell an experience," said Ramakrishnan. "Our customers are college students, young professionals, and couples who want a place to meet without spending a lot. If we raise prices, we lose them." This philosophy kept CCD's prices low but also put pressure on margins. The average spend per visit was roughly ₹100, compared with estimates of ₹300-400 for a typical Starbucks visit globally.`,
    visibility: 'student',
    topic: 'pricing philosophy',
    section: 'Marketing and Brand Positioning',
    characterAttribution: 'Ramakrishnan',
    attributionMode: 'character',
    pageNumber: 6,
  },
  {
    id: 'ccd-011',
    text:     `Jayaraj Hubli, CCD's chief financial officer, managed the economics of the chain closely. A typical CCD café required an investment of ₹3-4 million, including store interiors, equipment, and initial working capital. The company aimed for a payback period of three to four years. Rent accounted for 20-25% of revenues in prime locations, while food and beverage costs were roughly 30-35%. Labor costs were relatively low by global standards, at about 12-15% of revenues.`,
    visibility: 'student',
    topic: 'unit economics',
    section: 'Financial Performance',
    characterAttribution: 'Jayaraj Hubli',
    attributionMode: 'character',
    pageNumber: 7,
  },
  {
    id: 'ccd-012',
    text:     `Hubli noted that vertical integration helped on the cost side but created other challenges. "We have to manage plantations, curing, roasting, logistics, and retail. The complexity is high, but it gives us control over quality and margins. Our EBITDA margins are thin, around 12-15%, because we choose volume over premium pricing." He acknowledged that rising real estate costs in Indian cities were squeezing profitability, especially in Delhi and Mumbai.`,
    visibility: 'student',
    topic: 'margins',
    section: 'Financial Performance',
    characterAttribution: 'Jayaraj Hubli',
    attributionMode: 'character',
    pageNumber: 7,
  },
  {
    id: 'ccd-013',
    text:     `Starbucks Corporation, headquartered in Seattle, was the world's largest coffeehouse chain, with more than 17,000 stores across 55 countries by 2011. Founded in 1971, the company had built a powerful brand around premium coffee, consistent store experience, and the "third place" concept — a comfortable environment between home and work. Starbucks was known for high-quality arabica coffee, trained baristas, and premium prices. Its brand alone allowed it to charge significantly more than competitors in most markets.`,
    visibility: 'student',
    topic: 'competitor background',
    section: 'Starbucks: The Global Challenger',
    characterAttribution: 'all',
    attributionMode: 'narrator',
    pageNumber: 8,
  },
  {
    id: 'ccd-014',
    text:     `Starbucks entered international markets through a mix of company-owned stores and joint ventures. In China, it partnered with local companies to navigate real estate and regulations. In Japan, it worked with Sazaby League. For India, Starbucks chose a 50:50 joint venture with Tata Global Beverages, part of the Tata Group, one of India's largest conglomerates. The partnership gave Starbucks local expertise, real estate access through Tata properties, and the credibility of an Indian business icon.`,
    visibility: 'student',
    topic: 'market entry strategy',
    section: 'Starbucks: The Global Challenger',
    characterAttribution: 'all',
    attributionMode: 'narrator',
    pageNumber: 9,
  },
  {
    id: 'ccd-015',
    text:     `Sushant Dash, senior director of marketing at Tata Starbucks, described the India opportunity as unique. "India is a tea-drinking country, but the younger generation is open to coffee as a lifestyle choice. We are not just selling coffee; we are bringing a global experience to Indian consumers." He emphasized that Starbucks India would target affluent urban professionals and aspirational young consumers in Delhi, Mumbai, Bangalore, and Pune.`,
    visibility: 'student',
    topic: 'target market',
    section: 'Tata Starbucks in India',
    characterAttribution: 'Sushant Dash',
    attributionMode: 'character',
    pageNumber: 10,
  },
  {
    id: 'ccd-016',
    text:     `Dash also made it clear that Starbucks would not compete on price. "We are a premium brand. Our prices will reflect the quality of our coffee, our store experience, and the Starbucks brand. We are not trying to match CCD's prices. We are offering something different." The first Starbucks India store opened in Mumbai in October 2012, months after the case timeline, with prices roughly two to three times higher than CCD's.`,
    visibility: 'student',
    topic: 'pricing strategy',
    section: 'Tata Starbucks in India',
    characterAttribution: 'Sushant Dash',
    attributionMode: 'character',
    pageNumber: 10,
  },
  {
    id: 'ccd-017',
    text:     `Harish Bijoor, CEO of Harish Bijoor Consultants and a former vice president at Tata Coffee, offered an industry perspective. "CCD has done the hard work of building the café habit in India. They educated the consumer. Starbucks will benefit from that education. But CCD has a formidable advantage: it understands the Indian consumer, it has locations everywhere, and it can price aggressively."`,
    visibility: 'student',
    topic: 'industry analysis',
    section: 'Industry Perspective',
    characterAttribution: 'Harish Bijoor',
    attributionMode: 'expert',
    pageNumber: 11,
  },
  {
    id: 'ccd-018',
    text:     `Bijoor also cautioned that Starbucks would not find India easy. "Real estate is expensive, consumer tastes vary by region, and Indians are value-conscious. A premium positioning works in South Mumbai and South Delhi, but scaling beyond the top tier-1 cities is not straightforward. CCD's advantage is breadth; Starbucks' advantage is aspiration." He believed the two chains could coexist, serving different segments of the market.`,
    visibility: 'student',
    topic: 'market segmentation',
    section: 'Industry Perspective',
    characterAttribution: 'Harish Bijoor',
    attributionMode: 'expert',
    pageNumber: 11,
  },
  {
    id: 'ccd-019',
    text:     `As 2012 began, CCD's management debated how aggressively to respond to Starbucks. Some argued for a price war and rapid store expansion to maintain dominance. Others believed CCD should upgrade its stores, improve food quality, and move slightly upmarket to protect margins. Siddhartha had to balance short-term market share defense with long-term profitability. The wrong move could erode the brand or the balance sheet.`,
    visibility: 'student',
    topic: 'strategic decision',
    section: 'The Strategic Challenge',
    characterAttribution: 'all',
    attributionMode: 'narrator',
    pageNumber: 12,
  },
  {
    id: 'ccd-020',
    text:     `Venu Madhav favored differentiation rather than direct confrontation. "We should not try to be Starbucks. We should be the best version of CCD. That means better coffee, better food, consistent service, and a clear value proposition. If we chase Starbucks upmarket, we lose our identity and our customers." His view was that CCD should selectively upgrade lounges and flagship stores while keeping the core format affordable.`,
    visibility: 'student',
    topic: 'differentiation strategy',
    section: 'The Strategic Challenge',
    characterAttribution: 'Venu Madhav',
    attributionMode: 'character',
    pageNumber: 12,
  },
  {
    id: 'ccd-021',
    text:     `Ramakrishnan saw the marketing battle as central. "Starbucks will win on aspiration if we let them. We need to remind consumers why they love CCD. We are Indian, we are accessible, and we are everywhere. Our campaign should reinforce youth, friendship, and value. We cannot out-spend Starbucks, but we can out-localize them." He proposed targeted campaigns around college festivals, music, and cricket.`,
    visibility: 'student',
    topic: 'marketing response',
    section: 'The Strategic Challenge',
    characterAttribution: 'Ramakrishnan',
    attributionMode: 'character',
    pageNumber: 13,
  },
  {
    id: 'ccd-022',
    text:     `Hubli was cautious about costly upgrades. "Every rupee we spend on premium interiors is a rupee we cannot spend on new stores. Our return on investment must be clear. If we raise prices, will volumes hold? If we open too fast, will we over-extend ourselves?" He wanted a disciplined financial plan before approving any large strategic shift. His preference was to improve operational efficiency and selective upgrades in high-competition markets.`,
    visibility: 'student',
    topic: 'financial caution',
    section: 'The Strategic Challenge',
    characterAttribution: 'Jayaraj Hubli',
    attributionMode: 'character',
    pageNumber: 13,
  },
  {
    id: 'ccd-023',
    text:     `Siddhartha sat back and considered the options. CCD had built a market from scratch, educated consumers, and created a beloved brand. Starbucks brought global cachet, premium positioning, and a powerful local partner in Tata. The battle would be fought across pricing, location, brand perception, and customer experience. The decisions Siddhartha and his team made in the coming months would determine whether Café Coffee Day remained India's coffee leader or became a cautionary tale about home-grown champions facing global giants.`,
    visibility: 'student',
    topic: 'conclusion',
    section: 'Conclusion',
    characterAttribution: 'all',
    attributionMode: 'narrator',
    pageNumber: 14,
  },
  {
    id: 'ccd-024',
    text:     `[INSTRUCTOR ONLY] Teaching Note: The case is designed to explore competitive strategy in emerging markets. Key learning objectives include: (1) analyzing how a local incumbent responds to a global entrant; (2) evaluating the trade-offs between price, differentiation, and operational efficiency; (3) understanding the role of vertical integration in cost advantage; (4) assessing market segmentation and brand positioning in a price-sensitive emerging market. Recommended class discussion should push students to articulate what CCD should do next and why.`,
    visibility: 'instructor',
    topic: 'teaching objectives',
    section: 'Teaching Note',
    characterAttribution: 'instructor',
    attributionMode: 'instructor',
    pageNumber: 15,
  },
  {
    id: 'ccd-025',
    text:     `[INSTRUCTOR ONLY] Discussion Questions and Suggested Answers: Q1. Why has CCD succeeded so far? A: First-mover advantage, vertical integration, affordable pricing, brand resonance with youth. Q2. What is Starbucks' likely strategy in India? A: Premium positioning, top-tier cities, Tata partnership, brand aspiration. Q3. Should CCD cut prices to defend market share? A: No — it would destroy margins and brand identity. Better to differentiate and improve value. Q4. What should Siddhartha do? A: Invest selectively in flagship stores and lounges, improve food/menu, defend core affordable positioning, expand in tier-2 cities where Starbucks is unlikely to go quickly.`,
    visibility: 'instructor',
    topic: 'discussion answers',
    section: 'Teaching Note',
    characterAttribution: 'instructor',
    attributionMode: 'instructor',
    pageNumber: 15,
  }
];

const personaProfiles: PersonaProfile[] = [
  {
    id: 'siddhartha',
    name: 'V.G. Siddhartha',
    role: 'Founder and Chairman',
    company: 'Amalgamated Bean Coffee / Café Coffee Day',
    personality:     `Visionary, ambitious, and confident. Speaks with the authority of a founder who built a market from scratch. Proud of vertical integration and long-term thinking. Aggressive about growth but thoughtful about brand.`,
    goals: [
          "Defend CCD's market leadership in India",
          "Maintain CCD's unique value chain from bean to cup",
          "Scale CCD domestically and internationally",
          "Respond to Starbucks without destroying margins"
        ],
    stakeInSituation:     `Siddhartha founded CCD and has built it into India's largest coffee chain. Starbucks' entry threatens his legacy, valuation, and expansion plans.`,
    sampleQuotes: [
          "\"The coffee business was in my blood. But I wanted to own the entire value chain — from bean to cup.\"",
          "\"We want to be among the top three coffee chains in the world.\""
        ],
    informationScope:     `Full access to CCD history, strategy, financials, vertical integration, expansion plans, and personal background. Knows public information about Starbucks but not Tata Starbucks' internal plans or detailed cost structures.`,
  },
  {
    id: 'madhav',
    name: 'Venu Madhav',
    role: 'Director',
    company: 'Café Coffee Day',
    personality:     `Strategic, balanced, and pragmatic. Thinks in terms of brand identity and sustainable differentiation. Cautious about mimicking competitors.`,
    goals: [
          "Protect CCD's brand identity",
          "Advocate for selective upgrading rather than broad upmarket shift",
          "Ensure CCD does not over-extend operationally"
        ],
    stakeInSituation:     `As a senior director, Madhav is responsible for strategic direction and store format decisions. His credibility depends on making CCD stronger, not just bigger.`,
    sampleQuotes: [
          "\"We have a format for every location and every consumer segment.\"",
          "\"We should not try to be Starbucks. We should be the best version of CCD.\""
        ],
    informationScope:     `Knows CCD strategy, store formats, multi-format rationale, and general competitive landscape. Does not have access to Starbucks' internal pricing or Tata's real estate plans.`,
  },
  {
    id: 'ramakrishnan',
    name: 'Ramakrishnan',
    role: 'President of Marketing',
    company: 'Café Coffee Day',
    personality:     `Youthful, brand-focused, and protective of CCD's mass-market positioning. Believes in emotional connection and localization over premium aspiration.`,
    goals: [
          "Keep CCD relevant and aspirational for young Indians",
          "Defend affordability as a core brand promise",
          "Out-localize Starbucks through targeted campaigns"
        ],
    stakeInSituation:     `Responsible for brand perception and customer acquisition. Starbucks' aspirational appeal directly challenges CCD's youth positioning.`,
    sampleQuotes: [
          "\"We don't sell coffee. We sell an experience.\"",
          "\"Our customers are college students, young professionals, and couples who want a place to meet without spending a lot.\""
        ],
    informationScope:     `Expert in CCD's marketing strategy, pricing philosophy, customer segments, and brand campaigns. Limited insight into Starbucks' internal marketing budgets.`,
  },
  {
    id: 'hubli',
    name: 'Jayaraj Hubli',
    role: 'Chief Financial Officer',
    company: 'Café Coffee Day',
    personality:     `Analytical, disciplined, and cost-conscious. Focuses on unit economics, margins, and capital efficiency. Skeptical of expensive upgrades without clear ROI.`,
    goals: [
          "Preserve CCD's thin but positive margins",
          "Improve operational efficiency",
          "Ensure disciplined capital allocation",
          "Avoid margin-destroying price wars"
        ],
    stakeInSituation:     `CFO accountable for financial performance and investor returns. Any strategic response to Starbucks must be financially defensible.`,
    sampleQuotes: [
          "\"We have to manage plantations, curing, roasting, logistics, and retail. The complexity is high, but it gives us control over quality and margins.\"",
          "\"Every rupee we spend on premium interiors is a rupee we cannot spend on new stores.\""
        ],
    informationScope:     `Full access to CCD's financials, unit economics, cost structure, margins, and capital requirements. Does not know Starbucks' internal cost structure or Tata's investment commitments.`,
  },
  {
    id: 'dash',
    name: 'Sushant Dash',
    role: 'Senior Director of Marketing',
    company: 'Tata Starbucks',
    personality:     `Confident, premium-oriented, and deliberate. Believes in global brand power and the India opportunity. Does not apologize for higher prices.`,
    goals: [
          "Establish Starbucks as India's premier coffee brand",
          "Target affluent urban professionals and aspirational youth",
          "Build the Starbucks experience in top Indian cities"
        ],
    stakeInSituation:     `Leading marketing for a new joint venture that carries the reputation of both Starbucks and Tata. Success in India is strategically important.`,
    sampleQuotes: [
          "\"India is a tea-drinking country, but the younger generation is open to coffee as a lifestyle choice.\"",
          "\"We are a premium brand. Our prices will reflect the quality of our coffee, our store experience, and the Starbucks brand.\""
        ],
    informationScope:     `Knows Starbucks' global strategy, India market entry approach, target segments, and premium positioning. Public information only about CCD; no access to CCD internal financials.`,
  },
  {
    id: 'bijoor',
    name: 'Harish Bijoor',
    role: 'CEO',
    company: 'Harish Bijoor Consultants (former Tata Coffee VP)',
    personality:     `Independent, experienced, and measured. Offers an external industry view. Balances respect for both CCD and Starbucks without bias.`,
    goals: [
          "Provide objective industry analysis",
          "Highlight the strengths and risks of each player",
          "Assess long-term market structure and segmentation"
        ],
    stakeInSituation:     `An industry commentator and consultant. His credibility depends on balanced, insightful analysis rather than advocacy.`,
    sampleQuotes: [
          "\"CCD has done the hard work of building the café habit in India. They educated the consumer. Starbucks will benefit from that education.\"",
          "\"CCD's advantage is breadth; Starbucks' advantage is aspiration.\""
        ],
    informationScope:     `Broad industry knowledge, public financials, market trends, and strategic observations. No access to confidential internal plans of either company.`,
  }
];

const characters: CharacterAccessMap[] = [
  {
    characterId: 'siddhartha',
    characterName: 'V.G. Siddhartha',
    role: 'Founder and Chairman, CCD',
    personality:     `Visionary, ambitious, and proud of building CCD from bean to cup.`,
    accessibleChunkIds: [
          "ccd-001",
          "ccd-002",
          "ccd-003",
          "ccd-004",
          "ccd-005",
          "ccd-006",
          "ccd-007",
          "ccd-008",
          "ccd-009",
          "ccd-010",
          "ccd-011",
          "ccd-012",
          "ccd-013",
          "ccd-014",
          "ccd-015",
          "ccd-016",
          "ccd-017",
          "ccd-018",
          "ccd-019",
          "ccd-020",
          "ccd-021",
          "ccd-022",
          "ccd-023"
        ],
    inaccessibleChunkIds: [
          "ccd-024",
          "ccd-025"
        ],
  },
  {
    characterId: 'madhav',
    characterName: 'Venu Madhav',
    role: 'Director, CCD',
    personality:     `Strategic, balanced, focused on brand identity and store formats.`,
    accessibleChunkIds: [
          "ccd-001",
          "ccd-002",
          "ccd-006",
          "ccd-007",
          "ccd-008",
          "ccd-009",
          "ccd-010",
          "ccd-011",
          "ccd-012",
          "ccd-013",
          "ccd-014",
          "ccd-015",
          "ccd-016",
          "ccd-017",
          "ccd-018",
          "ccd-019",
          "ccd-020",
          "ccd-023"
        ],
    inaccessibleChunkIds: [
          "ccd-003",
          "ccd-004",
          "ccd-005",
          "ccd-021",
          "ccd-022",
          "ccd-024",
          "ccd-025"
        ],
  },
  {
    characterId: 'ramakrishnan',
    characterName: 'Ramakrishnan',
    role: 'President of Marketing, CCD',
    personality:     `Brand-focused, youth-oriented, protective of affordable positioning.`,
    accessibleChunkIds: [
          "ccd-001",
          "ccd-002",
          "ccd-006",
          "ccd-007",
          "ccd-009",
          "ccd-010",
          "ccd-013",
          "ccd-014",
          "ccd-015",
          "ccd-016",
          "ccd-017",
          "ccd-018",
          "ccd-019",
          "ccd-021",
          "ccd-023"
        ],
    inaccessibleChunkIds: [
          "ccd-003",
          "ccd-004",
          "ccd-005",
          "ccd-008",
          "ccd-011",
          "ccd-012",
          "ccd-020",
          "ccd-022",
          "ccd-024",
          "ccd-025"
        ],
  },
  {
    characterId: 'hubli',
    characterName: 'Jayaraj Hubli',
    role: 'Chief Financial Officer, CCD',
    personality:     `Analytical, cost-conscious, disciplined about ROI and margins.`,
    accessibleChunkIds: [
          "ccd-001",
          "ccd-002",
          "ccd-006",
          "ccd-007",
          "ccd-011",
          "ccd-012",
          "ccd-013",
          "ccd-014",
          "ccd-015",
          "ccd-016",
          "ccd-017",
          "ccd-018",
          "ccd-019",
          "ccd-022",
          "ccd-023"
        ],
    inaccessibleChunkIds: [
          "ccd-003",
          "ccd-004",
          "ccd-005",
          "ccd-008",
          "ccd-009",
          "ccd-010",
          "ccd-020",
          "ccd-021",
          "ccd-024",
          "ccd-025"
        ],
  },
  {
    characterId: 'dash',
    characterName: 'Sushant Dash',
    role: 'Senior Director of Marketing, Tata Starbucks',
    personality:     `Confident, premium-oriented, focused on brand experience.`,
    accessibleChunkIds: [
          "ccd-001",
          "ccd-002",
          "ccd-006",
          "ccd-007",
          "ccd-013",
          "ccd-014",
          "ccd-015",
          "ccd-016",
          "ccd-017",
          "ccd-018",
          "ccd-023"
        ],
    inaccessibleChunkIds: [
          "ccd-003",
          "ccd-004",
          "ccd-005",
          "ccd-008",
          "ccd-009",
          "ccd-010",
          "ccd-011",
          "ccd-012",
          "ccd-019",
          "ccd-020",
          "ccd-021",
          "ccd-022",
          "ccd-024",
          "ccd-025"
        ],
  },
  {
    characterId: 'bijoor',
    characterName: 'Harish Bijoor',
    role: 'CEO, Harish Bijoor Consultants',
    personality:     `Independent industry expert with balanced, external perspective.`,
    accessibleChunkIds: [
          "ccd-001",
          "ccd-002",
          "ccd-006",
          "ccd-007",
          "ccd-013",
          "ccd-014",
          "ccd-015",
          "ccd-016",
          "ccd-017",
          "ccd-018",
          "ccd-019",
          "ccd-023"
        ],
    inaccessibleChunkIds: [
          "ccd-003",
          "ccd-004",
          "ccd-005",
          "ccd-008",
          "ccd-009",
          "ccd-010",
          "ccd-011",
          "ccd-012",
          "ccd-020",
          "ccd-021",
          "ccd-022",
          "ccd-024",
          "ccd-025"
        ],
  }
];

const BURGUNDY = '#8B1A4A';
const BURGUNDY_LIGHT = '#C2185B';
const GOLD = '#D4A843';
const STEEL_BLUE = '#4682B4';
const TEAL = '#2A9D8F';

const exhibits: Exhibit[] = [
  {
        id: 'exhibit-1',
        exhibitNumber: 1,
        title: 'India\'s Coffee Market',
        type: 'table',
        description: 'Production, exports, and domestic consumption of coffee in India (2006-2011).',
        data: {
      columns: [
        "Year",
        "Production (000 tons)",
        "Exports (000 tons)",
        "Domestic (000 tons)"
      ],
      rows: [
        {
          "Year": 2006,
          "Production (000 tons)": 288,
          "Exports (000 tons)": 213,
          "Domestic (000 tons)": 75
        },
        {
          "Year": 2007,
          "Production (000 tons)": 294,
          "Exports (000 tons)": 219,
          "Domestic (000 tons)": 75
        },
        {
          "Year": 2008,
          "Production (000 tons)": 262,
          "Exports (000 tons)": 186,
          "Domestic (000 tons)": 76
        },
        {
          "Year": 2009,
          "Production (000 tons)": 289,
          "Exports (000 tons)": 205,
          "Domestic (000 tons)": 84
        },
        {
          "Year": 2010,
          "Production (000 tons)": 302,
          "Exports (000 tons)": 215,
          "Domestic (000 tons)": 87
        },
        {
          "Year": 2011,
          "Production (000 tons)": 314,
          "Exports (000 tons)": 220,
          "Domestic (000 tons)": 94
        }
      ]
    },
        caption: 'Coffee production in India has grown steadily, with exports accounting for about 70% of output.',
        source: 'National Coffee Promotion Council, India',
        pageNumber: 15,
  },
  {
        id: 'exhibit-2',
        exhibitNumber: 2,
        title: 'India\'s Specialist Coffee Chains',
        type: 'table',
        description: 'Major coffee chain operators in India as of 2011-2012.',
        data: {
      columns: [
        "Chain",
        "Approx. Stores",
        "Positioning",
        "Owner"
      ],
      rows: [
        {
          "Chain": "Café Coffee Day",
          "Approx. Stores": 1400,
          "Positioning": "Mass-market youth",
          "Owner": "Amalgamated Bean Coffee"
        },
        {
          "Chain": "Barista Lavazza",
          "Approx. Stores": 200,
          "Positioning": "Premium café",
          "Owner": "Lavazza / private equity"
        },
        {
          "Chain": "Costa Coffee",
          "Approx. Stores": 80,
          "Positioning": "Premium international",
          "Owner": "Costa / JUBILANT"
        },
        {
          "Chain": "Starbucks",
          "Approx. Stores": 0,
          "Positioning": "Super-premium",
          "Owner": "Tata Starbucks JV"
        }
      ]
    },
        caption: 'CCD dominates by store count, while international chains target premium segments.',
        source: 'Company filings and industry reports',
        pageNumber: 15,
  },
  {
        id: 'exhibit-3',
        exhibitNumber: 3,
        title: 'Global Coffee Market Snapshot',
        type: 'chart',
        description: 'Global coffee consumption by region.',
        data: {
      columns: ["Region", "Share (%)"],
      rows: [
        { "Region": "Europe", "Share (%)": 32 },
        { "Region": "North America", "Share (%)": 24 },
        { "Region": "Asia Pacific", "Share (%)": 22 },
        { "Region": "Latin America", "Share (%)": 12 },
        { "Region": "Others", "Share (%)": 10 }
      ],
      chartType: 'pie',
      xKey: 'Region',
      yKeys: ['Share (%)'],
      colors: [BURGUNDY, BURGUNDY_LIGHT, GOLD, STEEL_BLUE, TEAL]
    },
        caption: 'Europe and North America remain the largest coffee-consuming regions, but Asia Pacific is the fastest-growing.',
        source: 'International Coffee Organization',
        pageNumber: 16,
  },
  {
        id: 'exhibit-4',
        exhibitNumber: 4,
        title: 'Economics of a CCD Café',
        type: 'table',
        description: 'Representative cost and revenue structure for a standard CCD outlet.',
        data: {
      columns: [
        "Item",
        "Value",
        "Notes"
      ],
      rows: [
        {
          "Item": "Initial investment",
          "Value": "₹3-4 million",
          "Notes": "Interiors, equipment, working capital"
        },
        {
          "Item": "Average ticket size",
          "Value": "₹100",
          "Notes": "Per customer visit"
        },
        {
          "Item": "Monthly revenue",
          "Value": "₹350,000-500,000",
          "Notes": "Varies by location"
        },
        {
          "Item": "Food & beverage cost",
          "Value": "30-35% of revenue",
          "Notes": "Includes coffee, milk, food"
        },
        {
          "Item": "Rent",
          "Value": "20-25% of revenue",
          "Notes": "Higher in prime locations"
        },
        {
          "Item": "Labor",
          "Value": "12-15% of revenue",
          "Notes": "Lower than global chains"
        },
        {
          "Item": "EBITDA margin",
          "Value": "12-15%",
          "Notes": "Target for mature stores"
        },
        {
          "Item": "Payback period",
          "Value": "3-4 years",
          "Notes": "Management estimate"
        }
      ]
    },
        caption: 'CCD cafés operate on thin margins but keep costs low through vertical integration and low labor costs.',
        source: 'CCD management estimates',
        pageNumber: 16,
  },
  {
        id: 'exhibit-5',
        exhibitNumber: 5,
        title: 'A CCD Lounge',
        type: 'photo',
        description: 'Photograph of a CCD Square lounge interior.',
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
        caption: 'CCD Square lounges target a more premium customer segment with larger spaces and upgraded interiors.',
        source: 'Coffee Day Enterprises',
        pageNumber: 17,
  },
  {
        id: 'exhibit-6',
        exhibitNumber: 6,
        title: 'CCD Square Format',
        type: 'photo',
        description: 'Photograph of a CCD Square outlet.',
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
        caption: 'The Square format offers premium food and beverages in a more upscale setting.',
        source: 'Coffee Day Enterprises',
        pageNumber: 17,
  },
  {
        id: 'exhibit-7',
        exhibitNumber: 7,
        title: 'CCD\'s Service Formats',
        type: 'table',
        description: 'Comparison of CCD store formats.',
        data: {
      columns: [
        "Format",
        "Size (sq ft)",
        "Seats",
        "Typical Locations",
        "Menu Focus"
      ],
      rows: [
        {
          "Format": "Standard Café",
          "Size (sq ft)": "1,000-1,500",
          "Seats": "30-40",
          "Typical Locations": "Neighborhoods, colleges",
          "Menu Focus": "Coffee, snacks"
        },
        {
          "Format": "CCD Square / Lounge",
          "Size (sq ft)": "2,000-3,500",
          "Seats": "60-100",
          "Typical Locations": "Malls, premium areas",
          "Menu Focus": "Premium food & coffee"
        },
        {
          "Format": "Kiosk",
          "Size (sq ft)": "150-300",
          "Seats": "0-8",
          "Typical Locations": "Airports, offices, transit",
          "Menu Focus": "Grab-and-go beverages"
        }
      ]
    },
        caption: 'CCD uses multiple formats to reach different locations and customer segments.',
        source: 'Coffee Day Enterprises',
        pageNumber: 18,
  },
  {
        id: 'exhibit-8',
        exhibitNumber: 8,
        title: 'Starbucks\' Global Store Count',
        type: 'table',
        description: 'Starbucks store count by region, fiscal 2011.',
        data: {
      columns: [
        "Region",
        "Company-Operated",
        "Licensed",
        "Total"
      ],
      rows: [
        {
          "Region": "United States",
          "Company-Operated": 6383,
          "Licensed": 4680,
          "Total": 11063
        },
        {
          "Region": "Europe / Middle East / Africa",
          "Company-Operated": 358,
          "Licensed": 1399,
          "Total": 1757
        },
        {
          "Region": "China / Asia Pacific",
          "Company-Operated": 558,
          "Licensed": 1642,
          "Total": 2200
        },
        {
          "Region": "Americas (ex-US)",
          "Company-Operated": 778,
          "Licensed": 1673,
          "Total": 2451
        }
      ]
    },
        caption: 'Starbucks had more than 17,000 stores worldwide by fiscal 2011.',
        source: 'Starbucks Corporation Annual Report 2011',
        pageNumber: 18,
  },
  {
        id: 'exhibit-9',
        exhibitNumber: 9,
        title: 'Starbucks Financial Data',
        type: 'table',
        description: 'Selected financial metrics for Starbucks, fiscal 2009-2011.',
        data: {
      columns: [
        "Metric",
        "FY2009",
        "FY2010",
        "FY2011"
      ],
      rows: [
        {
          "Metric": "Revenue ($ billion)",
          "FY2009": 9.77,
          "FY2010": 10.71,
          "FY2011": 11.7
        },
        {
          "Metric": "Operating income ($ billion)",
          "FY2009": 0.56,
          "FY2010": 1.42,
          "FY2011": 1.73
        },
        {
          "Metric": "Net income ($ billion)",
          "FY2009": 0.39,
          "FY2010": 0.95,
          "FY2011": 1.25
        },
        {
          "Metric": "Stores (end of year)",
          "FY2009": 16635,
          "FY2010": 16858,
          "FY2011": 17003
        }
      ]
    },
        caption: 'Starbucks recovered strongly from the 2008 downturn with rising revenues and profitability.',
        source: 'Starbucks Corporation Annual Reports',
        pageNumber: 19,
  },
  {
        id: 'exhibit-10',
        exhibitNumber: 10,
        title: 'Starbucks Revenue Breakdown',
        type: 'chart',
        description: 'Revenue composition by segment, FY2011.',
        data: {
      columns: ["Segment", "Revenue (%)"],
      rows: [
        { "Segment": "Company-Operated Stores", "Revenue (%)": 79 },
        { "Segment": "Licensed Stores", "Revenue (%)": 10 },
        { "Segment": "Consumer Products", "Revenue (%)": 7 },
        { "Segment": "Foodservice & Other", "Revenue (%)": 4 }
      ],
      chartType: 'pie',
      xKey: 'Segment',
      yKeys: ['Revenue (%)'],
      colors: [BURGUNDY, BURGUNDY_LIGHT, GOLD, STEEL_BLUE]
    },
        caption: 'The vast majority of Starbucks revenue comes from company-operated stores.',
        source: 'Starbucks Corporation Annual Report 2011',
        pageNumber: 19,
  },
  {
        id: 'exhibit-11',
        exhibitNumber: 11,
        title: 'CCD and Starbucks In-Store Sales Mix',
        type: 'table',
        description: 'Comparison of revenue mix by product category.',
        data: {
      columns: [
        "Category",
        "CCD (est. %)",
        "Starbucks Global (%)"
      ],
      rows: [
        {
          "Category": "Coffee & beverages",
          "CCD (est. %)": 60,
          "Starbucks Global (%)": 75
        },
        {
          "Category": "Food",
          "CCD (est. %)": 25,
          "Starbucks Global (%)": 15
        },
        {
          "Category": "Merchandise / Other",
          "CCD (est. %)": 15,
          "Starbucks Global (%)": 10
        }
      ]
    },
        caption: 'CCD relies more on food, while Starbucks derives most revenue from beverages.',
        source: 'Industry analysis',
        pageNumber: 20,
  },
  {
        id: 'exhibit-12',
        exhibitNumber: 12,
        title: 'Tata Group\'s Hotel and Retail Properties',
        type: 'table',
        description: 'Selected Tata properties relevant to Starbucks store locations.',
        data: {
      columns: [
        "Property Type",
        "Examples"
      ],
      rows: [
        {
          "Property Type": "Hotels",
          "Examples": "Taj Mahal Palace, Taj Lands End, Vivanta by Taj"
        },
        {
          "Property Type": "Retail",
          "Examples": "Tata Croma, Westside, Zudio"
        },
        {
          "Property Type": "Real Estate",
          "Examples": "Premium locations in Delhi, Mumbai, Bangalore, Pune"
        }
      ]
    },
        caption: 'The Tata partnership gives Starbucks access to premium real estate and brand credibility.',
        source: 'Tata Group public information',
        pageNumber: 20,
  },
  {
        id: 'exhibit-13',
        exhibitNumber: 13,
        title: 'Starbucks India Launch',
        type: 'photo',
        description: 'Photographs from the opening of the first Starbucks store in India.',
        imageUrl: 'https://images.unsplash.com/photo-1559496417-e73224229177?w=800&h=600&fit=crop',
        caption: 'Starbucks entered India through a 50:50 joint venture with Tata Global Beverages.',
        source: 'Starbucks Corporation',
        pageNumber: 21,
  },
  {
        id: 'exhibit-14',
        exhibitNumber: 14,
        title: 'Age Distribution of Indian Population',
        type: 'chart',
        description: 'Population pyramid showing India age structure.',
        data: {
      columns: ["Age Group", "Male (millions)", "Female (millions)"],
      rows: [
        { "Age Group": "0-14", "Male (millions)": 200, "Female (millions)": 180 },
        { "Age Group": "15-24", "Male (millions)": 125, "Female (millions)": 115 },
        { "Age Group": "25-34", "Male (millions)": 110, "Female (millions)": 100 },
        { "Age Group": "35-44", "Male (millions)": 90, "Female (millions)": 85 },
        { "Age Group": "45-54", "Male (millions)": 70, "Female (millions)": 65 },
        { "Age Group": "55-64", "Male (millions)": 45, "Female (millions)": 42 },
        { "Age Group": "65+", "Male (millions)": 30, "Female (millions)": 32 }
      ],
      chartType: 'bar',
      xKey: 'Age Group',
      yKeys: ['Male (millions)', 'Female (millions)'],
      colors: [STEEL_BLUE, BURGUNDY_LIGHT]
    },
        caption: 'India has a young population, making youth-oriented brands strategically important.',
        source: 'Census of India 2011, projected',
        pageNumber: 21,
  }
];

export const coffeeWarsCase: KnowledgeBase = {
  caseId: 'coffee-wars-india',
  caseTitle: 'Coffee Wars in India: Café Coffee Day Takes On the Global Brands',
  chunks,
  characters,
  personaProfiles,
  exhibits,
  metadata: {
    title: 'Coffee Wars in India: Café Coffee Day Takes On the Global Brands',
    source: 'Harvard Business School',
    year: 2013,
    totalPages: 21,
    studentChunkCount: chunks.filter(c => c.visibility === 'student').length,
    instructorChunkCount: chunks.filter(c => c.visibility === 'instructor').length,
    characterCount: characters.length,
    exhibitCount: exhibits.length,
    generatedAt: new Date().toISOString(),
    schemaVersion: '1.0.0',
  },
};

export default coffeeWarsCase;

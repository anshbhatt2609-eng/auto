import { ClientProspect, LearnedRule, IntegrationsState, Lead, CampaignLog } from "../types";

export const DEFAULT_PROSPECTS: ClientProspect[] = [
  {
    id: "prospect-1",
    name: "Sarah Jenkins",
    company: "Bloom Florist co.",
    role: "Owner / Creative Director",
    email: "sarah@bloomfloristry.com",
    phone: "+447700900077",
    instagram: "bloom_florists_uk",
    bioNotes: "Local boutique floral workshop in London. They struggle to reply to off-hours customer WhatsApp queries regarding custom weekend wedding bouquets, leading to high client checkout drops. They operate with high-margin custom designs.",
    status: "Pending",
    gaps: [],
    triggers: []
  },
  {
    id: "prospect-2",
    name: "Marcus Chen",
    company: "Apex Fit Labs",
    role: "Head Of Growth",
    email: "marcus@apexfitlabs.com",
    phone: "+13125550189",
    instagram: "apex_fit_labs",
    bioNotes: "A multi-city boutique fitness studio group. Runs high-budget Instagram ads but suffers a 45% drop-off because manual operators take more than 12 hours to send DM booking links to people who comment 'FITNESS' on their reels.",
    status: "Pending",
    gaps: [],
    triggers: []
  },
  {
    id: "prospect-3",
    name: "Olivia Vance",
    company: "Vance Law Chambers",
    role: "Senior Partner",
    email: "olivia@vancelegal.com",
    phone: "+12125550143",
    instagram: "vance_chicago_law",
    bioNotes: "High-end boutique family-estate legal firm. They receive over 100 routine legal inquiries on Gmail daily, but manual triage of actual warm consultation clients is extremely backlogged. High-value clients are lost to faster competitors.",
    status: "Pending",
    gaps: [],
    triggers: []
  },
  {
    id: "prospect-4",
    name: "Raj Patel",
    company: "ByteScale Cloud",
    role: "CTO & Co-Founder",
    email: "r.patel@bytescale.io",
    phone: "+919876543210",
    instagram: "bytescale_devops",
    bioNotes: "Developer-focused cloud database SaaS. High free-trial user churn in first 48 hours because they face custom Cobol or on-prem connectivity friction and leaves. Direct WhatsApp or Gmail outreach would address dev integration blocks and recover trial users.",
    status: "Pending",
    gaps: [],
    triggers: []
  }
];

export const INITIAL_ALREADY_LEARNED_RULES: LearnedRule[] = [
  {
    id: "rule-1",
    originalQuestion: "How much does your service cost?",
    adminReply: "Our starter agent integration package begins at $1,500/month, which includes full setup of 3 social bridges and a dedicated customer answering engine. Enterprise tiers are custom.",
    learnedAt: "2026-06-15T14:22:00Z",
    timesAdapted: 2
  },
  {
    id: "rule-2",
    originalQuestion: "Do you integrate with Shopify?",
    adminReply: "Yes! We support native, plug-and-play integrations with Shopify API. It is fully automated so inventory, order tracking, and abandoned cart followups are checked instantly by the AI.",
    learnedAt: "2026-06-16T09:05:00Z",
    timesAdapted: 4
  }
];

export const INITIAL_INTEGRATIONS_STATE: IntegrationsState = {
  Instagram: {
    connected: true,
    username: "agency_outreach_bot",
    apiToken: "insta_live_xxxx8y99",
    dailyQuota: 50,
    sentToday: 12
  },
  Gmail: {
    connected: true,
    username: "campaigns@outreachagency.com",
    apiToken: "g_app_pass_zzzz8811",
    dailyQuota: 80,
    sentToday: 41
  },
  WhatsApp: {
    connected: true,
    username: "+18155551234 (Business Line)",
    apiToken: "wa_cloud_api_token_wwww2233",
    dailyQuota: 30,
    sentToday: 5
  }
};

export const SAMPLE_INITIAL_LOGS: CampaignLog[] = [
  {
    id: "log-1",
    timestamp: "10:01:22",
    type: "info",
    message: "Outreach system booted up. Accounts securely bridged: Gmail, Instagram, WhatsApp."
  },
  {
    id: "log-2",
    timestamp: "10:02:40",
    type: "success",
    message: "Instagram bridge online: Connected to @agency_outreach_bot (Daily limit: 50 | Remaining: 38)"
  },
  {
    id: "log-3",
    timestamp: "10:05:01",
    type: "ai",
    message: "Loaded learned adaptive responder model with 2 custom manual training weights."
  }
];

export const MOCK_WHATSAPP_SIMULATION_RESPONSES: Record<string, { incoming: string; options: string[] }> = {
  "prospect-1": {
    incoming: "Our boutique is indeed trying to save custom bridal requests! Out of curiosity, what is the cost of your custom bot and does it easily connect to weebly or shopify?",
    options: [
      "Weebly integration and Cost details",
      "Explain the florist workflow and setup",
      "Draft customized flower advice"
    ]
  },
  "prospect-2": {
    incoming: "This sounds extremely helpful to hook fitness comments! But does it support custom AS400 terminal systems or Cobol database feeds we internally use to look up active members?",
    options: [
      "Ask about AS400 connector integration specs",
      "Manual price request and CRM compatibility",
      "Ask if there is a trial policy"
    ]
  },
  "prospect-3": {
    incoming: "Interesting. Family estate planning legal inquiries require extreme confidentiality and HIPAA validation rules. Do you comply with SOC2 and local Chicago legal privacy regulations?",
    options: [
      "Ask about HIPAA compliance procedures",
      "Explain how legal encryption rules work on Gmail",
      "Inquire about standard NDA agreements"
    ]
  },
  "prospect-4": {
    incoming: "That is precisely our trial bottleneck. Do you have direct references with developer integrations for mainframe, or do you have pre-coded Python modules for trial users?",
    options: [
      "Request pre-coded Python trial code links",
      "Inquire about trial length and scale discount",
      "Schedule custom co-founder call"
    ]
  }
};

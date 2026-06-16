export interface ClientProspect {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  instagram: string;
  bioNotes: string;
  status: "Pending" | "Analyzing" | "Analyzed" | "Campaign Ready" | "Contacting" | "Outreached" | "Escalated" | "Won Lead";
  
  // Analysis results
  gaps: string[];
  triggers: string[];
  gmailSubject?: string;
  gmailMessage?: string;
  instaMessage?: string;
  whatsappMessage?: string;
  
  // Outreach execution details
  channelUsed?: "Gmail" | "Instagram" | "WhatsApp" | null;
  outreachStatus?: "queued" | "sending" | "delivered" | "failed" | "action_needed" | null;
  outreachTimestamp?: string;
}

export interface Lead {
  id: string;
  prospectId: string;
  name: string;
  company: string;
  role: string;
  medium: "Gmail" | "Instagram" | "WhatsApp";
  leadStatus: "Warm" | "Hot" | "Negotiation";
  lastInteraction: string;
  updatedAt: string;
}

export interface IncomingMessageTask {
  id: string;
  prospectId: string;
  prospectName: string;
  company: string;
  incomingMsg: string;
  status: "pending_manual" | "auto_matched" | "manual_replied";
  matchedRuleId?: string;
  generatedReply?: string;
  manualReply?: string;
  timestamp: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW" | null;
}

export interface LearnedRule {
  id: string;
  originalQuestion: string;
  adminReply: string;
  learnedAt: string;
  timesAdapted: number;
}

export interface OutreachLimits {
  Instagram: number;
  Gmail: number;
  WhatsApp: number;
}

export interface MediumConfig {
  connected: boolean;
  username: string;
  apiToken: string;
  dailyQuota: number;
  sentToday: number;
}

export interface IntegrationsState {
  Instagram: MediumConfig;
  Gmail: MediumConfig;
  WhatsApp: MediumConfig;
}

export interface CampaignLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "ai" | "human";
  message: string;
}

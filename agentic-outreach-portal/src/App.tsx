import React, { useState, useRef, useEffect } from "react";
import { 
  Network, 
  Upload, 
  Send, 
  Cpu, 
  Sparkles, 
  CheckCircle, 
  Settings, 
  HelpCircle, 
  Users, 
  MessageSquare, 
  UserCheck, 
  Terminal, 
  Check, 
  AlertTriangle, 
  Plus, 
  CloudLightning,
  RefreshCw,
  Search,
  BookOpen,
  Mail,
  Instagram,
  PhoneCall,
  Lock,
  Download
} from "lucide-react";
import { ClientProspect, LearnedRule, IntegrationsState, Lead, CampaignLog, IncomingMessageTask } from "./types";
import { 
  DEFAULT_PROSPECTS, 
  INITIAL_ALREADY_LEARNED_RULES, 
  INITIAL_INTEGRATIONS_STATE, 
  SAMPLE_INITIAL_LOGS,
  MOCK_WHATSAPP_SIMULATION_RESPONSES
} from "./lib/defaultData";

export default function App() {
  // Application Data States
  const [prospects, setProspects] = useState<ClientProspect[]>(DEFAULT_PROSPECTS);
  const [selectedProspectId, setSelectedProspectId] = useState<string>("prospect-1");
  const [integrations, setIntegrations] = useState<IntegrationsState>(INITIAL_INTEGRATIONS_STATE);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [learnedRules, setLearnedRules] = useState<LearnedRule[]>(INITIAL_ALREADY_LEARNED_RULES);
  const [logs, setLogs] = useState<CampaignLog[]>(SAMPLE_INITIAL_LOGS);
  
  // Adaptive responder simulator states
  const [incomingTasks, setIncomingTasks] = useState<IncomingMessageTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [customIncomingMsg, setCustomIncomingMsg] = useState<string>("");
  const [adminManualReplyInput, setAdminManualReplyInput] = useState<string>("");
  const [isProcessingReply, setIsProcessingReply] = useState<boolean>(false);
  
  // Form states for creating new prospects
  const [newProspect, setNewProspect] = useState<Omit<ClientProspect, "id" | "status" | "gaps" | "triggers">>({
    name: "",
    company: "",
    role: "",
    email: "",
    phone: "",
    instagram: "",
    bioNotes: ""
  });
  const [isAddingProspect, setIsAddingProspect] = useState<boolean>(false);
  
  // Custom limit configuration form state
  const [isEditingSettings, setIsEditingSettings] = useState<boolean>(false);
  const [tempLimits, setTempLimits] = useState({
    Instagram: 50,
    Gmail: 80,
    WhatsApp: 30
  });

  // State for AI Analysis loading
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});
  const [hasGeminiKeyError, setHasGeminiKeyError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Seed default live simulated whatsapp questions on startup
  useEffect(() => {
    const initialTasks: IncomingMessageTask[] = [
      {
        id: "task-1",
        prospectId: "prospect-1",
        prospectName: "Sarah Jenkins",
        company: "Bloom Florist co.",
        incomingMsg: "Our boutique is indeed trying to save custom bridal requests! Out of curiosity, what is the cost of your custom bot and does it easily connect to weebly or shopify?",
        status: "pending_manual",
        timestamp: "10:11:05 AM",
        confidence: null
      },
      {
        id: "task-2",
        prospectId: "prospect-2",
        prospectName: "Marcus Chen",
        company: "Apex Fit Labs",
        incomingMsg: "Do your automatic scripts connect with shopify or standard store checkouts? We need something plug-and-play so fitness booking works.",
        status: "pending_manual",
        timestamp: "10:14:12 AM",
        confidence: null
      }
    ];
    setIncomingTasks(initialTasks);
    if (initialTasks.length > 0) {
      setSelectedTaskId(initialTasks[0].id);
    }
  }, []);

  const addLog = (type: CampaignLog["type"], message: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs(prev => [...prev, {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      timestamp: timeStr,
      type,
      message
    }]);
  };

  const getSelectedProspect = (): ClientProspect | undefined => {
    return prospects.find(p => p.id === selectedProspectId);
  };

  // 1. DYNAMIC CSV / SHEET PARSER
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          addLog("error", "The uploaded sheet is empty or only contains headers.");
          return;
        }

        const headers = lines[0].split(",").map(h => h.replace(/["']/g, "").trim().toLowerCase());
        const parsedProspects: ClientProspect[] = [];

        // Simple row parse logic with header detection
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.replace(/["']/g, "").trim());
          if (cols.length === 0 || !cols[0]) continue;

          // Intelligently map headers to keys or fallback to column order
          const name = cols[headers.indexOf("name")] || cols[headers.indexOf("client name")] || cols[headers.indexOf("client")] || cols[0] || "Prospect Name";
          const company = cols[headers.indexOf("company")] || cols[headers.indexOf("business")] || cols[1] || "Company Ltd";
          const role = cols[headers.indexOf("role")] || cols[headers.indexOf("title")] || cols[2] || "Owner";
          const email = cols[headers.indexOf("email")] || cols[headers.indexOf("mail")] || cols[3] || "contact@company.com";
          const phone = cols[headers.indexOf("phone")] || cols[headers.indexOf("telephone")] || cols[headers.indexOf("whatsapp")] || cols[4] || "+100000000";
          const instagram = cols[headers.indexOf("instagram")] || cols[headers.indexOf("insta")] || cols[5] || "company_insta";
          const bioNotes = cols[headers.indexOf("bionotes")] || cols[headers.indexOf("bio")] || cols[headers.indexOf("notes")] || cols[6] || "No bio context provided.";

          parsedProspects.push({
            id: "csv-" + Date.now() + "-" + i,
            name,
            company,
            role,
            email,
            phone,
            instagram,
            bioNotes,
            status: "Pending",
            gaps: [],
            triggers: []
          });
        }

        if (parsedProspects.length > 0) {
          setProspects(prev => [...prev, ...parsedProspects]);
          setSelectedProspectId(parsedProspects[0].id);
          addLog("success", `Parsed client sheet successfully. Uploaded and imported ${parsedProspects.length} clients into outreach queue.`);
        }
      } catch (err: any) {
        addLog("error", "Failed to parse CSV file: " + err.message);
      }
    };
    reader.readAsText(file);
    // clear input
    e.target.value = "";
  };

  // Generate downloadable sample CSV template
  const downloadSampleCSV = () => {
    const csvContent = `Client Name,Company,Role,Email,Phone,Instagram,Bio Notes
Sophia Martinez,Sylvan Pottery,Creative Founder,sophia@sylvanpotter.com,+15125550912,sylvan_design_co,"Maintains a beautiful pottery instagram profile. They struggles with slow email follow ups and has no automatic direct-message conversion funnel online."
Ethan Miller,Skyline Roofers,Operations Manager,ethan@skylineroofs.net,+14155556122,skyline_roofs,"B2B commercial roofing agency in California. Receives high WhatsApp volume but operators are overwhelmed. They want client booking automated fast."`;
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "outreach_clients_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("info", "Sample client CSV template downloaded.");
  };

  // 2. DYNAMIC AUTO-ANALYZER (Real API vs. High-Quality simulator)
  const triggerAIAnalysis = async (prospectId: string) => {
    setAnalyzingIds(prev => ({ ...prev, [prospectId]: true }));
    addLog("ai", `Starting deep client gap-analysis for "${prospects.find(p => p.id === prospectId)?.name}"...`);

    const targetProspect = prospects.find(p => p.id === prospectId);
    if (!targetProspect) return;

    try {
      const response = await fetch("/api/analyze-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: targetProspect })
      });

      const data = await response.json();
      
      if (data.isMissingKey) {
        setHasGeminiKeyError(true);
      }

      const hasError = !!data.error;
      const analysisSource = data.fallback ? "Client-Side High Fidelity Prediction Engine" : "Google Gemini-3.5 AI Engine";

      // If server failed or fallback is specified, we populate with fallback values smoothly
      const finalResult = data.fallback ? data.fallback : data;

      setProspects(prev => prev.map(p => {
        if (p.id === prospectId) {
          return {
            ...p,
            status: "Campaign Ready",
            gaps: finalResult.gaps || ["Manual booking followups has a slow cycle time", "No responsive off-hours answering service"],
            triggers: finalResult.triggers || ["Highlight 24/7 autonomous support setup", "Benchmark booking dropoff rate against peers"],
            gmailSubject: finalResult.gmailSubject || `Quick efficiency note for the growth team at ${p.company}`,
            gmailMessage: finalResult.gmailMessage || `Hi ${p.name},\n\nI was looking at your work as ${p.role} and identified a specific client engagement leak. Let's fix this.`,
            instaMessage: finalResult.instaMessage || `Hey ${p.name}! 🔥 Loved your company's profile. I built a dynamic conversation mockup for @${p.instagram} that closes booking gaps instantly. Check it out?`,
            whatsappMessage: finalResult.whatsappMessage || `Hi ${p.name}! Saw your listing on ${p.company}. Quick query: are you currently saving off-hours client requests automatically? Built a 5-minute custom helper flow to show you.`
          };
        }
        return p;
      }));

      addLog("success", `AI Gap Analysis completed for ${targetProspect.name} via ${analysisSource}`);
      if (data.isMissingKey) {
        addLog("warning", "Using high-quality fallback analysis templates, since GEMINI_API_KEY is not declared in Secrets.");
      }
    } catch (err: any) {
      addLog("error", `Analysis server connection failed. Running high-precision local heuristics: ${err.message}`);
      // Fallback update
      setProspects(prev => prev.map(p => {
        if (p.id === prospectId) {
          return {
            ...p,
            status: "Campaign Ready",
            gaps: ["Lack of instant WhatsApp automated reservation engine", "Low engagement conversion hook in bios"],
            triggers: ["Propose localized custom chatbot sandbox preview", "Address immediate lost checkout recovery metrics"],
            gmailSubject: `Friction-reduction opportunity for ${p.company}`,
            gmailMessage: `Hi ${p.name},\n\nHope this finds you well. I was auditing standard follow-up bottlenecks in the ${p.company} sector and realized that a 24/7 automated booking assistant could prevent up to 40% lead dropouts.\n\nI have structured a ready-to-use blueprint tailored specifically for ${p.role} operations. Would you be open to a 2-minute review?\n\nBest,\nAutomated Growth Agent`,
            instaMessage: `Hey ${p.name}! ✨ Love the aesthetic of ${p.company}. We actually designed an interactive Instagram DM conversational prototype that automatically routes comments to bookings. Can I DM you the direct link?`,
            whatsappMessage: `Hi ${p.name}! Hope you're having an active week. Checked out your phone bridge for ${p.company} - do you often lose evening queries to lag? Here is an automated response solution you can check.`
          };
        }
        return p;
      }));
    } finally {
      setAnalyzingIds(prev => ({ ...prev, [prospectId]: false }));
    }
  };

  // 3. EXECUTE OUTREACH SUB-PROCESS (WITH QUOTA MANAGED RATE LIMITS)
  const executeOutreach = (prospectId: string, channel: "Gmail" | "Instagram" | "WhatsApp") => {
    const prospect = prospects.find(p => p.id === prospectId);
    if (!prospect) return;

    const limitConfig = integrations[channel];
    
    // Safety check for exceeded limit
    if (limitConfig.sentToday >= limitConfig.dailyQuota) {
      alert(`[QUOTA BLOCKED] Outbound outreach aborted. You have reached your configured daily limit of ${limitConfig.dailyQuota} messages for "${channel}". Add-on quotas can be changed in settings above.`);
      addLog("error", `Blocked sending to ${prospect.name} via ${channel}. Configured quota limit of ${limitConfig.dailyQuota} is exhausted.`);
      return;
    }

    // Select the template message
    let messageText = "";
    if (channel === "Gmail") messageText = prospect.gmailMessage || "";
    if (channel === "Instagram") messageText = prospect.instaMessage || "";
    if (channel === "WhatsApp") messageText = prospect.whatsappMessage || "";

    if (!messageText) {
      alert("Please trigger the AI Gap Analysis first to customize your campaign messaging!");
      return;
    }

    addLog("info", `Attempting automated delivery of ${channel} message to ${prospect.name}...`);

    // Increment sent quota counters safely
    setIntegrations(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        sentToday: prev[channel].sentToday + 1
      }
    }));

    // Perform state transition
    setProspects(prev => prev.map(p => {
      if (p.id === prospectId) {
        return {
          ...p,
          status: "Outreached",
          channelUsed: channel,
          outreachStatus: "delivered",
          outreachTimestamp: new Date().toLocaleTimeString()
        };
      }
      return p;
    }));

    addLog("success", `Personalized outreach dispatched to @${prospect.instagram || prospect.name} over ${channel} (Updated standard usage: ${limitConfig.sentToday + 1}/${limitConfig.dailyQuota}).`);

    // Automatical promotion to High Intent Lead pipeline simulation half of the time!
    setTimeout(() => {
      const alreadyInLeads = leads.some(l => l.prospectId === prospectId);
      if (!alreadyInLeads) {
        const newLead: Lead = {
          id: "lead-" + Date.now(),
          prospectId: prospect.id,
          name: prospect.name,
          company: prospect.company,
          role: prospect.role,
          medium: channel,
          leadStatus: Math.random() > 0.4 ? "Hot" : "Warm",
          lastInteraction: "Initial customized proposal delivered successfully. Checked out standard profile gaps.",
          updatedAt: new Date().toLocaleTimeString()
        };
        setLeads(prev => [newLead, ...prev]);
        addLog("success", `[Lead Discovered] ${prospect.name} (${prospect.company}) successfully logged into the Warm/Hot active Lead Section.`);
      }
    }, 1200);

    // Also trigger simulated incoming responses for testing in WhatsApp Sandbox
    if (channel === "WhatsApp") {
      setTimeout(() => {
        // Look up corresponding preset or fallback response
        const fallbackText = `Hello! Interesting message regarding our gaps. I'm busy but curious about: what's the integration setup look like?`;
        const setup = MOCK_WHATSAPP_SIMULATION_RESPONSES[prospect.id] || { incoming: fallbackText };
        
        const newIncomingTask: IncomingMessageTask = {
          id: "task-" + Date.now(),
          prospectId: prospect.id,
          prospectName: prospect.name,
          company: prospect.company,
          incomingMsg: setup.incoming,
          status: "pending_manual",
          timestamp: new Date().toLocaleTimeString()
        };

        setIncomingTasks(prev => [newIncomingTask, ...prev]);
        setSelectedTaskId(newIncomingTask.id);
        
        addLog("ai", `[SIMULATED CLIENT REPLY] Incoming WhatsApp response detected from "${prospect.name}". Auto-responder assessing knowledge...`);
        
        // Immediately trigger the auto-responder script to test matching
        assessIncomingMessage(setup.incoming, newIncomingTask.id, prospect);
      }, 3000);
    }
  };

  // 4. ADAPTIVE REAL-TIME WHATSAPP RESPONDER (AI Matching and human portals)
  const assessIncomingMessage = async (msg: string, taskId: string, prospectObj?: ClientProspect) => {
    try {
      const activeProspectObj = prospectObj || prospects.find(p => p.id === incomingTasks.find(t => t.id === taskId)?.prospectId);
      
      const response = await fetch("/api/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: activeProspectObj,
          incomingMessage: msg,
          learnedRules: learnedRules
        })
      });

      const data = await response.json();

      setIncomingTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          if (!data.isUnknown && data.matchedRuleIndex !== -1) {
            // Found matched weight
            return {
              ...t,
              status: "auto_matched",
              matchedRuleId: learnedRules[data.matchedRuleIndex]?.id,
              generatedReply: data.generatedReply,
              confidence: data.confidence || "HIGH"
            };
          } else {
            // Escape to human admin
            return {
              ...t,
              status: "pending_manual",
              confidence: "LOW"
            };
          }
        }
        return t;
      }));

      if (!data.isUnknown && data.matchedRuleIndex !== -1) {
        addLog("ai", `[Auto-Answering Success] WhatsApp query was automatically recognized based on learned Rule. Sending optimized text with confidence ${data.confidence}.`);
      } else {
        addLog("warning", `[Unrecognized Question] Agent does not have learned response model for question: "${msg}". Escalated to Manual Admin Portal.`);
      }

    } catch (err: any) {
      console.error(err);
      addLog("error", "Failed to compile self-learning responder match check.");
    }
  };

  // Trigger simulated incoming custom WhatsApp message of user's own text
  const injectCustomClientWhatsAppMessage = () => {
    if (!customIncomingMsg.trim()) return;

    const currentProspect = getSelectedProspect();
    if (!currentProspect) return;

    const newTaskId = "task-custom-" + Date.now();
    const newTask: IncomingMessageTask = {
      id: newTaskId,
      prospectId: currentProspect.id,
      prospectName: currentProspect.name,
      company: currentProspect.company,
      incomingMsg: customIncomingMsg,
      status: "pending_manual",
      timestamp: new Date().toLocaleTimeString()
    };

    setIncomingTasks(prev => [newTask, ...prev]);
    setSelectedTaskId(newTaskId);
    setCustomIncomingMsg("");

    addLog("info", `Manual WhatsApp simulator injected response from "${currentProspect.name}". Evaluating matching patterns...`);
    
    // Run automated assessment
    assessIncomingMessage(newTask.incomingMsg, newTaskId, currentProspect);
  };

  // Submit manual admin response & store in the custom learned knowledge base
  const submitAdminManualReplyAndLearn = async () => {
    if (!selectedTaskId || !adminManualReplyInput.trim()) return;

    const task = incomingTasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    setIsProcessingReply(true);
    addLog("human", `Admin manual reply entered: "${adminManualReplyInput}". Training agentic parameters...`);

    const newRuleId = "rule-" + Date.now();
    const newRule: LearnedRule = {
      id: newRuleId,
      originalQuestion: task.incomingMsg,
      adminReply: adminManualReplyInput,
      learnedAt: new Date().toISOString(),
      timesAdapted: 0
    };

    // Save permanently for immediate lookup
    setLearnedRules(prev => [newRule, ...prev]);

    // Update current task to Manual Replied state
    setIncomingTasks(prev => prev.map(t => {
      if (t.id === selectedTaskId) {
        return {
          ...t,
          status: "manual_replied",
          manualReply: adminManualReplyInput
        };
      }
      return t;
    }));

    addLog("success", `[Reinforced Learning Activated] AI Agent successfully compiled dynamic rule: "${task.incomingMsg.substring(0, 30)}..." → Learned.`);
    setAdminManualReplyInput("");
    setIsProcessingReply(false);
  };

  // Trigger quick match selection helper for direct simulation
  const applyQuickResponseDraft = (choiceText: string) => {
    setAdminManualReplyInput(choiceText);
  };

  // Add a new raw prospect from the custom inline popup/form
  const handleCreateProspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProspect.name || !newProspect.company) {
      alert("Client Name and Company are required fields!");
      return;
    }

    const created: ClientProspect = {
      ...newProspect,
      id: "manual-" + Date.now(),
      status: "Pending",
      gaps: [],
      triggers: []
    };

    setProspects(prev => [created, ...prev]);
    setSelectedProspectId(created.id);
    setIsAddingProspect(false);
    
    // Reset form
    setNewProspect({
      name: "",
      company: "",
      role: "",
      email: "",
      phone: "",
      instagram: "",
      bioNotes: ""
    });

    addLog("success", `Manually registered client prospect "${created.name}" for custom outreach.`);
  };

  // Save the custom thresholds configuration of Gmail, Instagram, WhatsApp limits
  const saveCustomSettings = () => {
    setIntegrations(prev => ({
      Instagram: { ...prev.Instagram, dailyQuota: tempLimits.Instagram },
      Gmail: { ...prev.Gmail, dailyQuota: tempLimits.Gmail },
      WhatsApp: { ...prev.WhatsApp, dailyQuota: tempLimits.WhatsApp }
    }));
    setIsEditingSettings(false);
    addLog("success", `Outbound quota limits revised: Instagram (${tempLimits.Instagram}), Gmail (${tempLimits.Gmail}), WhatsApp (${tempLimits.WhatsApp}).`);
  };

  // Bulk automated triggers
  const triggerBulkAnalysis = async () => {
    addLog("info", "Initiating Bulk AI analysis on all 'Pending' client profiles in the sheet...");
    const pendingProspects = prospects.filter(p => p.status === "Pending");
    
    if (pendingProspects.length === 0) {
      alert("No pending clients to analyze! Feel free to upload a sheet, register one manually, or click 'Reset All' keys to refresh.");
      return;
    }

    for (const p of pendingProspects) {
      await triggerAIAnalysis(p.id);
    }
  };

  // Reset demo
  const resetToDemoDefaults = () => {
    setProspects(DEFAULT_PROSPECTS);
    setSelectedProspectId(DEFAULT_PROSPECTS[0].id);
    setIntegrations(INITIAL_INTEGRATIONS_STATE);
    setLeads([]);
    setLearnedRules(INITIAL_ALREADY_LEARNED_RULES);
    setLogs([
      {
        id: "log-reset-1",
        timestamp: "10:00:00",
        type: "success",
        message: "Demo Environment has been re-initialized to initial slate states."
      }
    ]);
    addLog("info", "Sample client cards and initial learned knowledge parameters loaded.");
  };

  // Filter prospects
  const filteredProspects = prospects.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.company.toLowerCase().includes(query) ||
      p.bioNotes.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased text-sm">
      {/* 1. NOTIFICATION & STATUS PANEL HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1 px-2.2 rounded bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 text-[11px] uppercase font-bold tracking-widest text-white shadow-lg shadow-indigo-500/15">
                AI Agentic Engine
              </span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400 text-xs font-mono">UTC Online</span>
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight mt-1">
              Agentic Outreach Portal
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 max-w-xl">
              Automatic gap identifier, custom campaign generator, quota limiter, & self-learning agent loop.
            </p>
          </div>

          {/* Quick Actions & Environmental Flags */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-end">
            <button
              onClick={resetToDemoDefaults}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all font-semibold text-xs flex items-center gap-1.5 border border-slate-700/60"
              title="Reset state parameters to factory defaults"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin-hover" />
              Reset Workspace
            </button>
            <button
              onClick={() => {
                setTempLimits({
                  Instagram: integrations.Instagram.dailyQuota,
                  Gmail: integrations.Gmail.dailyQuota,
                  WhatsApp: integrations.WhatsApp.dailyQuota
                });
                setIsEditingSettings(!isEditingSettings);
              }}
              className="px-3 py-1.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-all font-semibold text-xs flex items-center gap-1.5 border border-indigo-500/40"
            >
              <Settings className="h-3.5 w-3.5 text-indigo-400" />
              Campaign Quotas & Limits Setup
            </button>
          </div>
        </div>
      </header>

      {/* API Key Missing Banner Info (Self Explanatory helper) */}
      {hasGeminiKeyError && (
        <div className="bg-amber-950/40 border-b border-amber-500/30 text-amber-200 px-6 py-2 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Note on API Keys:</strong> Missing or unrecognized <code>GEMINI_API_KEY</code> environment variable. 
              The portal is safely running on <strong>High-Fidelity Client-Side Fallbacks</strong>, ensuring all parsing, gap analysis, and training adapters function optimally for demo evaluation!
            </span>
          </div>
          <button 
            onClick={() => setHasGeminiKeyError(false)} 
            className="text-amber-400 hover:text-amber-200 font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* QUOTA LIMIT EDIT MODAL/DRAWER POPUP */}
      {isEditingSettings && (
        <div className="bg-slate-900 border-b border-indigo-500/30 shadow-2xl px-6 py-5 transition-all text-slate-300">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-400" />
                <h3 className="font-bold text-white tracking-tight text-sm">Configure Daily Channel Reach Out Quotas</h3>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Security Safeguard active</span>
            </div>
            
            <p className="text-xs text-slate-400 mb-4">
              To prevent SPAM blocks and respect platform guidelines, the AI Agent tracks outgoing outreaches in real time. 
              Set strict caps for each medium. Attempting campaigns once a limit is exceeded will block further delivery.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Instagram Limit</label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-pink-400 font-bold text-xs font-mono">IG_DMS_CAP</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={tempLimits.Instagram}
                    onChange={(e) => setTempLimits({ ...tempLimits, Instagram: parseInt(e.target.value) || 0 })}
                    className="w-full bg-transparent border-0 text-white font-mono text-center focus:ring-0 text-sm outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Recommended safe: 50/day</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gmail Limit</label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-cyan-400 font-bold text-xs font-mono">G_MAIL_CAP</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={tempLimits.Gmail}
                    onChange={(e) => setTempLimits({ ...tempLimits, Gmail: parseInt(e.target.value) || 0 })}
                    className="w-full bg-transparent border-0 text-white font-mono text-center focus:ring-0 text-sm outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Recommended safe: 80/day</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Limit</label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-emerald-400 font-bold text-xs font-mono">WA_BIZ_CAP</span>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={tempLimits.WhatsApp}
                    onChange={(e) => setTempLimits({ ...tempLimits, WhatsApp: parseInt(e.target.value) || 0 })}
                    className="w-full bg-transparent border-0 text-white font-mono text-center focus:ring-0 text-sm outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Recommended safe: 30/day</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsEditingSettings(false)}
                className="px-3.5 py-1.5 rounded hover:bg-slate-800 text-slate-200 text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={saveCustomSettings}
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs transition shadow-lg shadow-indigo-600/20"
              >
                Apply Safe Quotas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* =======================================================
            SECTION 2: CHANNELS STATE & QUOTA OVERVIEW row widgets
            ======================================================= */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Instagram Connector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 relative overflow-hidden transition-all hover:border-pink-500/30">
            <div className="absolute top-0 right-0 h-16 w-16 bg-pink-500/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-pink-500/10 text-pink-400">
                  <Instagram className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-200 text-xs">Instagram Direct API</h4>
                    <span className="p-0.5 px-1.5 rounded-full bg-emerald-500/15 text-[9px] text-emerald-400 font-semibold uppercase">Connected</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">@{integrations.Instagram.username}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                <span>Direct Campaign Quota:</span>
                <span className="font-semibold text-slate-200">
                  {integrations.Instagram.sentToday} / {integrations.Instagram.dailyQuota} sent
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-pink-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (integrations.Instagram.sentToday / integrations.Instagram.dailyQuota) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-mono">
                <span>API token: Active</span>
                <span>{Math.max(0, integrations.Instagram.dailyQuota - integrations.Instagram.sentToday)} remaining</span>
              </div>
            </div>
          </div>

          {/* Gmail Connector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 relative overflow-hidden transition-all hover:border-cyan-500/30">
            <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-cyan-500/10 text-cyan-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-200 text-xs">Gmail SMTP Relay</h4>
                    <span className="p-0.5 px-1.5 rounded-full bg-emerald-500/15 text-[9px] text-emerald-400 font-semibold uppercase">Connected</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{integrations.Gmail.username}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                <span>SMTP Day Volume:</span>
                <span className="font-semibold text-slate-200">
                  {integrations.Gmail.sentToday} / {integrations.Gmail.dailyQuota} sent
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (integrations.Gmail.sentToday / integrations.Gmail.dailyQuota) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-mono">
                <span>Method: Safe App TLS</span>
                <span>{Math.max(0, integrations.Gmail.dailyQuota - integrations.Gmail.sentToday)} remaining</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Connector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 relative overflow-hidden transition-all hover:border-emerald-500/30">
            <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                  <PhoneCall className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-200 text-xs">WhatsApp Business API</h4>
                    <span className="p-0.5 px-1.5 rounded-full bg-emerald-500/15 text-[9px] text-emerald-400 font-semibold uppercase">Connected</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{integrations.WhatsApp.username}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                <span>Cloud Biz Session Cap:</span>
                <span className="font-semibold text-slate-200">
                  {integrations.WhatsApp.sentToday} / {integrations.WhatsApp.dailyQuota} sent
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (integrations.WhatsApp.sentToday / integrations.WhatsApp.dailyQuota) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-mono">
                <span>Bridge: Live Webhook</span>
                <span>{Math.max(0, integrations.WhatsApp.dailyQuota - integrations.WhatsApp.sentToday)} remaining</span>
              </div>
            </div>
          </div>

        </div>

        {/* =======================================================
            LEFT COLUMN: CAMPAIGN SHEET IMPORTER & PROSPECTING LIST
            ======================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* File Upload Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 relative">
            <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Upload Clients Sheet (CSV or XLSX)</h3>
              </div>
              <HelpCircle className="h-4.5 w-4.5 text-slate-500 hover:text-slate-300 cursor-pointer" title="Supports standard CSV headers including Client Name, Company, Role, Bio Notes." />
            </div>

            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleCSVUpload}
              accept=".csv"
              className="hidden" 
            />

            {/* Upload Area Visualizer */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 transition bg-slate-950 p-6 rounded-lg text-center cursor-pointer flex flex-col items-center justify-center group"
            >
              <div className="p-3 rounded-full bg-indigo-500/5 group-hover:bg-indigo-500/10 text-indigo-400 mb-3 transition">
                <Upload className="h-6 w-6 stroke-[1.5]" />
              </div>
              <p className="font-semibold text-slate-100 group-hover:text-indigo-400 text-xs transition">
                Drag & drop or Click to browse xlsx/csv sheet
              </p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                Accepts Client Name, Company, Email, Role, Phone, bio snippets for customized analysis
              </p>
            </div>

            {/* Quick Demo Utilities */}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={downloadSampleCSV}
                className="flex-1 py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition border border-slate-700/60"
              >
                <Download className="h-3 w-3 text-slate-400" />
                Get Mock CSV Template
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setProspects(prev => [...prev, ...DEFAULT_PROSPECTS]);
                  addLog("info", "Injected 4 active ready-to-analyze florist, fitness, DevOps, and legal profiles.");
                }}
                className="flex-1 py-1 px-2.5 rounded bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-indigo-500/40"
              >
                <Plus className="h-3.5 w-3.5 text-indigo-400" />
                Load Sample Profiles
              </button>
            </div>
          </div>

          {/* List of Prospect Clients */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-slate-400" />
                <h3 className="font-bold text-white text-sm">Client Prospect Queue ({prospects.length})</h3>
              </div>
              <button
                onClick={() => setIsAddingProspect(!isAddingProspect)}
                className="p-1 px-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition"
              >
                <Plus className="h-3 w-3" />
                Add Client
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-3.5 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-500">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search spreadsheet clients by name, niche, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 text-xs rounded p-2 pl-8 text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            {/* INLINE CUSTOM PROSPECT ADDER FORM */}
            {isAddingProspect && (
              <form onSubmit={handleCreateProspectSubmit} className="bg-slate-950 p-3.5 rounded border border-indigo-500/30 mb-4 text-xs space-y-2.5">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-slate-200">Register New Client Record</span>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingProspect(false)} 
                    className="text-slate-500 hover:text-slate-300 text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={newProspect.name}
                      onChange={(e) => setNewProspect({ ...newProspect, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Acme Growth Inc."
                      value={newProspect.company}
                      onChange={(e) => setNewProspect({ ...newProspect, company: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Role/Title</label>
                    <input
                      type="text"
                      placeholder="Marketing Director"
                      value={newProspect.role}
                      onChange={(e) => setNewProspect({ ...newProspect, role: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Instagram @ Handle</label>
                    <input
                      type="text"
                      placeholder="acme_growth"
                      value={newProspect.instagram}
                      onChange={(e) => setNewProspect({ ...newProspect, instagram: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Gmail / Email</label>
                    <input
                      type="email"
                      placeholder="jane@company.com"
                      value={newProspect.email}
                      onChange={(e) => setNewProspect({ ...newProspect, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">WhatsApp / Phone</label>
                    <input
                      type="text"
                      placeholder="+15552345"
                      value={newProspect.phone}
                      onChange={(e) => setNewProspect({ ...newProspect, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Client Bio & Context (Notes regarding leaks)</label>
                  <textarea
                    placeholder="Describe their business. e.g. Local dental clinic with no response system after hours on WhatsApp..."
                    value={newProspect.bioNotes}
                    onChange={(e) => setNewProspect({ ...newProspect, bioNotes: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white focus:outline-none text-xs h-16"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition text-xs"
                >
                  Save Prospect Client
                </button>
              </form>
            )}

            {/* List entries */}
            <div className="flex-1 overflow-y-auto max-h-[460px] space-y-2 pr-1.5">
              {filteredProspects.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center justify-center text-slate-500">
                  <Users className="h-8 w-8 stroke-[1.2] mb-2" />
                  <p className="text-xs font-semibold">No spreadsheet data loaded</p>
                  <p className="text-[11px] max-w-xs mt-1">Upload a CSV, register a client manually, or load samples to trigger the agent!</p>
                </div>
              ) : (
                filteredProspects.map((p) => {
                  const isSelected = p.id === selectedProspectId;
                  const isAnalyzing = analyzingIds[p.id];
                  
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isAnalyzing && setSelectedProspectId(p.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected 
                          ? "bg-indigo-950/20 border-indigo-500/80 shadow-md shadow-indigo-950/20" 
                          : "bg-slate-950/60 border-slate-850 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-100 text-xs">{p.name}</span>
                            <span className="text-[10px] text-slate-400">- {p.role}</span>
                          </div>
                          <span className="text-[11px] text-indigo-400 font-medium block mt-0.5">{p.company}</span>
                        </div>
                        
                        {/* Custom status tag */}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                          p.status === "Pending" ? "bg-slate-800 text-slate-400" :
                          p.status === "Campaign Ready" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                          p.status === "Outreached" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          "bg-cyan-500/10 text-cyan-400"
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      {/* Bio preview */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {p.bioNotes || "No context specified."}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-mono">
                          {p.phone || p.email || "@" + p.instagram}
                        </span>

                        <div className="flex gap-2">
                          {p.status === "Pending" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerAIAnalysis(p.id);
                              }}
                              disabled={isAnalyzing}
                              className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-bold transition flex items-center gap-1"
                            >
                              {isAnalyzing ? (
                                <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
                              ) : (
                                <Cpu className="h-3 w-3" />
                              )}
                              Analyze Gaps
                            </button>
                          ) : (
                            <span className="text-indigo-400 flex items-center gap-1 font-mono">
                              <CheckCircle className="h-3 w-3 text-indigo-400" />
                              Analyzed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer triggers */}
            <div className="pt-3 border-t border-slate-800 mt-3 flex justify-between gap-2.5">
              <span className="text-[10px] text-slate-400 self-center">
                📊 {prospects.filter(p => p.status === "Pending").length} pending to write strategy
              </span>
              <button
                type="button"
                onClick={triggerBulkAnalysis}
                className="py-1.5 px-3.5 rounded bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs flex items-center gap-1.5 shadow transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Trigger Bulk AI Analysis
              </button>
            </div>
          </div>

        </div>

        {/* =======================================================
            CENTER COLUMN: AI CLIENT ANALYZER & CAMPAIGN DISPATCH
            ======================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Focus Detail Container */}
          <div className="bg-slate-900 border border-slate-801 rounded-lg p-5 flex-1 flex flex-col relative justify-between">
            
            {/* Header portion */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2.5 pb-4.5 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-semibold">Active Client Dashboard Focus</span>
                  {(() => {
                    const selected = getSelectedProspect();
                    if (!selected) return <h2 className="text-lg font-bold text-white mt-1">Please Select a Client</h2>;
                    return (
                      <>
                        <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                          {selected.name}
                        </h2>
                        <p className="text-indigo-400 font-medium text-xs font-mono mt-0.5">
                          {selected.role} @ {selected.company}
                        </p>
                      </>
                    );
                  })()}
                </div>

                {/* Selection Details Indicators */}
                {(() => {
                  const selected = getSelectedProspect();
                  if (!selected) return null;
                  return (
                    <div className="text-right text-[11px] text-slate-400 space-y-1">
                      <div className="flex gap-1.5 justify-end">
                        <span className="bg-slate-950 px-2 py-0.5 rounded font-mono border border-slate-800">Mail: {selected.email || "No email"}</span>
                      </div>
                      <div className="flex gap-1.5 justify-end">
                        <span className="bg-slate-950 px-2 py-0.5 rounded font-mono border border-slate-800">WhatsApp: {selected.phone || "No phone"}</span>
                      </div>
                      <div className="flex gap-1.5 justify-end">
                        <span className="bg-slate-950 px-2 py-0.5 rounded font-mono border border-slate-800">IG: @{selected.instagram || "No profile"}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bio & Raw context section */}
              {(() => {
                const selected = getSelectedProspect();
                if (!selected) return null;
                return (
                  <div className="my-4 bg-slate-950 p-3.5 rounded border border-slate-800/80">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1%">
                      Imported Business Context & Client Notes:
                    </h4>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      " {selected.bioNotes || "No context bio recorded. Standard AI templates will be structured based on general business heuristics."} "
                    </p>
                  </div>
                );
              })()}

              {/* AI GAP ANALYSIS RESULT CARD */}
              {(() => {
                const selected = getSelectedProspect();
                if (!selected) {
                  return (
                    <div className="py-16 text-center text-slate-500">
                      <Cpu className="h-10 w-10 text-slate-600 animate-pulse mx-auto mb-3" />
                      <p className="text-xs">No active prospect focused.</p>
                      <p className="text-[11px] mt-1">Select a prospect from the column on the left to review their outbound workflow.</p>
                    </div>
                  );
                }

                const isAnalyzed = selected.status !== "Pending";
                const isAnalyzing = analyzingIds[selected.id];

                if (!isAnalyzed) {
                  return (
                    <div className="py-12 text-center bg-slate-950 rounded-lg p-6 border border-slate-800/60 my-4">
                      <Sparkles className="h-8 w-8 text-indigo-400 mx-auto mb-3 animate-pulse" />
                      <h4 className="font-bold text-slate-200 text-xs">No AI Analysis Drafted Yet</h4>
                      <p className="text-slate-400 text-[11px] max-w-sm mx-auto mt-2 mb-4 leading-relaxed">
                        To unlock hyper-personalized gap strategies and targeted outreach templates, execute the automated analyzer! 
                      </p>
                      <button
                        onClick={() => triggerAIAnalysis(selected.id)}
                        disabled={isAnalyzing}
                        className="py-2 px-6 rounded bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs inline-flex items-center gap-2 shadow-lg shadow-indigo-600/15 transition-all"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-indigo-200" />
                            Evaluating business links...
                          </>
                        ) : (
                          <>
                            <Cpu className="h-4 w-4" />
                            Analyze Client Gaps
                          </>
                        )}
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 my-4">
                    
                    {/* Gaps detected row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Identified Friction Gaps */}
                      <div className="bg-slate-950 p-3.5 rounded border border-rose-500/15">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 font-bold" />
                          <h4 className="font-bold text-rose-300 text-[11px] uppercase tracking-wider">
                            Identified Service Gaps & Pain Points
                          </h4>
                        </div>
                        <ul className="space-y-2 text-xs">
                          {selected.gaps?.map((gap, i) => (
                            <li key={i} className="flex gap-2 text-slate-300 leading-relaxed font-medium">
                              <span className="text-rose-400">⚡</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Hook Triggers */}
                      <div className="bg-slate-950 p-3.5 rounded border border-cyan-500/15">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <Sparkles className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                          <h4 className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider">
                            High-Leverget Conversion Triggers
                          </h4>
                        </div>
                        <ul className="space-y-2 text-xs">
                          {selected.triggers?.map((trig, i) => (
                            <li key={i} className="flex gap-2 text-slate-300 leading-relaxed">
                              <span className="text-cyan-400">💡</span>
                              <span>{trig}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* PERSONALIZED CHANNEL CAMPAIGNS & COPYS */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Tailor-Made Channel Copy (Select Medium to Reach Out)
                      </h4>

                      {/* 1. INSTAGRAM DM */}
                      <div className="bg-slate-950 rounded border border-slate-800 p-3 flex flex-col justify-between hover:border-pink-500/20 transition">
                        <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-900/60">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-pink-500/10 text-pink-400">
                              <Instagram className="h-3.5 w-3.5" />
                            </span>
                            <span className="font-bold text-slate-200 text-xs">Instagram Friendly DM copy</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-500">Target handle: @{selected.instagram || selected.name}</span>
                          </div>
                        </div>

                        <textarea
                          value={selected.instaMessage || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProspects(prev => prev.map(p => p.id === selected.id ? { ...p, instaMessage: val } : p));
                          }}
                          className="w-full bg-slate-900/50 border-0 p-2 rounded text-xs text-slate-300 focus:outline-none focus:ring-0 resize-none h-16 font-mono leading-relaxed"
                        />

                        <div className="flex justify-between items-center mt-2.5">
                          <span className="text-[10px] text-slate-500">Personalized on Instagram profile aesthetics</span>
                          
                          <button
                            type="button"
                            onClick={() => executeOutreach(selected.id, "Instagram")}
                            className="px-4 py-1.5 rounded bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                          >
                            <Send className="h-3 w-3" />
                            Deliver Instagram DM ({integrations.Instagram.sentToday}/{integrations.Instagram.dailyQuota})
                          </button>
                        </div>
                      </div>

                      {/* 2. GMAIL OUTREACH */}
                      <div className="bg-slate-950 rounded border border-slate-800 p-3 flex flex-col justify-between hover:border-cyan-500/20 transition">
                        <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-901/60">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-cyan-500/10 text-cyan-400">
                              <Mail className="h-3.5 w-3.5" />
                            </span>
                            <span className="font-bold text-slate-200 text-xs">Gmail Cold Outreach copy</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-500">SMTP: {selected.email || "N/A"}</span>
                          </div>
                        </div>

                        <div className="bg-slate-900/55 p-1 px-2 rounded mb-1.5 flex gap-1.5 text-xs">
                          <span className="text-slate-500 font-bold">Subject:</span>
                          <input
                            type="text"
                            value={selected.gmailSubject || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProspects(prev => prev.map(p => p.id === selected.id ? { ...p, gmailSubject: val } : p));
                            }}
                            className="bg-transparent border-0 text-white w-full focus:outline-none focus:ring-0 py-0"
                          />
                        </div>

                        <textarea
                          value={selected.gmailMessage || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProspects(prev => prev.map(p => p.id === selected.id ? { ...p, gmailMessage: val } : p));
                          }}
                          className="w-full bg-slate-900/50 border-0 p-2 rounded text-xs text-slate-300 focus:outline-none focus:ring-0 resize-none h-24 font-mono leading-relaxed"
                        />

                        <div className="flex justify-between items-center mt-2.5">
                          <span className="text-[10px] text-slate-500">Personalized on structural operations</span>
                          
                          <button
                            type="button"
                            onClick={() => executeOutreach(selected.id, "Gmail")}
                            className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                          >
                            <Mail className="h-3 w-3" />
                            Deliver Gmail Outreach ({integrations.Gmail.sentToday}/{integrations.Gmail.dailyQuota})
                          </button>
                        </div>
                      </div>

                      {/* 3. WHATSAPP CASUAL MESSAGE */}
                      <div className="bg-slate-950 rounded border border-slate-800 p-3 flex flex-col justify-between hover:border-emerald-500/20 transition">
                        <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-900/60">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                              <MessageSquare className="h-3.5 w-3.5" />
                            </span>
                            <span className="font-bold text-slate-200 text-xs">WhatsApp Conversational Trigger</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-500">Phone Code: {selected.phone || "N/A"}</span>
                          </div>
                        </div>

                        <textarea
                          value={selected.whatsappMessage || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProspects(prev => prev.map(p => p.id === selected.id ? { ...p, whatsappMessage: val } : p));
                          }}
                          className="w-full bg-slate-900/50 border-0 p-2 rounded text-xs text-slate-300 focus:outline-none focus:ring-0 resize-none h-16 font-mono leading-relaxed"
                        />

                        <div className="flex justify-between items-center mt-2.5">
                          <span className="text-[10px] text-emerald-500/90 font-mono flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            Testing converts live reply automatically
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => executeOutreach(selected.id, "WhatsApp")}
                            className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                          >
                            <Send className="h-3 w-3" />
                            Deliver WhatsApp proposal ({integrations.WhatsApp.sentToday}/{integrations.WhatsApp.dailyQuota})
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Campaign Log Console Footer */}
            <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                  Agent Live Audit Logs Console
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Real-time trace</span>
              </div>
              
              <div className="h-28 overflow-y-auto font-mono text-[10px] space-y-1.5 pr-2.5">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-slate-500 font-mono shrink-0 select-none">[{log.timestamp}]</span>
                    <span className={`px-1 rounded text-[8px] font-bold shrink-0 uppercase tracking-widest ${
                      log.type === "success" ? "bg-emerald-500/10 text-emerald-400" :
                      log.type === "error" ? "bg-red-500/10 text-red-400" :
                      log.type === "warning" ? "bg-amber-500/10 text-amber-400" :
                      log.type === "ai" ? "bg-indigo-500/25 text-indigo-300 border border-indigo-400/20" :
                      log.type === "human" ? "bg-purple-500/15 text-purple-300" :
                      "bg-slate-800 text-slate-400"
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300 leading-relaxed break-words">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef}></div>
              </div>
            </div>

          </div>

        </div>

        {/* =======================================================
            BOTTOM ROW: ACTIVE LEADS BOARD & REAL-TIME WHATSAPP SANDBOX
            ======================================================= */}
        <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Leads section */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">Dispatched Campaign Leads Board ({leads.length})</h3>
                </div>
                <span className="text-[11px] text-slate-400 bg-indigo-500/10 p-0.5 px-2 rounded-full border border-indigo-500/20">
                  Target conversion pipeline
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                When an outreach campaign executes successfully, high-converting filters automatically route interest profiles here with categorized warmth badges to track manual pipeline updates.
              </p>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {leads.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950 rounded border border-slate-850 text-slate-500">
                    <UserCheck className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs font-semibold">No warm active leads registered yet</p>
                    <p className="text-[11px] max-w-xs mt-1 mx-auto">Click "Deliver Outreach" on Instagram, Gmail or WhatsApp details above to prompt simulated outreach conversions!</p>
                  </div>
                ) : (
                  leads.map((l) => (
                    <div key={l.id} className="bg-slate-950 p-3 rounded-lg border border-slate-855 flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-xs">{l.name}</span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                            l.leadStatus === "Hot" ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse" : "bg-teal-500/10 text-teal-300 border border-teal-500/20"
                          }`}>
                            {l.leadStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-400 mt-0.5 font-medium">{l.company} - {l.role}</p>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-mono">
                          <span className="text-slate-500">Last interaction:</span> {l.lastInteraction}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-slate-500 block font-mono">Outreach via:</span>
                        <span className={`p-1 px-2 text-[10px] rounded font-bold inline-block mt-1 ${
                          l.medium === "Gmail" ? "bg-cyan-500/10 text-cyan-300" :
                          l.medium === "Instagram" ? "bg-pink-500/10 text-pink-300" :
                          "bg-emerald-500/10 text-emerald-300"
                        }`}>
                          {l.medium}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-1.5 font-mono">{l.updatedAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 mt-4 text-left text-xs bg-slate-950/40 p-2.5 rounded text-slate-400">
              ⚡ <strong>Automatic lead filtering:</strong> The portal dynamically queries reply patterns. Active triggers maintain state without bulky secondary servers.
            </div>
          </div>

          {/* REAL-TIME WHATSAPP ADAPTIVE RESPONDER SANDBOX */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-801">
                <div className="flex items-center gap-1.5">
                  <CloudLightning className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Self-Learning WhatsApp Simulator</h3>
                </div>
                
                <span className="p-0.5 px-2 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                  Adaptive Logic (Human in the Loop)
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3.5 leading-relaxed">
                <strong>Simulate real client replies below:</strong> If the prospect asks a question the agent has not learned, it routes the text to the <strong>Admin Portal</strong>. Type a manual reply and submit to **re-train the agent's knowledge memory instantly**!
              </p>

              {/* Grid split: Active Questions & Admin Trainer Portal */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Simulated Incoming Stream Selection */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Incoming Alerts</span>
                  
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {incomingTasks.map((task) => {
                      const isTaskSelected = task.id === selectedTaskId;
                      return (
                        <div
                          key={task.id}
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            // seed draft reply preset for florist if matching
                            const setup = MOCK_WHATSAPP_SIMULATION_RESPONSES[task.prospectId];
                            if (setup) {
                              setAdminManualReplyInput("");
                            }
                          }}
                          className={`p-2 rounded text-left cursor-pointer transition text-xs border ${
                            isTaskSelected
                              ? "bg-slate-950 border-emerald-500 text-white"
                              : "bg-slate-950/40 border-slate-800 hover:bg-slate-900/60"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-200 truncate block max-w-[85px]">{task.prospectName}</span>
                            <span className={`text-[8px] px-1 rounded ${
                              task.status === "auto_matched" ? "bg-emerald-500/15 text-emerald-400" :
                              task.status === "manual_replied" ? "bg-blue-500/15 text-blue-400" :
                              "bg-red-500/15 text-rose-400 animate-pulse"
                            }`}>
                              {task.status === "auto_matched" ? "Matched" :
                               task.status === "manual_replied" ? "Admin Replied" :
                               "Human Needed"}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                            "{task.incomingMsg}"
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Manual Inject Form */}
                  <div className="pt-2 border-t border-slate-800 text-xs">
                    <label className="text-[10px] text-indigo-400 block mb-1">Test Custom Response Input:</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Type standard question..."
                        value={customIncomingMsg}
                        onChange={(e) => setCustomIncomingMsg(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        onKeyDown={(e) => e.key === "Enter" && injectCustomClientWhatsAppMessage()}
                      />
                      <button
                        onClick={injectCustomClientWhatsAppMessage}
                        className="p-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 text-[10px]"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trainer form detail */}
                <div className="md:col-span-7 bg-slate-950 p-3 rounded border border-slate-800 flex flex-col justify-between text-xs min-h-[220px]">
                  {(() => {
                    const activeTask = incomingTasks.find(t => t.id === selectedTaskId);
                    if (!activeTask) {
                      return (
                        <div className="text-center py-10 text-slate-500 h-full flex flex-col items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-slate-700 mb-1" />
                          <span>No client alert selected.</span>
                        </div>
                      );
                    }

                    const setupOptions = MOCK_WHATSAPP_SIMULATION_RESPONSES[activeTask.prospectId] || { options: ["Provide custom direct advice template", "Detail setup timeline & cost options"] };

                    return (
                      <div className="flex flex-col justify-between h-full space-y-3">
                        <div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 pb-1.5 border-b border-indigo-900/40 mb-1.5">
                            <span>Client: <strong>{activeTask.prospectName}</strong> ({activeTask.company})</span>
                            <span className="font-mono">{activeTask.timestamp}</span>
                          </div>

                          <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold mb-1">Client incoming question:</span>
                          <div className="bg-slate-900 p-2 rounded text-indigo-300 leading-relaxed italic text-xs mb-2.5">
                            "{activeTask.incomingMsg}"
                          </div>

                          {/* Matching evaluation output */}
                          {activeTask.status === "auto_matched" ? (
                            <div className="bg-emerald-950/30 p-2.5 rounded border border-emerald-500/20 text-emerald-400 text-[11px] leading-relaxed space-y-1">
                              <div className="font-semibold flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                MATCHED & ANSWERED AUTOMATICALLY (Confidence {activeTask.confidence})
                              </div>
                              <p className="text-slate-300 text-xs italic bg-slate-900/50 p-1 rounded font-mono mt-1">
                                " {activeTask.generatedReply} "
                              </p>
                              <span className="text-[9px] text-emerald-500 block">AI parsed and adapted live based on trained knowledge weights.</span>
                            </div>
                          ) : activeTask.status === "manual_replied" ? (
                            <div className="bg-blue-950/20 p-2.5 rounded border border-blue-500/25 text-blue-400 text-[11px] space-y-1">
                              <span className="font-semibold block">✓ Human manual response registered and learned:</span>
                              <p className="text-slate-300 italic bg-slate-900/50 p-1 rounded font-mono mt-1">" {activeTask.manualReply} "</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex gap-2 text-rose-400 font-bold uppercase tracking-wider text-[9px] items-center">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Unrecognized Question: Escalated to Admin Portal
                              </div>

                              {/* Easy draft quick select parameters */}
                              <div className="pt-1 select-none">
                                <span className="text-[9px] text-slate-400 block mb-1 font-bold">Suggested quick training replies (Click to fill):</span>
                                <div className="flex flex-wrap gap-1">
                                  {setupOptions.options.map((opt, i) => (
                                    <button
                                      key={i}
                                      onClick={() => {
                                        let sampleText = "";
                                        if (opt.includes("cost") || opt.includes("Price")) {
                                          sampleText = "The starter agent package begins at $1,500/month, fully custom tailored with active triggers and setup. Can I book a live call with our admin?";
                                        } else if (opt.includes("Weebly") || opt.includes("shopify") || opt.includes("connect")) {
                                          sampleText = "Yes, our automation tool seamlessly integrates with both Shopify and Weebly via raw backend REST webhooks. No developer setup on your part is required!";
                                        } else if (opt.includes("HIPAA") || opt.includes("compliance") || opt.includes("confidentiality")) {
                                          sampleText = "Absolutely! We guarantee state legal standard HIPAA and SOC2 compliance. Client messages are encrypted over double TLS channels directly.";
                                        } else {
                                          sampleText = "Our custom agent supports mainframes as well as standard Python environments. Let's schedule a 5-minute technical review to verify your specifications.";
                                        }
                                        applyQuickResponseDraft(sampleText);
                                      }}
                                      className="bg-indigo-950/40 text-[9px] text-slate-300 hover:bg-indigo-900/60 p-1 px-2 rounded hover:text-white transition cursor-pointer border border-indigo-500/15"
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Admin composition input */}
                        {activeTask.status === "pending_manual" && (
                          <div className="space-y-2 pt-2 border-t border-slate-900">
                            <textarea
                              placeholder="Type highly descriptive, custom answers here so the AI agent learns how you want to answer this specific question..."
                              value={adminManualReplyInput}
                              onChange={(e) => setAdminManualReplyInput(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-xs text-white focus:outline-none focus:border-indigo-500 resize-none h-14"
                            />

                            <button
                              type="button"
                              onClick={submitAdminManualReplyAndLearn}
                              disabled={isProcessingReply || !adminManualReplyInput.trim()}
                              className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                            >
                              <CheckCircle className="h-4 w-4" />
                              {isProcessingReply ? "Compiling weights..." : "Learn & Reply Clients"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>

            {/* LEARNED RULES CONSOLE DATABASE SUMMARY LIST */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                  Knowledge Matrix ({learnedRules.length} Active Memory Weights)
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Auto-sync active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[110px] overflow-y-auto pr-1">
                {learnedRules.map((rule) => (
                  <div key={rule.id} className="bg-slate-950 p-2 rounded border border-slate-900 text-[10px]">
                    <div className="flex justify-between text-slate-400 font-bold">
                      <span className="text-emerald-400 truncate block max-w-[120px]">Q: "{rule.originalQuestion}"</span>
                      <span className="text-slate-500">Adapted {rule.timesAdapted}x</span>
                    </div>
                    <p className="text-slate-300 mt-1 line-clamp-2 italic leading-relaxed">
                      A: "{rule.adminReply}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 text-center py-4 text-slate-500 text-[11px] mt-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Agentic Outreach Portal • Built with React, Tailwind, and Gemini-3.5 API</span>
          <div className="flex gap-4">
            <span className="font-mono text-slate-600 font-medium">Session UUID: {Math.random().toString(36).substr(2, 9)}</span>
            <span className="text-slate-600 font-mono">v1.2 (Active Self-Learning Model)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

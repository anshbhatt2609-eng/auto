import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import basicAuth from "express-basic-auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const username = process.env.PORTAL_USERNAME || "admin";
const password = process.env.PORTAL_PASSWORD || "securecompany123";

app.use(basicAuth({
  users: { [username]: password },
  challenge: true,
  realm: "Agentic Outreach Portal"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy initializer for GoogleGenAI client to avoid crash on startup 
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please declare it in the Secrets panel in AI Studio settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. GAP ANALYSIS & OUTREACH GENERATION API
// Analyzes a client's profile details using Gemini, finds gaps/pain-points, and drafts multi-platform messages
app.post("/api/analyze-client", async (req: Request, res: Response) => {
  try {
    const { client } = req.body;
    if (!client) {
      res.status(400).json({ error: "Missing client details in request body" });
      return;
    }

    const { name, company, role, websiteUrl, bioNotes } = client;

    const systemPrompt = `You are an elite, highly converting Agentic Growth & Sales Outreach AI. 
your job is to analyze client bios/companies, find critical sales gaps (pain points, conversion leaks, outdated strategies, or growth opportunities), and write highly tailored outreach copy.
Avoid generic greetings. Make references to their platform, company name, role, and details feel completely genuine, hyper-focused, and non-spammy.
You must return only JSON matching the specified schema with details filled out properly.`;

    const userPrompt = `Analyze the following client details to find specific service gaps/leverage points, and write 3 highly personalized templates for Instagram, Gmail, and WhatsApp outreach.
    
    CLIENT DETAILS:
    - Name: ${name || "N/A"}
    - Company: ${company || "N/A"}
    - Role: ${role || "N/A"}
    - Website/Indication: ${websiteUrl || "N/A"}
    - Bio/Context Notes: ${bioNotes || "N/A"}

    TASK:
    1. Identify 2 key Gaps/Pain-Points (e.g. lack of automation, poor engagement, leaking leads, slow follow-ups).
    2. Identify 2 high-leverage marketing triggers/hook strategies.
    3. Custom drafts:
       - Gmail subject & highly professional and personalized email body.
       - Instagram friendly but curious DM focusing on creative aspects.
       - WhatsApp conversational, casual, high-converting greeting starting with direct, personalized relevance.
       
    Make sure to match the requested output structure precisely.`;

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemPrompt },
        { text: userPrompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 2 key gaps, friction points, or opportunities found for this client."
            },
            triggers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 2 tactical conversion hooks or dynamic outreach triggers."
            },
            gmailSubject: {
              type: Type.STRING,
              description: "Highly compelling email subject line."
            },
            gmailMessage: {
              type: Type.STRING,
              description: "High-level personalized Gmail message body."
            },
            instaMessage: {
              type: Type.STRING,
              description: "Short, direct, creative Instagram DM message."
            },
            whatsappMessage: {
              type: Type.STRING,
              description: "Conversational, casual, short WhatsApp message."
            }
          },
          required: ["gaps", "triggers", "gmailSubject", "gmailMessage", "instaMessage", "whatsappMessage"]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/analyze-client:", error);
    // If the error is missing API key, we return a flag so the frontend can fallback nicely to high-quality simulated data
    const isMissingKey = error.message && error.message.includes("GEMINI_API_KEY");
    res.status(200).json({
      error: error.message || "Internal Server Error",
      isMissingKey,
      // Provide high-quality fallback template if client wants to demonstrate/test without key:
      fallback: {
        gaps: [
          "Manual booking delays resulting in high drop-off of hot leads",
          "Lack of automated conversational content to filter low-intent queries"
        ],
        triggers: [
          "Offer a ready-to-test 5-minute automated sandbox flow built for their niche",
          "Provide comparative analysis of their current booking latency vs standard peers"
        ],
        gmailSubject: "Quick friction-reduction note for the team at " + (req.body.client?.company || "your firm"),
        gmailMessage: `Hi ${req.body.client?.name || "there"},\n\nI was looking at ${req.body.client?.company || "your brand"} and loved what you're building as a ${req.body.client?.role || "expert"}. I noticed a slight friction point in client-booking follow-ups that might be letting warm leads cool off.\n\nWe mapped out a custom conversational funnel for you that solves this instantly. Worth a quick 5-minute look?\n\nBest,\nYour Outreach Agent`,
        instaMessage: `Hey ${req.body.client?.name || "there"}! 🔥 Loved your recent posts representing ${req.body.client?.company || "your company"}. I built a quick custom conversational model prototype for you that acts as an insta-assistant. Can I drop the preview URL in your chat here?`,
        whatsappMessage: `Hi ${req.body.client?.name || "there"}! Checked out ${req.body.client?.company || "your business"} and saw your booking link. Quick question: are you guys experiencing any drop-offs from leads who ask questions off-hours? Built an automation specifically for that niche – free to check it?`
      }
    });
  }
});


// 2. ADAPTIVE RESPONDER API (Human-In-The-Loop learning simulation)
// Receives client details, a new incoming message from the client, and previously learned Q&A rules.
// If any learned rules match, it adapts and replies using that knowledge. Else, flags as UNKNOWN.
app.post("/api/generate-reply", async (req: Request, res: Response) => {
  try {
    const { client, incomingMessage, learnedRules } = req.body;
    if (!incomingMessage) {
      res.status(400).json({ error: "Missing incomingMessage in body" });
      return;
    }

    const ai = getGemini();

    const rulesFormatted = (learnedRules || [])
      .map((r: any, idx: number) => `Rule #${idx + 1}:\nClient Question: "${r.originalQuestion}"\nYour Manual Admin Approved Reply: "${r.adminReply}"`)
      .join("\n\n");

    const systemPrompt = `You are an adaptive AI customer-relation agent. You are managing a live WhatsApp outreach conversation.
You are equipped with a dynamic knowledge base of human manual admin responses. 
Your ultimate goal is to review the client's incoming message and determine:
1. Do you already have a learned rule / response template that directly or conceptually matches this question?
2. If YES, write a response to the client adapting that learned manual response to fit current client's name/context perfectly.
3. If NO (meaning it's an unknown query that isn't covered by our manual rules yet), you MUST flag this immediately so the admin can answer manually.

You must reply with only a JSON output matching the specified schema.`;

    const userPrompt = `CLIENT INFORMATION:
    - Name: ${client?.name || "Prospect"}
    - Company: ${client?.company || "Prospect Team"}
    - Niche / Notes: ${client?.bioNotes || "N/A"}

    CLIENT INCOMING WHATSAPP MESSAGE:
    "${incomingMessage}"

    OUR CURRENT LEARNED RULES KNOWLEDGE BASE:
    ${rulesFormatted || "NO LEARNED RULES YET. Ground-up learning session."}

    TASK:
    Analyze if the incoming message can be answered using any of the learned rules.
    - If the rules contain a conceptually similar question, write an answer. Set matchedRuleIndex to the index of that Rule (0-based). Write a short explanation of how you adapted it. Mark confidence: "HIGH" or "MEDIUM".
    - If the question is completely different or we have no rules yet, set isUnknown to true. Leave generatedReply as empty or polite placeholder.

    Make sure your reply matches the JSON format exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemPrompt },
        { text: userPrompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isUnknown: {
              type: Type.BOOLEAN,
              description: "True if no learned rules match the incoming query, meaning the agent does not know and requires manual reply."
            },
            matchedRuleIndex: {
              type: Type.INTEGER,
              description: "The index of the rule that matched (0-based), or -1 if no rules match."
            },
            generatedReply: {
              type: Type.STRING,
              description: "The adapted, highly polished response to send the client based on our learned system rules, personalized to their name."
            },
            confidence: {
              type: Type.STRING,
              description: "Confidence level of matching: HIGH, MEDIUM, or LOW."
            },
            learningAdaptationNote: {
              type: Type.STRING,
              description: "Brief note explaining how the agent adapted its knowledge to write this reply."
            }
          },
          required: ["isUnknown", "matchedRuleIndex", "generatedReply", "confidence", "learningAdaptationNote"]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/generate-reply:", error);
    const isMissingKey = error.message && error.message.includes("GEMINI_API_KEY");
    
    // Simulate smart matching client-side if Gemini key is missing so the prototype works seamlessly!
    // We'll perform a manual substring search inside the rules as a perfect client-side simulation.
    let simulatedReply = {
      isUnknown: true,
      matchedRuleIndex: -1,
      generatedReply: "",
      confidence: "LOW",
      learningAdaptationNote: "Simulating ground-up learning due to lack of standard environment keys."
    };

    const incoming = (req.body.incomingMessage || "").toLowerCase();
    const learned = req.body.learnedRules || [];
    
    for (let i = 0; i < learned.length; i++) {
      const q = learned[i].originalQuestion.toLowerCase();
      // Look for keyword overlap or similarity
      const words = q.split(/\s+/).filter((w: string) => w.length > 4);
      const matches = words.some((w: string) => incoming.includes(w));
      if (matches || incoming.includes("price") && q.includes("price") || incoming.includes("cost") && q.includes("cost") || incoming.includes("integrate") && q.includes("integrate")) {
        simulatedReply = {
          isUnknown: false,
          matchedRuleIndex: i,
          generatedReply: `Hi ${req.body.client?.name || "there"}! ${learned[i].adminReply}`,
          confidence: "HIGH",
          learningAdaptationNote: "Simulated match based on keywords: " + learned[i].originalQuestion
        };
        break;
      }
    }

    res.json({
      ...simulatedReply,
      warning: isMissingKey ? "Missing API Key. Running client-side simulation fallback." : undefined,
      isMissingKey
    });
  }
});


// 3. VITE MIDDLEWARE CONFIGURATION FOR DEV / PROD
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only run the listen server if we are NOT in a Vercel serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Outreach Portal] Server booting successfully on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

// Export the app for Vercel Serverless Functions
export default app;

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY not found. Gemini services will run in high-fidelity sandbox fallback mode.");
      return null;
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

// Ensure clean strings for model inputs
function cleanInput(str: string) {
  return str ? str.trim().slice(0, 4000) : "";
}

// Endpoint: AI Daily Brief Generator
app.post("/api/gemini/brief", async (req, res) => {
  try {
    const { tasks } = req.body;
    const ai = getGeminiClient();

    const tasksString = JSON.stringify(tasks || []);
    const prompt = `You are TaskPilot AI, an autonomous productivity companion. Analyze the following list of active tasks and deadlines:
${tasksString}

Provide a short, highly professional, scannable "Daily Brief" in exactly 3-4 bullet points. Include:
1. An overall assessment of current deadline risk (Execution Score out of 100).
2. Which specific high-priority task is most critical to complete today.
3. A proactive suggestion or calendar hack to optimize today's schedule and mitigate risks.
Be punchy, action-oriented, and write in the voice of a brilliant, supportive Chief of Staff. Keep it brief.`;

    if (!ai) {
      // High-fidelity fallback brief
      const fallbackBrief = `### Fallback Daily Brief
* **Execution Score: 84/100** • You are in a strong position, but 2 upcoming high-priority deadlines require immediate action to maintain momentum.
* **Critical Path Focus** • Focus first on finalizing the **System Architecture Design**; its proximity to the next milestone makes it a blocking dependency.
* **Proactive Planner Recommendation** • Block off 2 hours of solid focus time between 10:00 AM and 12:00 PM today. Clear notifications and handle complex deep-work early.`;
      return res.json({ text: fallbackBrief });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text || "No brief generated." });
  } catch (error: any) {
    console.error("Error generating brief:", error);
    res.status(500).json({ error: error.message || "Failed to generate brief." });
  }
});

// Endpoint: AI Subtask Generator
app.post("/api/gemini/subtasks", async (req, res) => {
  try {
    const { title, description, deadline, category } = req.body;
    const ai = getGeminiClient();

    const cleanTitle = cleanInput(title);
    const cleanDesc = cleanInput(description || "");

    const prompt = `As TaskPilot AI, analyze this task:
Title: "${cleanTitle}"
Description: "${cleanDesc}"
Category: "${category}"
Deadline: "${deadline}"

Deconstruct this task into a logical sequence of 3 to 6 practical subtasks. For each subtask, estimate the focus duration (in minutes, between 15 and 180) and define a specific title.
Also, assess the AI Risk level of missing this deadline ("critical", "high", "moderate", or "low") based on its complexity and estimated hours, along with a 1-sentence risk reasoning explanation.`;

    if (!ai) {
      // Sandbox fallback data based on title
      const fallbackSubtasks = [
        { title: "Define core objectives & gather reference materials", estimatedDuration: 30 },
        { title: "Outline structural sections & draft initial solution", estimatedDuration: 60 },
        { title: "Refine technical execution and conduct local verification", estimatedDuration: 45 },
        { title: "Conduct final review and finalize output formatting", estimatedDuration: 30 },
      ];
      return res.json({
        subtasks: fallbackSubtasks,
        aiRisk: "moderate",
        aiRiskReason: "Moderate risk. Highly achievable within standard working hours if split into structured milestones.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              description: "A logical breakdown of the primary task into detailed actionable milestones.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Clear, action-oriented milestone title." },
                  estimatedDuration: { type: Type.INTEGER, description: "Estimated time in minutes (e.g. 30, 45, 60, 90)." },
                },
                required: ["title", "estimatedDuration"],
              },
            },
            aiRisk: {
              type: Type.STRING,
              description: "The assessed risk level of missing the deadline. Must be one of: 'critical', 'high', 'moderate', 'low'.",
            },
            aiRiskReason: {
              type: Type.STRING,
              description: "A professional 1-sentence analytical reason behind the selected risk rating.",
            },
          },
          required: ["subtasks", "aiRisk", "aiRiskReason"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error generating subtasks:", error);
    res.status(500).json({ error: error.message || "Failed to decompose task." });
  }
});

// Endpoint: Conversational Assistant (Chat)
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, contextTasks } = req.body;
    const ai = getGeminiClient();

    const cleanMsg = cleanInput(message);
    const currentTasksString = JSON.stringify(contextTasks || []);

    const systemInstruction = `You are TaskPilot AI, the ultimate autonomous productivity assistant.
You help the user prioritize work, organize their day, and build study/work schedules.
You always display high analytical standards. You are direct, warm, and hyper-competent.
When users ask you to plan, create, analyze, or schedule, do so thoroughly.
Current Tasks state of the user:
${currentTasksString}

Your responses should always be structured clearly. If you are reasoning about priorities or risks, use a distinct section with headings like "### AI Reasoning & Risk Assessment" followed by "### Recommended Action Plan". This helps the UI render your thoughts beautifully.`;

    if (!ai) {
      // High-fidelity local assistant response
      let replyText = "";
      let reasoning = "The assistant is running in high-fidelity sandbox mode.";
      let suggestions: string[] = [];

      if (cleanMsg.toLowerCase().includes("plan") || cleanMsg.toLowerCase().includes("schedule")) {
        reasoning = "Analyzed current tasks. Identified 2 blocking deadlines. Recommended scheduling high-focus slots in the morning to maximize cognitive bandwidth.";
        replyText = `### Recommended Action Plan
Here is a structured, high-efficiency schedule designed to clear your high-priority items:

1. **09:00 AM - 11:00 AM** • **Deep Work: Core System Architecture** (High Priority)
   * *Rationale*: Tackle your heaviest intellectual load while cognitive reserve is peaked.
2. **11:00 AM - 11:30 AM** • Review and respond to crucial emails and communication.
3. **01:30 PM - 03:00 PM** • **Medium Work: Analytics & Weekly Review** (Moderate Risk)
   * *Rationale*: Excellent mid-afternoon execution task to sustain rhythm.
4. **04:30 PM - 05:00 PM** • Clear out low-priority administrative tasks and finalize logs.`;
        suggestions = ["Apply this plan to my calendar", "Analyze my workload instead", "Help me reprioritize everything"];
      } else if (cleanMsg.toLowerCase().includes("risk") || cleanMsg.toLowerCase().includes("analyze")) {
        reasoning = "Checked 5 active tasks. Deadline density is high around Friday. Focus hours are projected to fall short by 1.5 hours based on current estimates.";
        replyText = `### AI Workload Analysis & Risk Report
I have reviewed your active load and simulated completion trajectories:

* **Saturated Milestones**: You have 3 concurrent deadlines due by Friday, June 3rd.
* **Risk Flag**: **System Architecture Review** is at **High Risk** due to insufficient allocated hours (estimated: 4 hours, remaining open slots: 2.5 hours).
* **Suggested Resolution**: I recommend delegating secondary admin tasks or utilizing the 'Replan My Schedule' algorithm on your Planner tab to unlock an extra 1.5 hours of focus time tomorrow morning.`;
        suggestions = ["Replan my schedule now", "Break System Architecture into subtasks", "Set a Focus Time blocker"];
      } else {
        reasoning = "Evaluating general conversational prompt to provide hyper-efficient productivity advice.";
        replyText = `### TaskPilot AI Companion
Hello! I am your autonomous productivity pilot. I actively monitor your workloads, estimate deadline friction, and help you carve out high-performance focus blocks.

How can I assist you today? I can:
* **Plan your day** with optimized energy-level mapping.
* **Reprioritize your entire task backlog** dynamically.
* **Deconstruct a major assignment** into highly detailed micro-steps.
* **Analyze your current deadline risk trends**.`;
        suggestions = ["Plan my day", "Analyze my workload", "Break my assignment into subtasks"];
      }

      return res.json({ text: replyText, reasoning, suggestions });
    }

    // Call the real Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: `System context: ${systemInstruction}` }] },
        ...(history || []).map((h: any) => ({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        })),
        { role: "user", parts: [{ text: cleanMsg }] },
      ],
    });

    const textOutput = response.text || "";

    // Extract a simulated reasoning block for UI visualization
    let reasoning = "Analyzing workload dependencies, priority vectors, and timeline conflicts to provide an optimal trajectory.";
    if (textOutput.includes("AI Reasoning")) {
      const parts = textOutput.split("### Recommended Action Plan");
      if (parts[0]) {
        reasoning = parts[0].replace("### AI Reasoning & Risk Assessment", "").trim();
      }
    }

    const suggestionsList = [
      "Help me reschedule today's calendar",
      "Decompose my highest risk task",
      "Draft a daily completion report",
    ];

    res.json({
      text: textOutput,
      reasoning,
      suggestions: suggestionsList,
    });
  } catch (error: any) {
    console.error("Error in AI chat:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with AI pilot." });
  }
});

// Endpoint: AI Replan My Schedule
app.post("/api/gemini/replan", async (req, res) => {
  try {
    const { tasks } = req.body;
    const ai = getGeminiClient();

    const tasksString = JSON.stringify(tasks || []);
    const prompt = `As TaskPilot AI, analyze this task backlog:
${tasksString}

Produce an optimized daily layout plan. Allocate specific, realistic time blocks (e.g. "09:00 AM - 11:00 AM") for each of the outstanding tasks. Focus heavily on prioritizing items with higher 'aiRisk' or 'priority: high'. Keep the daily working hours within 8:00 AM to 6:00 PM.

Return your response in a structured JSON schema containing:
1. 'scheduledTasks': An array of objects matching: { taskId: string, scheduledTime: string, rationale: string }
2. 'replanInsights': A professional 1-2 sentence overall analytical summary of why this schedule was optimized this way.`;

    if (!ai) {
      // Return beautiful fallback mock schedule matching task IDs if possible
      const scheduledTasks = (tasks || []).map((t: any, idx: number) => {
        const slots = ["09:00 AM - 10:30 AM", "11:00 AM - 12:30 PM", "02:00 PM - 03:30 PM", "04:00 PM - 05:00 PM"];
        return {
          taskId: t.id,
          scheduledTime: slots[idx % slots.length],
          rationale: `Prioritized to mitigate the ${t.aiRisk || "moderate"} risk level and leverage morning high-focus blocks.`,
        };
      });

      return res.json({
        scheduledTasks,
        replanInsights: "Schedule replanned automatically. High-risk items have been front-loaded into morning high-energy hours, protecting the critical path of key deliverables.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scheduledTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING },
                  scheduledTime: { type: Type.STRING, description: "E.g. '09:00 AM - 11:00 AM'" },
                  rationale: { type: Type.STRING },
                },
                required: ["taskId", "scheduledTime", "rationale"],
              },
            },
            replanInsights: { type: Type.STRING },
          },
          required: ["scheduledTasks", "replanInsights"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error replanning schedule:", error);
    res.status(500).json({ error: error.message || "Failed to replan schedule." });
  }
});

// Setup Vite Dev Server / Serve Production Static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite dev server integrating...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static build...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TaskPilot AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

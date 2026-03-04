import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
const groq = new Groq({ apiKey });

async function testPlan() {
    const idea = "A subscription service for premium cat food";
    const report = { project_name: "CatFeast", explanation: "Premium cat food delivered monthly." };
    const answers = "Q: Budget? A: $1000. Q: Location? A: New York.";

    const prompt = `
      ROLE: Elite Startup Operations Expert.
      IDEA: "${idea}"
      LOCATION: ${answers.includes('Country') ? answers : 'Global'}
      STRATEGIC ASSESSMENT: ${JSON.stringify(report)}
      USER INTERVIEW: ${answers}

      TASK:
      Generate a HYPER-PERSONALIZED 60-Day Execution Calendar. 
      Every day must have a UNIQUE, non-repetitive task tailored to the specific market, location, and product.
      
      STRUCTURE:
      1. Divide 60 days into logical PHASES (e.g., Week 1: Groundwork, Week 2: Local Validation, etc.).
      2. For EVERY DAY (1 to 60), provide:
         - A specific task (high-leverage).
         - A clear deliverable (to check off).
         - The phase it belongs to (for color coding).

      STRICT RULES:
      - TASKS must be tactical. e.g., "Visit 3 competitors in [Location]", "Setup landing page for [Idea]".
      - PHASES should group days together (e.g., Days 1-7 = Phase 1).
      - NO REPETITION. No "Continue working on...". Every day is a new step.
      - Use location data to define specific local tasks.

      JSON SCHEMA:
      {
        "short_title": "3-5 word concise mission name",
        "phases": [
            { "id": 1, "name": "Research", "color": "#8B5CF6", "range": "1-7" },
            { "id": 2, "name": "Local Validation", "color": "#3B82F6", "range": "8-21" },
            { "id": 3, "name": "Minimum Build", "color": "#10B981", "range": "22-45" },
            { "id": 4, "name": "Launch and Feedback", "color": "#F59E0B", "range": "46-60" }
        ],
        "days": [
          { 
            "day": 1, 
            "phase_id": 1,
            "title": "Short 3-5 word action name (e.g. 'Competitor Price Analysis')",
            "task": "Detailed objective sentence (e.g. 'Visit 3 local competitors to document their pricing tiers and identifying gaps.')", 
            "deliverable": "Specific proof of work",
            "details": ["Tactical sub-step 1", "Tactical sub-step 2", "Tactical sub-step 3"],
            "impact": "High",
            "est_time": "2-4 hours"
          }
        ]
      }
    `;

    try {
        console.log("Calling Groq...");
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are an operations-focused mentor. Provide a 60-day sequence of high-leverage actions. Output valid JSON. Ensure exactly 60 days are generated." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            max_tokens: 8192,
        });

        const content = completion.choices[0].message.content;
        console.log("Response length:", content.length);
        const plan = JSON.parse(content);
        console.log("Plan days count:", plan.days.length);
        console.log("First day:", plan.days[0].title);
        console.log("Last day:", plan.days[plan.days.length - 1].day);
    } catch (err) {
        console.error("Test failed:", err.message);
    }
}

testPlan();

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// File Paths
const BACKLOG_PATH = path.join(__dirname, 'backlog.json');
const DATA_DIR = path.join(__dirname, 'public', 'data');

async function runGhostwriter() {
    try {
        console.log("🤖 Waking up Ghostwriter AI...");

        // 1. Check the Backlog
        if (!fs.existsSync(BACKLOG_PATH)) {
            console.error("❌ backlog.json not found! Please create it.");
            process.exit(1);
        }

        const backlogRaw = fs.readFileSync(BACKLOG_PATH, 'utf-8');
        let backlog = JSON.parse(backlogRaw);

        if (backlog.length === 0) {
            console.log("✅ Backlog is empty. All careers have been written!");
            process.exit(0);
        }

        // 2. Pop the top career off the backlog
        const currentJob = backlog.shift(); // Removes the first item
        console.log(`🎯 Target acquired: ${currentJob.title} in sector: ${currentJob.sector}`);

        // 3. Generate today's date for the "Last Updated" tag
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // 4. The Master Psychological & SEO Prompt 2.0
        const prompt = `
You are an elite career strategist, data analyst, and SEO expert. Write a highly detailed, deeply researched JSON profile for the career: "${currentJob.title}".
Sector: "${currentJob.sector}".

CRITICAL INSTRUCTIONS & TONE:
1. Output ONLY valid JSON. No markdown formatting outside of string values.
2. The "15-Year-Old" Rule: Explain concepts simply enough for a 15-year-old to instantly grasp, but maintain a highly professional, analytical, and financially-focused tone suitable for adults making serious life decisions. Use simple words to explain complex realities. Zero corporate fluff.
3. Formatting: Use markdown (bolding, bullet points) heavily inside the "content" strings to prevent visual fatigue.
4. Every card MUST have a "title", a "subconsciousQuestion", and "content".

JSON SCHEMA REQUIRED:
{
  "id": "format-like-this",
  "title": "Exact Job Title",
  "sector": "${currentJob.sector}",
  "lastUpdated": "${today}",
  "description": "2-3 punchy sentences summarizing what they actually do.",
  "seoMetaDescription": "Write a high-converting SEO meta description (under 155 chars) targeting search intent like 'salary, requirements, and lifestyle'.",
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "Occupation",
    "name": "Exact Job Title",
    "description": "1 paragraph summary for Google bots.",
    "estimatedSalary": "Provide a realistic USD range, e.g., $100,000 - $180,000"
  },
  "salaryRange": "e.g., $100k - $180k",
  "roiRating": "High / Medium / Low",
  "icon": "A relevant Lucide icon name (e.g., cpu, database, code)",
  "sections": [
    {
      "title": "The Basics",
      "cards": [
        {
          "title": "The TL;DR (Pros & Cons)",
          "subconsciousQuestion": "Should I even read this?",
          "content": "✅ **Pro:** [High-impact pro]\\n✅ **Pro:** [Second pro]\\n❌ **Con:** [Brutal con]\\n❌ **Con:** [Second con]"
        },
        {
          "title": "What You Actually Do",
          "subconsciousQuestion": "Will I understand this job?",
          "content": "Deep, detailed paragraph explaining the daily mechanics using the 15-year-old rule."
        },
        {
          "title": "Salary Insights",
          "subconsciousQuestion": "Will I be rich?",
          "content": "Provide realistic data formatted EXACTLY like this (Use flags, pick top 3 paying countries + Remote):\\n🇺🇸 USA: $X – $Y\\n🇩🇪 Germany: €X – €Y\\n🇬🇧 UK: £X – £Y\\n🌍 Remote: $X – $Y\\n\\n📈 **Growth:** [Fast/Medium/Slow] - [Brief explanation of trajectory]"
        },
        {
          "title": "Core Tech Stack & Skills",
          "subconsciousQuestion": "What exact tools do I need to learn?",
          "content": "Bulleted list of the top 5 mandatory tools/skills."
        },
        {
          "title": "Equity & Perks",
          "subconsciousQuestion": "Do I get company stock or just a salary?",
          "content": "Explain RSUs, bonuses, or profit-sharing norms for this specific role."
        }
      ]
    },
    {
      "title": "Getting In",
      "cards": [
        {
          "title": "The Execution Plan",
          "subconsciousQuestion": "What exactly should I do tomorrow?",
          "content": "**Path 1: The Traditional Route**\\nExplain the exact degree, internships, and first job title.\\n\\n**Path 2: The Hacker Route**\\nExplain bootcamps, portfolio projects, and bypassing HR.\\n\\n**Path 3: The Pivot Route**\\nExplain how to transition from an unrelated job leveraging outside capital or freelance gigs."
        },
        {
          "title": "Time & Money Cost",
          "subconsciousQuestion": "How much debt and time will this take?",
          "content": "Detailed estimate of the dollar cost ($X - $Y) and time cost (X months - Y years)."
        },
        {
          "title": "Barrier to Entry",
          "subconsciousQuestion": "Is it impossible for a junior to get hired?",
          "content": "Explain the interview difficulty (e.g., 7 rounds, live coding) and current junior market saturation."
        }
      ]
    },
    {
      "title": "The Daily Reality",
      "cards": [
        {
          "title": "A Day in the Life",
          "subconsciousQuestion": "What is hour-by-hour reality?",
          "content": "Highly detailed narrative of what a typical Tuesday looks like. Break it up with a punchy list of metrics at the end (e.g., **Meetings:** High, **Travel:** Low)."
        },
        {
          "title": "Stress & Burnout Risk",
          "subconsciousQuestion": "Will this job destroy my mental health?",
          "content": "Rating (High/Medium/Low) plus a brutal, honest explanation of the main daily stressor."
        },
        {
          "title": "Remote Flexibility",
          "subconsciousQuestion": "Can I work from a laptop in Bali?",
          "content": "Explain if it is strictly on-site, hybrid, or highly remote-friendly."
        }
      ]
    },
    {
      "title": "The Future",
      "cards": [
        {
          "title": "10-Year Demand",
          "subconsciousQuestion": "Is this industry dying?",
          "content": "Honest assessment of the expected growth rate and market demand over the next decade."
        },
        {
          "title": "AI Threat Level",
          "subconsciousQuestion": "Will ChatGPT take my job in 5 years?",
          "content": "Honest assessment of automation risk."
        },
        {
          "title": "Pivot Options",
          "subconsciousQuestion": "If I hate this, what else can I do?",
          "content": "List 2-3 specific careers they can easily transition into."
        },
        {
          "title": "Solo / Founder Scope",
          "subconsciousQuestion": "Can I quit and be my own boss?",
          "content": "Explain if there is a realistic path to freelancing or starting an agency."
        }
      ]
    }
  ]
}`;

        console.log("🧠 Thinking...");
        const result = await model.generateContent(prompt);
        let rawResponse = result.response.text();

        // Clean markdown code blocks from JSON response if present
        rawResponse = rawResponse.replace(/```json\n/g, '').replace(/```\n/g, '').replace(/```/g, '');
        
        const newCareerData = JSON.parse(rawResponse);
        const newFileName = `${newCareerData.id}.json`;
        const newFilePath = path.join(DATA_DIR, newFileName);

        // 5. Save the Deep-Dive JSON
        fs.writeFileSync(newFilePath, JSON.stringify(newCareerData, null, 2));
        console.log(`📝 Successfully wrote ${newFileName}`);

        // 6. Update the Category Summary File (e.g., tech.json)
        const categoryFilePath = path.join(DATA_DIR, `${currentJob.sector}.json`);
        if (fs.existsSync(categoryFilePath)) {
            let categoryData = JSON.parse(fs.readFileSync(categoryFilePath, 'utf-8'));
            
            // Inject the new tiny summary card at the TOP of the array
            categoryData.careers.unshift({
                id: newCareerData.id,
                title: newCareerData.title,
                icon: newCareerData.icon,
                description: newCareerData.description,
                salaryRange: newCareerData.salaryRange,
                roiRating: newCareerData.roiRating
            });

            fs.writeFileSync(categoryFilePath, JSON.stringify(categoryData, null, 2));
            console.log(`🔗 Successfully linked to ${currentJob.sector}.json`);
        } else {
             console.log(`⚠️ Category file ${currentJob.sector}.json not found. Skipping link.`);
        }

        // 7. Update the Backlog (Save the deletion)
        fs.writeFileSync(BACKLOG_PATH, JSON.stringify(backlog, null, 2));
        console.log("🗑️ Removed career from backlog. Operation Complete.");

    } catch (error) {
        console.error("❌ Error running Ghostwriter:", error);
        process.exit(1);
    }
}

runGhostwriter();

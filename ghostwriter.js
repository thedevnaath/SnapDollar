const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

// Connect securely using your hidden GitHub Secret
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runGhostwriter() {
    console.log("Waking up Ghostwriter...");
    
    // We force the AI to return clean JSON data
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are the Chief Data Architect for SnapDollar, a career discovery platform. 
    Your job is to identify a high-value, highly-paid, or emerging career that we should add to our database. (For example: AI Prompt Engineer, Neuro-tech Researcher, Corporate Restructuring Lawyer, etc.)
    
    Generate a complete, highly-detailed JSON file for this career.
    It MUST STRICTLY follow this exact schema:
    {
      "id": "kebab-case-job-title",
      "title": "Full Job Title",
      "icon": "lucide-icon-name", (Choose a valid Lucide icon like cpu, stethoscope, landmark, zap, etc.)
      "tagline": "A punchy, exciting one-sentence tagline.",
      "overview": "A detailed 2-3 sentence overview of the impact and reality of the job.",
      "growthPredicted": "Predicted job growth over the next decade.",
      "roiRating": "Excellent, High, or Good",
      "timeToROI": "E.g., 2-4 Years",
      "salary": {
        "entry": "$...",
        "mid": "$...",
        "senior": "$..."
      },
      "dayInTheLife": "A realistic breakdown of how they spend their 9-to-5.",
      "famousExamples": {
        "individuals": ["Name 1", "Name 2"],
        "companies": ["Company 1", "Company 2"]
      },
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2", "Con 3"]
    }`;

    try {
        const result = await model.generateContent(prompt);
        let rawText = result.response.text();
        
        // CLEANER: Strip out any markdown formatting the AI might add
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const careerData = JSON.parse(rawText);
        
        // Save the AI's output as a new JSON file
        const filePath = `./public/data/${careerData.id}.json`;
        fs.writeFileSync(filePath, JSON.stringify(careerData, null, 2));
        
        console.log(`Success! Generated database file for: ${careerData.title}`);
    } catch (error) {
        console.error("Ghostwriter encountered an error:", error);
        process.exit(1);
    }
}

runGhostwriter();

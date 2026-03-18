const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

// Connect securely using your hidden GitHub Secret
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runGhostwriter() {
    console.log("Waking up Ghostwriter...");
    
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    // We added 'categoryId' to the prompt so the AI knows which folder to link it to
    const prompt = `
    You are the Chief Data Architect for SnapDollar. 
    Identify a high-value, highly-paid, or emerging career that we should add to our database.
    
    You MUST include a "categoryId" field. Choose the best fit from this exact list: "tech", "finance", "healthcare", "business", "engineering".
    
    Generate a complete JSON file STRICTLY following this exact schema:
    {
      "categoryId": "tech",
      "id": "kebab-case-job-title",
      "title": "Full Job Title",
      "icon": "cpu", 
      "tagline": "A punchy one-sentence tagline.",
      "overview": "A detailed 2-3 sentence overview of the job.",
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
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"]
    }`;

    try {
        const result = await model.generateContent(prompt);
        let rawText = result.response.text();
        
        // Strip markdown formatting
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const careerData = JSON.parse(rawText);
        
        // --- ACTION 1: SAVE THE DEEP DIVE FILE ---
        const deepDivePath = `./public/data/${careerData.id}.json`;
        fs.writeFileSync(deepDivePath, JSON.stringify(careerData, null, 2));
        console.log(`✅ Saved Deep Dive: ${careerData.id}.json`);

        // --- ACTION 2: UPDATE THE CATEGORY MANIFEST ---
        const manifestPath = `./public/data/${careerData.categoryId}.json`;
        let manifestData;
        
        // If the category file (like tech.json) exists, read it. If not, create a skeleton.
        if (fs.existsSync(manifestPath)) {
            manifestData = JSON.parse(fs.readFileSync(manifestPath));
        } else {
            manifestData = {
                category: careerData.categoryId.toUpperCase(),
                description: `Explore top careers in the ${careerData.categoryId} sector.`,
                careers: []
            };
        }

        // Build the tiny summary card for the category page
        const summaryCard = {
            id: careerData.id,
            title: careerData.title,
            icon: careerData.icon,
            salaryRange: `${careerData.salary.entry} - ${careerData.salary.senior}`,
            roiRating: careerData.roiRating,
            description: careerData.overview
        };

        // Prevent duplicates: Only add it if it doesn't already exist in the list
        const exists = manifestData.careers.find(c => c.id === careerData.id);
        if (!exists) {
            manifestData.careers.push(summaryCard);
            fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
            console.log(`✅ Updated Manifest: Added ${careerData.title} to ${careerData.categoryId}.json`);
        } else {
            console.log(`⚠️ Career ${careerData.id} is already in the manifest.`);
        }

    } catch (error) {
        console.error("Ghostwriter encountered an error:", error);
        process.exit(1);
    }
}

runGhostwriter();

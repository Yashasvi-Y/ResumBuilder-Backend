import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Simple in-memory cache for development
const suggestionCache = new Map();

// Generate cache key from inputs
const getCacheKey = (type, inputs) => {
    // Remove _attempt from cache key generation but use it to create unique keys
    const { _attempt, ...dataForCache } = inputs;
    const baseKey = `${type}:${JSON.stringify(dataForCache).toLowerCase()}`;
    // Add attempt number to key so each "Try Another" gets new result
    return `${baseKey}:attempt${_attempt || 0}`;
};

// Suggest improved work description - FLEXIBLE, CONTEXT-AWARE, CACHED
export const suggestWorkDescription = async (company, role, currentDescription, _attempt = 0) => {
    try {
        const cacheKey = getCacheKey("work", { company, role, currentDescription, _attempt });
        
        // Check cache first
        if (suggestionCache.has(cacheKey)) {
            console.log(`✅ Cache hit for work description (attempt ${_attempt})!`);
            return suggestionCache.get(cacheKey);
        }

        const prompt = `You are a professional resume writer who adapts to ANY context automatically.

Company/Organization: ${company}
Role/Position: ${role}
Current description: "${currentDescription}"

Analyze this role and context, then improve the description to be more impactful:
- If it's a student/academic role: highlight learning, technologies, academic impact
- If it's a professional role: highlight metrics, business results, achievements  
- If it's freelance/startup: highlight innovation, solutions, client impact
- If it's research: highlight discoveries, contributions
- Adapt your tone and vocabulary to match their context

Keep it concise (2-3 points with strong action verbs).`;

        const result = await model.generateContent(prompt);
        const suggestion = result.response.text();
        
        // Cache the result
        suggestionCache.set(cacheKey, suggestion);
        return suggestion;
    } catch (error) {
        console.error("❌ Error:", error.message);
        
        // Check if it's a quota error
        if (error.message && (error.message.includes("429") || error.message.includes("quota") || error.message.includes("Quota exceeded"))) {
            console.log("⚠️ API quota exceeded. User should wait a moment and retry.");
            throw new Error("API quota limit reached. Please wait a moment and try again.");
        }
        
        throw new Error("Failed to get suggestions from Gemini: " + error.message);
    }
};

// Suggest skills based on role - FLEXIBLE, CACHED
export const suggestSkills = async (role, experience, _attempt = 0) => {
    try {
        const cacheKey = getCacheKey("skills", { role, experience, _attempt });
        
        if (suggestionCache.has(cacheKey)) {
            console.log(`✅ Cache hit for skills (attempt ${_attempt})!`);
            return suggestionCache.get(cacheKey);
        }

        const prompt = `You are a career advisor who understands all contexts.

Role/Field: ${role}
Experience Level: ${experience}

Based on the role and experience level, suggest 5-7 highly relevant skills:
- If student: entry-level, learning-focused, internship-ready skills
- If professional: advanced, specialization, career progression skills
- If freelancer: diverse, client-facing, versatile skills
- If researcher: research-specific, analytical, domain expertise skills
- Adapt to their specific context

Return ONLY skill names separated by commas (no explanations).`;

        const result = await model.generateContent(prompt);
        const suggestion = result.response.text();
        
        suggestionCache.set(cacheKey, suggestion);
        return suggestion;
    } catch (error) {
        console.error("❌ Error:", error.message);
        
        if (error.message && (error.message.includes("429") || error.message.includes("quota") || error.message.includes("Quota exceeded"))) {
            console.log("⚠️ API quota exceeded. User should wait a moment and retry.");
            throw new Error("API quota limit reached. Please wait a moment and try again.");
        }
        
        throw new Error("Failed to get skills suggestions from Gemini: " + error.message);
    }
};

// Suggest improved project description - FLEXIBLE, CACHED
export const suggestProjectDescription = async (projectTitle, currentDescription, _attempt = 0) => {
    try {
        const cacheKey = getCacheKey("project", { projectTitle, currentDescription, _attempt });
        
        if (suggestionCache.has(cacheKey)) {
            console.log(`✅ Cache hit for project description (attempt ${_attempt})!`);
            return suggestionCache.get(cacheKey);
        }

        const prompt = `You are a content writer who improves project descriptions for any context.

Project: ${projectTitle}
Current description: "${currentDescription}"

Improve this to be impressive and impactful:
- If academic: highlight learnings, technical stack, academic value
- If professional: highlight deliverables, metrics, business impact
- If personal/startup: highlight innovation, problem-solving, results
- If research: highlight findings, methodology, contributions
- Use strong action verbs and specific achievements
- Be concise and compelling

Return only the improved description.`;

        const result = await model.generateContent(prompt);
        const suggestion = result.response.text();
        
        suggestionCache.set(cacheKey, suggestion);
        return suggestion;
    } catch (error) {
        console.error("❌ Error:", error.message);
        
        if (error.message && (error.message.includes("429") || error.message.includes("quota") || error.message.includes("Quota exceeded"))) {
            console.log("⚠️ API quota exceeded. User should wait a moment and retry.");
            throw new Error("API quota limit reached. Please wait a moment and try again.");
        }
        
        throw new Error("Failed to get project suggestions from Gemini: " + error.message);
    }
};

// Convert responsibilities to achievements - FLEXIBLE, CACHED
export const suggestAchievements = async (role, responsibility, _attempt = 0) => {
    try {
        const cacheKey = getCacheKey("achievements", { role, responsibility, _attempt });
        
        if (suggestionCache.has(cacheKey)) {
            console.log(`✅ Cache hit for achievements (attempt ${_attempt})!`);
            return suggestionCache.get(cacheKey);
        }

        const prompt = `You are a resume coach who works with all career types.

Role/Position: ${role}
Task/Responsibility: "${responsibility}"

Convert this into 2-3 impressive achievement bullets, adapting to their context:
- If student/academic: highlight learning, skills gained, academic impact
- If professional: highlight business results, metrics, professional value
- If research: highlight findings, innovations, contributions
- If freelancer: highlight client value, solutions delivered, outcomes
- Use strong action verbs (Developed, Improved, Led, Designed, Spearheaded, etc.)
- Make each bullet specific and impactful
- Adapt tone to their context

Return only the bullet points, numbered 1-3.`;

        const result = await model.generateContent(prompt);
        const suggestion = result.response.text();
        
        suggestionCache.set(cacheKey, suggestion);
        return suggestion;
    } catch (error) {
        console.error("❌ Error:", error.message);
        
        if (error.message && (error.message.includes("429") || error.message.includes("quota") || error.message.includes("Quota exceeded"))) {
            console.log("⚠️ API quota exceeded. User should wait a moment and retry.");
            throw new Error("API quota limit reached. Please wait a moment and try again.");
        }
        
        throw new Error("Failed to get achievements suggestions from Gemini: " + error.message);
    }
};

// Suggest professional summary - FLEXIBLE, CACHED
export const suggestProfessionalSummary = async (jobTitle, experience, skills, _attempt = 0) => {
    try {
        const cacheKey = getCacheKey("summary", { jobTitle, experience, skills, _attempt });
        
        if (suggestionCache.has(cacheKey)) {
            console.log(`✅ Cache hit for summary (attempt ${_attempt})!`);
            return suggestionCache.get(cacheKey);
        }

        const skillsText = skills && skills.length > 0 ? skills.join(", ") : "various technologies and skills";
        
        const prompt = `You are a professional writer who creates compelling summaries for any career path.

Job Title: ${jobTitle}
Experience Level: ${experience}
Key Skills: ${skillsText}

Create a compelling 2-3 sentence professional summary, automatically adapting to their context:
- If student: highlight academic achievements, technical skills, career aspirations, learning potential
- If professional: highlight career trajectory, key strengths, unique value proposition
- If freelancer: highlight diverse expertise, client success, specializations  
- If researcher: highlight research focus, contributions, expertise domain
- Detect and adapt based on the job title and experience level
- Make it authentic, engaging, and impactful
- USE PLACEHOLDERS: Replace actual years/numbers with [years], specific companies with [companies], etc.
- Example: "with [years] of experience" instead of "with 5 years of experience"

Return only the summary with placeholders for user to customize, no meta-commentary.`;

        const result = await model.generateContent(prompt);
        const suggestion = result.response.text();
        
        suggestionCache.set(cacheKey, suggestion);
        return suggestion;
    } catch (error) {
        console.error("❌ Error:", error.message);
        
        if (error.message && (error.message.includes("429") || error.message.includes("quota") || error.message.includes("Quota exceeded"))) {
            console.log("⚠️ API quota exceeded. User should wait a moment and retry.");
            throw new Error("API quota limit reached. Please wait a moment and try again.");
        }
        
        throw new Error("Failed to get summary suggestions from Gemini: " + error.message);
    }
};

// Helper to clear cache (useful for testing fresh suggestions)
export const clearSuggestionCache = () => {
    suggestionCache.clear();
    console.log("🧹 Suggestion cache cleared!");
};


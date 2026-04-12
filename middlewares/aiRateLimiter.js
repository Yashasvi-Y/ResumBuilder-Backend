/**
 * AI Suggestion Rate Limiting
 * Limits users to 5 suggestions per day
 */

const aiSuggestionCounts = new Map(); // { userId: { count, resetTime } }
const DAILY_LIMIT = 5;
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if user has remaining quota
 */
export const checkAISuggestionQuota = (userId) => {
    if (!userId) {
        return { hasQuota: false, message: "Please log in to use AI suggestions" };
    }

    const now = Date.now();
    
    if (!aiSuggestionCounts.has(userId)) {
        // First time, set up counter
        aiSuggestionCounts.set(userId, {
            count: 0,
            resetTime: now + RESET_INTERVAL
        });
        return { hasQuota: true, remaining: DAILY_LIMIT };
    }

    const record = aiSuggestionCounts.get(userId);

    // Check if reset period has passed
    if (now > record.resetTime) {
        record.count = 0;
        record.resetTime = now + RESET_INTERVAL;
        return { hasQuota: true, remaining: DAILY_LIMIT };
    }

    // Check if quota exceeded
    if (record.count >= DAILY_LIMIT) {
        const resetIn = Math.ceil((record.resetTime - now) / 1000); // seconds
        return { 
            hasQuota: false, 
            remaining: 0,
            resetIn,
            message: `Daily AI suggestion limit reached (${DAILY_LIMIT}/day). Quota resets in ${Math.floor(resetIn / 60)} minutes.`
        };
    }

    return { hasQuota: true, remaining: DAILY_LIMIT - record.count };
};

/**
 * Increment suggestion counter
 */
export const incrementAISuggestionCount = (userId) => {
    if (!aiSuggestionCounts.has(userId)) {
        const now = Date.now();
        aiSuggestionCounts.set(userId, {
            count: 1,
            resetTime: now + RESET_INTERVAL
        });
        return { count: 1, remaining: DAILY_LIMIT - 1 };
    }

    const record = aiSuggestionCounts.get(userId);
    record.count++;
    
    return { count: record.count, remaining: DAILY_LIMIT - record.count };
};

/**
 * Get user's current suggestion usage
 */
export const getUserSuggestionUsage = (userId) => {
    if (!aiSuggestionCounts.has(userId)) {
        return { used: 0, total: DAILY_LIMIT, remaining: DAILY_LIMIT };
    }

    const record = aiSuggestionCounts.get(userId);
    return { 
        used: record.count, 
        total: DAILY_LIMIT, 
        remaining: DAILY_LIMIT - record.count,
        resetTime: new Date(record.resetTime).toISOString()
    };
};

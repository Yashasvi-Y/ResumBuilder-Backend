/**
 * Login Rate Limiting Middleware
 * Blocks after 5 failed attempts in 30 minutes for 15 minutes
 */

const loginAttempts = new Map(); // { username: { count, firstAttempt, lockedUntil } }
const FAILED_ATTEMPTS_LIMIT = 5;
const ATTEMPT_WINDOW = 30 * 60 * 1000; // 30 minutes
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Check if user is rate limited (locked out)
 */
export const checkLoginRateLimit = (username) => {
    if (!loginAttempts.has(username)) {
        return { isLocked: false };
    }

    const record = loginAttempts.get(username);
    const now = Date.now();

    // If lockout period has expired, reset
    if (record.lockedUntil && now > record.lockedUntil) {
        loginAttempts.delete(username);
        return { isLocked: false };
    }

    // If currently locked
    if (record.lockedUntil && now < record.lockedUntil) {
        const remainingTime = Math.ceil((record.lockedUntil - now) / 1000); // seconds
        return { 
            isLocked: true, 
            remainingTime,
            message: `Too many failed attempts. Try again after ${remainingTime} seconds.`
        };
    }

    return { isLocked: false };
};

/**
 * Record a failed login attempt
 */
export const recordFailedAttempt = (username) => {
    const now = Date.now();
    
    if (!loginAttempts.has(username)) {
        // First attempt
        loginAttempts.set(username, {
            count: 1,
            firstAttempt: now,
            lockedUntil: null
        });
        return { shouldLock: false, attempts: 1 };
    }

    const record = loginAttempts.get(username);

    // If this is beyond the 30-minute window, reset
    if (now - record.firstAttempt > ATTEMPT_WINDOW) {
        loginAttempts.set(username, {
            count: 1,
            firstAttempt: now,
            lockedUntil: null
        });
        return { shouldLock: false, attempts: 1 };
    }

    // Increment attempts
    record.count++;

    // Check if we've hit the limit
    if (record.count >= FAILED_ATTEMPTS_LIMIT) {
        record.lockedUntil = now + LOCKOUT_DURATION;
        return { shouldLock: true, attempts: record.count };
    }

    return { shouldLock: false, attempts: record.count };
};

/**
 * Clear failed attempts (on successful login)
 */
export const clearLoginAttempts = (username) => {
    loginAttempts.delete(username);
};

/**
 * Get remaining attempts before lockout
 */
export const getRemainingAttempts = (username) => {
    if (!loginAttempts.has(username)) {
        return FAILED_ATTEMPTS_LIMIT;
    }

    const record = loginAttempts.get(username);
    const remaining = FAILED_ATTEMPTS_LIMIT - record.count;
    return Math.max(0, remaining);
};

/**
 * Middleware to use in routes
 */
export const loginRateLimitMiddleware = (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
        return next();
    }

    const rateLimitStatus = checkLoginRateLimit(email);
    if (rateLimitStatus.isLocked) {
        return res.status(429).json({
            success: false,
            message: rateLimitStatus.message,
            retryAfter: rateLimitStatus.remainingTime
        });
    }

    next();
};

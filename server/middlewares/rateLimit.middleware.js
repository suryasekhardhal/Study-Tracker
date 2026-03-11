import rateLimit from "express-rate-limit";

/*
-----------------------------------------
GENERAL API LIMIT
-----------------------------------------
*/

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    message: {
        success: false,
        message: "Too many requests, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});


/*
-----------------------------------------
AUTH ROUTES LIMIT
-----------------------------------------
*/

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // login/register attempts
    message: {
        success: false,
        message: "Too many login attempts. Try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});
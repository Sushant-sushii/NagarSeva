const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Try to get token from Authorization header first (Bearer token)
        let token = null;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7); // Remove "Bearer " prefix
        }
        
        // Fallback to authToken cookie if no Bearer token in header
        if (!token && req.cookies && req.cookies.authToken) {
            token = req.cookies.authToken;
        }
        
        // If no token found from either source, return unauthorized
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Please login first."
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET );
        
        // Attach user data to request
        req.user = decoded;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please login again."
            });
        }
        
        return res.status(401).json({
            success: false,
            message: "Invalid token. Please login again.",
            error: error.message
        });
    }
};

module.exports = authMiddleware;

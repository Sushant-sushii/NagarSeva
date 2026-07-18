// Validation middleware for auth routes

const validateRegister = (req, res, next) => {
    const { firstName, LastName, email, password, wardNumber } = req.body;

    // Check required fields
    if (!firstName || !LastName || !email || !password || !wardNumber) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: firstName, LastName, email, password, wardNumber"
        });
    }

    // Validate firstName
    if (typeof firstName !== 'string' || firstName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "firstName must be at least 2 characters long"
        });
    }

    // Validate LastName
    if (typeof LastName !== 'string' || LastName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "LastName must be at least 2 characters long"
        });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    // Validate password
    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long"
        });
    }

    // Validate wardNumber
    if (typeof wardNumber !== 'string' || wardNumber.trim().length < 1) {
        return res.status(400).json({
            success: false,
            message: "Ward number is required"
        });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    // Validate password
    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Invalid password format"
        });
    }

    next();
};

const validateUpdate = (req, res, next) => {
    const { firstName, LastName, department } = req.body;

    // At least one field must be provided
    if (!firstName && !LastName && !department) {
        return res.status(400).json({
            success: false,
            message: "At least one field must be provided for update"
        });
    }

    // Validate firstName if provided
    if (firstName && (typeof firstName !== 'string' || firstName.trim().length < 2)) {
        return res.status(400).json({
            success: false,
            message: "firstName must be at least 2 characters long"
        });
    }

    // Validate LastName if provided
    if (LastName && (typeof LastName !== 'string' || LastName.trim().length < 2)) {
        return res.status(400).json({
            success: false,
            message: "LastName must be at least 2 characters long"
        });
    }

    // Validate wardNumber if provided
    if (wardNumber && (typeof wardNumber !== 'string' || wardNumber.trim().length < 1)) {
        return res.status(400).json({
            success: false,
            message: "Ward number must be valid"
        });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateUpdate
};

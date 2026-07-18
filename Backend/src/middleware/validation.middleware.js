// Validation middleware for auth routes

const validateRegister = (req, res, next) => {
    const { firstName, LastName, email, password, role, wardLocation, department } = req.body;

    // 1. Check baseline universal required fields
    if (!firstName || !LastName || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: firstName, LastName, email, password, and role"
        });
    }

    // 2. Validate firstName
    if (typeof firstName !== 'string' || firstName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "firstName must be at least 2 characters long"
        });
    }

    // 3. Validate LastName
    if (typeof LastName !== 'string' || LastName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "LastName must be at least 2 characters long"
        });
    }

    // 4. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    // 5. Validate password
    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long"
        });
    }

    // 6. Role-Specific Validation (Fixes the Official signup error)
    if (role === 'citizen') {
        if (!wardLocation || typeof wardLocation !== 'string' || wardLocation.trim().length < 1) {
            return res.status(400).json({
                success: false,
                message: "Ward Location is required for Citizen accounts"
            });
        }
    } else if (role === 'official') {
        if (!department || typeof department !== 'string' || department.trim().length < 1) {
            return res.status(400).json({
                success: false,
                message: "Department selection is required for Official accounts"
            });
        }
    } else {
        return res.status(400).json({
            success: false,
            message: "Invalid role specified. Must be 'citizen' or 'official'"
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
    // Destructured wardLocation here to avoid a "wardLocation is not defined" reference error
    const { firstName, LastName, wardLocation, department } = req.body;

    // At least one field must be provided
    if (!firstName && !LastName && !wardLocation && !department) {
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

    // Validate wardLocation if provided
    if (wardLocation && (typeof wardLocation !== 'string' || wardLocation.trim().length < 1)) {
        return res.status(400).json({
            success: false,
            message: "Ward location must be valid"
        });
    }

    // Validate department if provided
    if (department && (typeof department !== 'string' || department.trim().length < 1)) {
        return res.status(400).json({
            success: false,
            message: "Department description must be valid"
        });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateUpdate
};
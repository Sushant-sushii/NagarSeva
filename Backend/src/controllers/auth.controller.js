const userModel = require('../model/User.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Register User
async function registerUser(req, res) {
    try {
        const { firstName, LastName, email, password, role = 'citizen', wardLocation, department } = req.body;
        const normalizedRole = role.toLowerCase();

        // 1. Validate universal baseline fields
        if (!firstName || !LastName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All required core fields must be provided"
            });
        }

        // 2. Validate conditional fields based on role selection
        if (normalizedRole === 'citizen' && !wardLocation) {
            return res.status(400).json({
                success: false,
                message: "Ward Location is required for Citizen registration"
            });
        }

        if (normalizedRole === 'official' && !department) {
            return res.status(400).json({
                success: false,
                message: "Department selection is required for Official registration"
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

        // Check if user already exists
        const isUserAlreadyExist = await userModel.findOne({ email });
        if (isUserAlreadyExist) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user mapped by normalized role profile attributes
        const newUser = new userModel({
            firstName,
            LastName,
            email,
            password: hashedPassword,
            role: normalizedRole,
            wardLocation: normalizedRole === 'citizen' ? wardLocation : null,
            department: normalizedRole === 'official' ? department : null
        });

        await newUser.save();

        // Generate token
        const token = generateToken(newUser._id, newUser.role);

        // Set HTTP-only cookie with token for persistent login (7 days)
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        // Return success response including both wardLocation and department
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                LastName: newUser.LastName,
                email: newUser.email,
                role: newUser.role,
                wardLocation: newUser.wardLocation,
                department: newUser.department
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: "Error during registration",
            error: error.message
        });
    }
}

// Login User
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare passwords (fixed extra parameters)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate token (fixed extra parameters)
        const token = generateToken(user._id, user.role);

        // Set HTTP-only cookie with token for persistent login (7 days)
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        // Return success response with complete metadata mapping
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                LastName: user.LastName,
                email: user.email,
                role: user.role,
                wardLocation: user.wardLocation,
                department: user.department
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "Error during login",
            error: error.message
        });
    }
}

// Get User Profile
async function getUserProfile(req, res) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User ID not found"
            });
        }

        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user profile",
            error: error.message
        });
    }
}

// Update User Profile
async function updateUserProfile(req, res) {
    try {
        const userId = req.user?.userId;
        const { firstName, LastName, wardLocation, department } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User ID not found"
            });
        }

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (LastName) updateData.LastName = LastName;
        if (wardLocation) updateData.wardLocation = wardLocation;
        if (department) updateData.department = department;

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: "Error updating user profile",
            error: error.message
        });
    }
}

// Logout User (clear authToken cookie)
async function logoutUser(req, res) {
    try {
        // Clear the HTTP-only cookie
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error during logout",
            error: error.message
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    logoutUser,
    generateToken
};
const Complain = require('../model/Complain.model');
const userModel = require('../model/User.model');

/**
 * Create a new complaint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createComplaint(req, res) {
    try {
        const userId = req.user?.userId;
        const { location, category, department, severity, wardNumber, imageUrl, isSafetyHazardAtNight, description, localArea } = req.body;

        // Validate required fields
        if (!location || !category || !department || !wardNumber || !description) {
            return res.status(400).json({
                success: false,
                message: "location, category, department, wardNumber, and description are required"
            });
        }

        // Validate location object has latitude and longitude
        if (!location.latitude || !location.longitude) {
            return res.status(400).json({
                success: false,
                message: "location.latitude and location.longitude are required"
            });
        }

        // Convert latitude/longitude to GeoJSON format [longitude, latitude]
        const geoJSONLocation = {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
        };

        // Create new complaint
        const newComplaint = new Complain({
            citizenId: userId,
            location: geoJSONLocation,
            category,
            department,
            severity: severity || 'Medium',
            wardNumber,
            imageUrl: imageUrl || null,
            isSafetyHazardAtNight: isSafetyHazardAtNight || false,
            description,
            localArea: localArea || 'Unknown Area',
            status: 'Open'
        });

        await newComplaint.save();

        // Populate citizen data
        await newComplaint.populate('citizenId', 'firstName LastName email');

        return res.status(201).json({
            success: true,
            message: "Complaint created successfully",
            complaint: newComplaint
        });

    } catch (error) {
        console.error('Create complaint error:', error);
        return res.status(500).json({
            success: false,
            message: "Error creating complaint",
            error: error.message
        });
    }
}

/**
 * Get a single complaint by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getComplaintById(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Complaint ID is required"
            });
        }

        const complaint = await Complain.findById(id).populate('citizenId', 'firstName LastName email wardNumber');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        return res.status(200).json({
            success: true,
            complaint
        });

    } catch (error) {
        console.error('Get complaint error:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching complaint",
            error: error.message
        });
    }
}

/**
 * Get all complaints with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllComplaints(req, res) {
    try {
        const { status, category, department, wardNumber, severity, page = 1, limit = 10 } = req.query;

        // Auto-escalation check: mark open complaints older than 15 days as escalated
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        await Complain.updateMany(
            { status: 'Open', createdAt: { $lt: fifteenDaysAgo } },
            { $set: { status: 'Escalated' } }
        );

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (department) filter.department = department;
        if (wardNumber) filter.wardNumber = wardNumber;
        if (severity) filter.severity = severity;

        // Calculate pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Get total count
        const total = await Complain.countDocuments(filter);

        // Get complaints with pagination
        const complaints = await Complain.find(filter)
            .populate('citizenId', 'firstName LastName email')
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
            complaints
        });

    } catch (error) {
        console.error('Get all complaints error:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching complaints",
            error: error.message
        });
    }
}

/**
 * Get complaints filed by a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getComplaintsByUserId(req, res) {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Auto-escalation check: mark open complaints older than 15 days as escalated
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        await Complain.updateMany(
            { status: 'Open', createdAt: { $lt: fifteenDaysAgo } },
            { $set: { status: 'Escalated' } }
        );

        // Calculate pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Get total count
        const total = await Complain.countDocuments({ citizenId: userId });

        // Get user's complaints
        const complaints = await Complain.find({ citizenId: userId })
            .populate('citizenId', 'firstName LastName email')
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
            complaints
        });

    } catch (error) {
        console.error('Get user complaints error:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching user complaints",
            error: error.message
        });
    }
}

/**
 * Get complaints near a specific location (geospatial query)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getComplaintsNearLocation(req, res) {
    try {
        const { latitude, longitude, radius } = req.params;

        // Validate parameters
        if (!latitude || !longitude || !radius) {
            return res.status(400).json({
                success: false,
                message: "latitude, longitude, and radius are required"
            });
        }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const radiusInMeters = parseFloat(radius);

        if (isNaN(lat) || isNaN(lon) || isNaN(radiusInMeters)) {
            return res.status(400).json({
                success: false,
                message: "latitude, longitude, and radius must be valid numbers"
            });
        }

        // Geospatial query: find complaints within radius (in meters) of the point
        const complaints = await Complain.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lon, lat]
                    },
                    $maxDistance: radiusInMeters
                }
            }
        }).populate('citizenId', 'firstName LastName email');

        return res.status(200).json({
            success: true,
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error('Get nearby complaints error:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching nearby complaints",
            error: error.message
        });
    }
}

/**
 * Update complaint status (Open, Resolved, Escalated)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateComplaintStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, resolutionStatement } = req.body;

        // Validate status
        const validStatuses = ['Open', 'Resolved', 'Escalated'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status required: Open, Resolved, or Escalated"
            });
        }

        const updateData = { status };

        // If resolving, set resolvedAt timestamp and resolutionStatement
        if (status === 'Resolved') {
            updateData.resolvedAt = new Date();
            updateData.resolutionStatement = resolutionStatement || 'Resolved by official.';
            
            // Retrieve official user details to populate fields
            if (req.user && req.user.userId) {
                const official = await userModel.findById(req.user.userId);
                if (official) {
                    updateData.resolvedByOfficialName = `${official.firstName} ${official.LastName}`;
                }
            }
        }

        const updatedComplaint = await Complain.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('citizenId', 'firstName LastName email');

        if (!updatedComplaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Complaint status updated successfully",
            complaint: updatedComplaint
        });

    } catch (error) {
        console.error('Update complaint status error:', error);
        return res.status(500).json({
            success: false,
            message: "Error updating complaint status",
            error: error.message
        });
    }
}

/**
 * Update complaint fields (for admin/official)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateComplaint(req, res) {
    try {
        const { id } = req.params;
        const { category, department, severity, officialSummary, isSafetyHazardAtNight } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Complaint ID is required"
            });
        }

        // Build update object with only allowed fields
        const updateData = {};
        if (category) updateData.category = category;
        if (department) updateData.department = department;
        if (severity) updateData.severity = severity;
        if (officialSummary) updateData.officialSummary = officialSummary;
        if (isSafetyHazardAtNight !== undefined) updateData.isSafetyHazardAtNight = isSafetyHazardAtNight;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update"
            });
        }

        const updatedComplaint = await Complain.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('citizenId', 'firstName LastName email');

        if (!updatedComplaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Complaint updated successfully",
            complaint: updatedComplaint
        });

    } catch (error) {
        console.error('Update complaint error:', error);
        return res.status(500).json({
            success: false,
            message: "Error updating complaint",
            error: error.message
        });
    }
}

/**
 * Delete a complaint (only by creator or admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteComplaint(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Complaint ID is required"
            });
        }

        // Find the complaint
        const complaint = await Complain.findById(id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        // Check if user is the creator or admin
        if (complaint.citizenId.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to delete this complaint"
            });
        }

        // Delete the complaint
        await Complain.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Complaint deleted successfully"
        });

    } catch (error) {
        console.error('Delete complaint error:', error);
        return res.status(500).json({
            success: false,
            message: "Error deleting complaint",
            error: error.message
        });
    }
}

/**
 * Get complaint statistics for a specific ward
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getComplaintStats(req, res) {
    try {
        const { wardNumber } = req.params;

        if (!wardNumber) {
            return res.status(400).json({
                success: false,
                message: "Ward number is required"
            });
        }

        // Aggregate statistics
        const stats = await Complain.aggregate([
            {
                $match: { wardNumber }
            },
            {
                $facet: {
                    total: [
                        { $count: "count" }
                    ],
                    byStatus: [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    byCategory: [
                        { $group: { _id: "$category", count: { $sum: 1 } } }
                    ],
                    byDepartment: [
                        { $group: { _id: "$department", count: { $sum: 1 } } }
                    ],
                    bySeverity: [
                        { $group: { _id: "$severity", count: { $sum: 1 } } }
                    ],
                    safetyHazards: [
                        { $match: { isSafetyHazardAtNight: true } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        // Format the response
        const formattedStats = {
            wardNumber,
            total: stats[0]?.total[0]?.count || 0,
            byStatus: stats[0]?.byStatus || [],
            byCategory: stats[0]?.byCategory || [],
            byDepartment: stats[0]?.byDepartment || [],
            bySeverity: stats[0]?.bySeverity || [],
            safetyHazardsCount: stats[0]?.safetyHazards[0]?.count || 0
        };

        return res.status(200).json({
            success: true,
            stats: formattedStats
        });

    } catch (error) {
        console.error('Get stats error:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching complaint statistics",
            error: error.message
        });
    }
}

module.exports = {
    createComplaint,
    getComplaintById,
    getAllComplaints,
    getComplaintsByUserId,
    getComplaintsNearLocation,
    updateComplaintStatus,
    updateComplaint,
    deleteComplaint,
    getComplaintStats
};

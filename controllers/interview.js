const Interview = require('../models/Interview');
const Company = require('../models/Company');

// @desc    Get all interview sessions
// @route   GET /api/v1/interviewSessions
// @access  Public
exports.getInterviewSessions = async (req, res, next) => {
    let query;

    //General users can see only their interview sessions!
    if(req.user.role !== 'admin') {
        query = Interview.find({ user: req.user.id })
            .populate({
                path: 'company',
                select: 'name address website tel description'
            })
            .populate({
                path: 'user',
                select: 'name email'
            });
    }
    else {
        if (req.params.companyid) {
            console.log(req.params.companyid);
            query = Interview.find({ company: req.params.companyid })
                .populate({
                    path: "company",
                    select: "name address website tel description",
                })
                .populate({
                    path: 'user',
                    select: 'name email'
                });
        }
        else {
            query = Interview.find()
                .populate({
                    path: 'company',
                    select: 'name address website tel description'
                })
                .populate({
                    path: 'user',
                    select: 'name email'
                });
        }
    }

    try {
        const interviewSessions = await query;

        res.status(200).json({
            success: true,
            count: interviewSessions.length,
            data: interviewSessions
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Interview Session"
        })
    }
}

// @desc    Get single interview session
// @route   GET /api/v1/interviewSessions/:id
// @access  Public
exports.getInterviewSession = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate({
                path: 'company',
                select: 'name description tel address website'
            })
            .populate({
                path: 'user',
                select: 'name email'
            });

        //Make sure user is the interview owner
        if (interview.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success:false,
                message:`User ${req.user.id} is not authorized to update this interview`
            });
        }

        if (!interview) {
            return res.status(404).json({
                success:false,
                message:` No interview with the id of ${req.params.id}`
            });
        }
        res.status(200).json({
            success:true,
            data: interview
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot find Interview Session"
        });
    }
};

// @desc    Add interview session
// @route   POST /api/v1/companies/:companyid/interviews
// @access  Private
exports.addInterviewSession = async (req, res, next) => {
    try {
        req.body.company = req.params.companyid;
        const company = await Company.findById(req.params.companyid);

        if (!company) {
            return res.status(404).json({
                success: false,
                message:`No company with the id of ${req.params.companyid}`
            })
        }

        // add user Id to req.body
        req.body.user = req.user.id;

        // Check for existed interviews
        const existedInterviews = await Interview.find({ user:req.user.id });

        // If the user is not an admin, they can only create 3 interviews.
        if (existedInterviews.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success:false,
                message:`The user with ID ${req.user.id} has already booked 3 interviews`
            });
        }

        const interview = await Interview.create(req.body);

        res.status(201).json({
            success: true,
            data: interview
        });
    }
    catch (error) {
        console.log(error);

        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({
                success: false,
                message: message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Cannot create Interview"
        });
    }
}

// @desc    Update interview
// @route   PUT /api/v1/interviews/:id
// @access  Private
exports.updateInterviewSession = async (req, res, next) => {
    try {
        let interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: `No interview with the id of ${req.params.id}`
            });
        }

        //Make sure user is the interview owner
        // หมายเหตุ: หลังจากแก้ populate user ด้านบน ทำให้โครงสร้างเปลี่ยนไปนิดนึง เราอาจจะไม่ต้อง populate ตอนแก้ไข
        // แต่ถ้าเกิดว่าอยากเช็ค สามารถเช็คผ่าน object แบบด้านล่างได้เลย
        if (interview.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success:false,
                message:`User ${req.user.id} is not authorized to update this interview`
            });
        }

        interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: interview
        });
    }
    catch (error) {

        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({
                success: false,
                message: message
            });
        }

        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update Interview"
        });
    }
}

// @desc    Delete interview
// @route   DELETE /api/v1/interviews/:id
// @access  Private
exports.deleteInterviewSession = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);
        
        if (!interview) {
            return res.status(404).json({
                success: false,
                message: `No interview with the id of ${req.params.id}`
            });
        }

        //Make sure user is the interview owner
        if (interview.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success:false,
                message:`User ${req.user.id} is not authorized to delete this interview`
            });
        }

        await interview.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot delete Interview"
        }); 
    }
}

// @desc    Update attendance status
// @route   PUT /api/v1/interviews/:id/attendance
// @access  Private (admin only)
exports.updateAttendanceStatus = async (req, res, next) => {
    try {
        const { attendanceStatus } = req.body;

        if (!['pending', 'attended', 'absent'].includes(attendanceStatus)) {
            return res.status(400).json({
                success: false,
                message: 'attendanceStatus must be pending, attended, or absent'
            });
        }

        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: `No interview with the id of ${req.params.id}`
            });
        }

        const updated = await Interview.findByIdAndUpdate(
            req.params.id,
            { attendanceStatus },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updated
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot update attendance status'
        });
    }
};
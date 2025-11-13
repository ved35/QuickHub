import mongoose from 'mongoose';
import { errorHandler } from '../middleware/errorHandler.js';
import Staff from '../models/staff.model.js';
import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

// GET /company/dashboard/bookings - Company dashboard with all bookings
export const dashboardBookings = async (req, res, next) => {
  try {
    const {
      search,
      status,
      location,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sort = 'date_desc',
    } = req.query;

    const pg = Math.max(1, Number(page));
    const lim = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pg - 1) * lim;

    // Build match criteria
    const match = {};

    if (status) {
      const statusArray = String(status)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (statusArray.length) match.status = { $in: statusArray };
    }

    if (startDate || endDate) {
      match.startDate = {};
      if (startDate) match.startDate.$gte = new Date(startDate);
      if (endDate) match.startDate.$lte = new Date(endDate);
    }

    if (location) {
      const locationRegex = new RegExp(String(location).trim(), 'i');
      match['location.address'] = locationRegex;
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'staff',
          localField: 'staffId',
          foreignField: '_id',
          as: 'staff',
        },
      },
      { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'staff.userId',
          foreignField: '_id',
          as: 'staffUser',
        },
      },
      { $unwind: { path: '$staffUser', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    ];

    // Search functionality
    if (search && String(search).trim() !== '') {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'customer.name': searchRegex },
            { 'staffUser.name': searchRegex },
            { 'staff.name': searchRegex },
            { service: searchRegex },
            { referenceNo: searchRegex },
            { 'location.address': searchRegex },
          ],
        },
      });
    }

    // Count total
    const countPipeline = pipeline.concat([{ $count: 'total' }]);
    const countRes = await Booking.aggregate(countPipeline);
    const total = countRes[0] && countRes[0].total ? countRes[0].total : 0;

    // Sorting
    let sortObj = { startDate: -1, createdAt: -1 };
    if (sort === 'date_asc') sortObj = { startDate: 1, createdAt: 1 };

    pipeline.push(
      { $sort: sortObj },
      { $skip: skip },
      { $limit: lim },
      {
        $project: {
          _id: 1,
          referenceNo: 1,
          service: 1,
          status: 1,
          startDate: 1,
          endDate: 1,
          location: 1,
          feeSnapshot: 1,
          customer: {
            _id: '$customer._id',
            name: '$customer.name',
            profilePicture: '$customer.profilePicture',
          },
          staff: {
            _id: '$staff._id',
            name: { $ifNull: ['$staffUser.name', '$staff.name'] },
            profilePicture: {
              $ifNull: ['$staffUser.profilePicture', '$staff.profilePicture'],
            },
          },
        },
      }
    );

    const items = await Booking.aggregate(pipeline);

    const data = items.map((b) => ({
      id: b._id,
      referenceNo: b.referenceNo,
      customer: {
        id: b.customer?._id,
        name: b.customer?.name || 'Unknown Customer',
        avatar: b.customer?.profilePicture || null,
      },
      staff: {
        id: b.staff?._id,
        name: b.staff?.name || 'Unknown Staff',
        avatar: b.staff?.profilePicture || null,
      },
      service: b.service,
      status: b.status,
      location: b.location?.address || 'Location not specified',
      dateRange: {
        start: b.startDate,
        end: b.endDate,
      },
      feeText: b.feeSnapshot?.hourlyRate
        ? `₹ ${b.feeSnapshot.hourlyRate}/hr`
        : b.feeSnapshot?.dailyRate
          ? `₹ ${b.feeSnapshot.dailyRate}/day`
          : 'Price not set',
    }));

    return res.status(200).json({
      status: 'success',
      meta: { page: pg, limit: lim, total },
      data,
    });
  } catch (err) {
    console.error('dashboardBookings error', err);
    return next(errorHandler(500, 'Failed to fetch dashboard bookings'));
  }
};

// POST /company/bookings/:bookingId/manage - Accept or Reject a booking
export const manageBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { action, reason } = req.body;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return next(errorHandler(400, 'Invalid booking ID'));
    }

    if (!action || !['accept', 'reject'].includes(action)) {
      return next(
        errorHandler(400, 'Action must be either "accept" or "reject"')
      );
    }

    // For reject action, reason is required
    if (action === 'reject' && (!reason || reason.trim() === '')) {
      return next(errorHandler(400, 'Rejection reason is required'));
    }

    const booking = await Booking.findById(
      new mongoose.Types.ObjectId(bookingId)
    )
      .populate({
        path: 'staffId',
        select: 'name companyId',
        populate: {
          path: 'companyId',
          select: 'name',
        },
      })
      .populate({
        path: 'userId',
        select: 'name',
      })
      .lean();

    if (!booking) {
      return next(errorHandler(404, 'Booking not found'));
    }

    // Only allow managing pending bookings
    if (booking.status !== 'Pending') {
      return next(errorHandler(400, 'Only pending bookings can be managed'));
    }

    // Get company and staff information
    const staff = booking.staffId;
    const company = staff?.companyId;
    const companyName = company?.name || 'Unknown Company';
    const staffName = staff?.name || 'Unknown Staff';
    const companyId = company?._id || staff?.companyId;

    // Update booking based on action
    const updateData = {};
    if (action === 'accept') {
      updateData.status = 'Confirmed';
      updateData.acceptedAt = new Date();
      updateData.rejectionReason = undefined;
      updateData.rejectedAt = undefined;
    } else if (action === 'reject') {
      updateData.status = 'Rejected';
      updateData.rejectionReason = reason.trim();
      updateData.rejectedAt = new Date();
      updateData.acceptedAt = undefined;
    }

    await Booking.findByIdAndUpdate(
      new mongoose.Types.ObjectId(bookingId),
      updateData
    );

    // Format date and time for status message
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .toLowerCase();

    // Create notification for the customer
    let notificationType, title, message, statusMessage;

    if (action === 'accept') {
      notificationType = 'booking_accepted';
      title = 'Request Accepted';
      message = `${companyName} have accepted your request to hire ${staffName}.`;
      statusMessage = `Completed on ${dateStr} ${timeStr}`;
    } else {
      notificationType = 'booking_rejected';
      title = 'Request Rejected';
      message = `${companyName} have rejected your request to hire ${staffName}.`;
      statusMessage = `Rejected due to ${reason.trim()} on ${dateStr} ${timeStr}`;
    }

    // Create notification
    await Notification.create({
      userId: booking.userId._id,
      type: notificationType,
      title,
      message,
      bookingId: new mongoose.Types.ObjectId(bookingId),
      companyId: companyId ? new mongoose.Types.ObjectId(companyId) : undefined,
      companyName,
      staffId: staff?._id
        ? new mongoose.Types.ObjectId(staff._id)
        : undefined,
      staffName,
      actionStatus: action === 'accept' ? 'accepted' : 'rejected',
      statusMessage,
      rejectionReason: action === 'reject' ? reason.trim() : undefined,
      isRead: false,
    });

    return res.status(200).json({
      status: 'success',
      message: `Booking ${action}ed successfully`,
      data: {
        id: booking._id,
        referenceNo: booking.referenceNo,
        status: updateData.status,
        acceptedAt: updateData.acceptedAt,
        rejectionReason: updateData.rejectionReason,
        rejectedAt: updateData.rejectedAt,
      },
    });
  } catch (err) {
    console.error('manageBooking error', err);
    return next(errorHandler(500, 'Failed to manage booking'));
  }
};

// GET /company/bookings/:bookingId - Get detailed booking information for modal
export const getBookingDetails = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return next(errorHandler(400, 'Invalid booking ID'));
    }

    const booking = await Booking.findById(
      new mongoose.Types.ObjectId(bookingId)
    )
      .populate({
        path: 'userId',
        select: 'name profilePicture phone address',
      })
      .populate({
        path: 'staffId',
        select:
          'name profilePicture phone gender age specializations employmentType hourlyRate dailyRate availability',
      })
      .lean();

    if (!booking) {
      return next(errorHandler(404, 'Booking not found'));
    }

    const data = {
      id: booking._id,
      referenceNo: booking.referenceNo,
      service: booking.service,
      status: booking.status,
      startDate: booking.startDate,
      endDate: booking.endDate,
      location: booking.location,
      feeSnapshot: booking.feeSnapshot,
      rejectionReason: booking.rejectionReason,
      rejectedAt: booking.rejectedAt,
      acceptedAt: booking.acceptedAt,
      customer: {
        id: booking.userId?._id,
        name: booking.userId?.name || 'Unknown Customer',
        avatar: booking.userId?.profilePicture || null,
        phone: booking.userId?.phone || null,
        address:
          booking.userId?.address ||
          booking.location?.address ||
          'Address not provided',
      },
      staff: {
        id: booking.staffId?._id,
        name: booking.staffId?.name || 'Unknown Staff',
        avatar: booking.staffId?.profilePicture || null,
        phone: booking.staffId?.phone || null,
        gender: booking.staffId?.gender || 'Not specified',
        age: booking.staffId?.age || null,
        specializations: booking.staffId?.specializations || [],
        employmentType: booking.employmentType,
        hourlyRate: booking.feeSnapshot?.hourlyRate,
        dailyRate: booking.feeSnapshot?.dailyRate,
        timeWindow: booking.timeWindowPerDay,
      },
    };

    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (err) {
    console.error('getBookingDetails error', err);
    return next(errorHandler(500, 'Failed to fetch booking details'));
  }
};

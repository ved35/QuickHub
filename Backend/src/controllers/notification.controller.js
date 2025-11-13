import mongoose from 'mongoose';
import { errorHandler } from '../middleware/errorHandler.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

// GET /notifications - List notifications for the authenticated user
export const listNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    const {
      page = 1,
      limit = 20,
      sort = 'date_desc', // date_asc | date_desc
      type, // filter by notification type
      isRead, // filter by read status
    } = req.query;

    const pg = Math.max(1, Number(page));
    const lim = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pg - 1) * lim;

    const match = { userId: new mongoose.Types.ObjectId(userId) };

    if (type) {
      const typeArray = String(type)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (typeArray.length) match.type = { $in: typeArray };
    }

    if (isRead !== undefined) {
      match.isRead = isRead === 'true' || isRead === true;
    }

    const pipeline = [{ $match: match }];

    // Count total
    const countPipeline = pipeline.concat([{ $count: 'total' }]);
    const countRes = await Notification.aggregate(countPipeline);
    const total = countRes[0] && countRes[0].total ? countRes[0].total : 0;

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'date_asc') sortObj = { createdAt: 1 };

    pipeline.push(
      { $sort: sortObj },
      { $skip: skip },
      { $limit: lim },
      {
        $project: {
          _id: 1,
          type: 1,
          title: 1,
          message: 1,
          companyId: 1,
          companyName: 1,
          staffId: 1,
          staffName: 1,
          actionStatus: 1,
          statusMessage: 1,
          rejectionReason: 1,
          bookingId: 1,
          isRead: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    );

    const items = await Notification.aggregate(pipeline);

    const data = items.map((n) => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      company: n.companyId
        ? {
            id: n.companyId,
            name: n.companyName || 'Unknown Company',
          }
        : null,
      staff: n.staffId
        ? {
            id: n.staffId,
            name: n.staffName || 'Unknown Staff',
          }
        : null,
      actionStatus: n.actionStatus || null,
      statusMessage: n.statusMessage || null,
      rejectionReason: n.rejectionReason || null,
      bookingId: n.bookingId || null,
      isRead: n.isRead || false,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));

    return res.status(200).json({
      status: 'success',
      meta: { page: pg, limit: lim, total },
      data,
    });
  } catch (err) {
    console.error('listNotifications error', err);
    return next(errorHandler(500, 'Failed to fetch notifications'));
  }
};

// PATCH /notifications/:notificationId/read - Mark notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return next(errorHandler(400, 'Invalid notification ID'));
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    const notification = await Notification.findOne({
      _id: new mongoose.Types.ObjectId(notificationId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!notification) {
      return next(errorHandler(404, 'Notification not found'));
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: {
        id: notification._id,
        isRead: notification.isRead,
      },
    });
  } catch (err) {
    console.error('markAsRead error', err);
    return next(errorHandler(500, 'Failed to mark notification as read'));
  }
};

// PATCH /notifications/read-all - Mark all notifications as read for the user
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    const result = await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    return res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (err) {
    console.error('markAllAsRead error', err);
    return next(errorHandler(500, 'Failed to mark all notifications as read'));
  }
};

// GET /notifications/company/list - List notifications for company users
export const listCompanyNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    // Verify user is a company user
    const companyUser = await User.findById(userId).select('userType email').lean();
    if (!companyUser || companyUser.userType !== 'company') {
      return next(errorHandler(403, 'Access denied. Company users only.'));
    }

    // Find companyId(s) associated with this company user
    // Approach: Match company user email to company email to find the company
    const Company = (await import('../models/company.model.js')).default;
    let userCompanyIds = [];
    
    if (companyUser.email) {
      // Find companies with matching email
      const companies = await Company.find({
        email: companyUser.email,
      }).select('_id').lean();
      userCompanyIds = companies.map((c) => c._id);
    }

    // If no company found by email match, we can't reliably determine which company
    // this user belongs to. In this case, we'll only show notifications explicitly
    // created for this userId (notifications created before email matching was implemented)
    // Note: In a production system, you should have a direct link between users and companies

    const allCompanyIds = userCompanyIds
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const {
      page = 1,
      limit = 20,
      sort = 'date_desc', // date_asc | date_desc
      type, // filter by notification type
      isRead, // filter by read status
    } = req.query;

    const pg = Math.max(1, Number(page));
    const lim = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pg - 1) * lim;

    // Build match criteria
    // Show notifications where:
    // 1. userId matches (notifications created for this user)
    // 2. companyId matches one of the user's companies (if we found any)
    const matchConditions = [{ userId: new mongoose.Types.ObjectId(userId) }];
    
    if (allCompanyIds.length > 0) {
      matchConditions.push({ companyId: { $in: allCompanyIds } });
    }
    
    const match = matchConditions.length > 1 
      ? { $or: matchConditions }
      : matchConditions[0];

    // Also filter by type if provided (for company, we mainly want booking_request)
    if (type) {
      const typeArray = String(type)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (typeArray.length) match.type = { $in: typeArray };
    } else {
      // Default to booking_request for company notifications
      match.type = 'booking_request';
    }

    if (isRead !== undefined) {
      match.isRead = isRead === 'true' || isRead === true;
    }

    const pipeline = [{ $match: match }];

    // Count total
    const countPipeline = pipeline.concat([{ $count: 'total' }]);
    const countRes = await Notification.aggregate(countPipeline);
    const total = countRes[0] && countRes[0].total ? countRes[0].total : 0;

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'date_asc') sortObj = { createdAt: 1 };

    pipeline.push(
      { $sort: sortObj },
      { $skip: skip },
      { $limit: lim },
      {
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: '_id',
          as: 'booking',
        },
      },
      { $unwind: { path: '$booking', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'booking.userId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          type: 1,
          title: 1,
          message: 1,
          companyId: 1,
          companyName: 1,
          staffId: 1,
          staffName: 1,
          actionStatus: 1,
          statusMessage: 1,
          rejectionReason: 1,
          bookingId: 1,
          isRead: 1,
          createdAt: 1,
          updatedAt: 1,
          customer: {
            id: '$customer._id',
            name: '$customer.name',
            email: '$customer.email',
          },
          booking: {
            id: '$booking._id',
            referenceNo: '$booking.referenceNo',
            service: '$booking.service',
            status: '$booking.status',
            startDate: '$booking.startDate',
            endDate: '$booking.endDate',
          },
        },
      }
    );

    const items = await Notification.aggregate(pipeline);

    const data = items.map((n) => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      company: n.companyId
        ? {
            id: n.companyId,
            name: n.companyName || 'Unknown Company',
          }
        : null,
      staff: n.staffId
        ? {
            id: n.staffId,
            name: n.staffName || 'Unknown Staff',
          }
        : null,
      customer: n.customer
        ? {
            id: n.customer.id,
            name: n.customer.name || 'Unknown Customer',
            email: n.customer.email || null,
          }
        : null,
      booking: n.booking
        ? {
            id: n.booking.id,
            referenceNo: n.booking.referenceNo,
            service: n.booking.service,
            status: n.booking.status,
            startDate: n.booking.startDate,
            endDate: n.booking.endDate,
          }
        : null,
      actionStatus: n.actionStatus || null,
      statusMessage: n.statusMessage || null,
      rejectionReason: n.rejectionReason || null,
      bookingId: n.bookingId || null,
      isRead: n.isRead || false,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));

    return res.status(200).json({
      status: 'success',
      meta: { page: pg, limit: lim, total },
      data,
    });
  } catch (err) {
    console.error('listCompanyNotifications error', err);
    return next(errorHandler(500, 'Failed to fetch company notifications'));
  }
};


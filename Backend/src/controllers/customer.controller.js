import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import serviceModel from '../models/service.model';
import bookingModel from '../models/booking.model.js';
import ServiceProvider from '../models/serviceProvider.model.js';
import Feedback from '../models/feedback.model.js';
import Company from '../models/company.model.js';
import errorHandler from '../middleware/errorHandler.js';

// GET /customer/services
export const listServices = async (req, res, next) => {
  try {
    const services = await serviceModel
      .find({ isActive: true })
      .select('name description basePrice category')
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ status: 'success', data: services });
  } catch (err) {
    return next(errorHandler(500, 'Failed to fetch services'));
  }
};

// // GET /customer/bookings
// export const listBookings = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.user?._id || req.userId;
//     if (!userId) return next(errorHandler(401, 'Unauthorized'));

//     const {
//       sort = 'date_asc', // date_asc | date_desc
//       services, // comma separated service ids
//       status, // comma separated statuses
//       page = 1,
//       limit = 20,
//     } = req.query;

//     const filter = { serviceSeekerId: userId };

//     if (services) {
//       const svcArray = services
//         .split(',')
//         .map((s) => s.trim())
//         .filter(Boolean);
//       if (svcArray.length) filter.serviceId = { $in: svcArray };
//     }

//     if (status) {
//       const statusArray = status
//         .split(',')
//         .map((s) => s.trim())
//         .filter(Boolean);
//       if (statusArray.length) filter.status = { $in: statusArray };
//     } else {
//       // active bookings default statuses if you want only active ones
//       filter.status = {
//         $in: ['requested', 'confirmed', 'in_progress', 'pending'],
//       };
//     }

//     const sortField = sort === 'date_desc' ? -1 : 1;
//     // prefer startDateTime, fallback to scheduledDate
//     const sortBy = { startDateTime: sortField, scheduledDate: sortField };

//     const skip =
//       (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
//     const docs = await bookingModel
//       .find(filter)
//       .sort(sortBy)
//       .skip(skip)
//       .limit(Math.max(1, parseInt(limit, 10)))
//       .populate({
//         path: 'serviceProviderId',
//         populate: { path: 'userId', select: 'name profilePicture' },
//         select: 'hourlyRate employmentType specializations',
//       })
//       .populate('serviceId', 'name')
//       .lean();

//     // map to UI-friendly shape
//     const data = docs.map((b) => ({
//       id: b._id,
//       bookingId: b.referenceNo || b._id,
//       serviceName: b.serviceId?.name || '',
//       provider: b.serviceProviderId?.userId
//         ? {
//             id: b.serviceProviderId._id,
//             name: b.serviceProviderId.userId.name,
//             avatar: b.serviceProviderId.userId.profilePicture,
//             specializations: b.serviceProviderId.specializations || [],
//             employmentType: b.serviceProviderId.employmentType,
//             rate:
//               b.serviceProviderId.hourlyRate ||
//               b.serviceProviderId.dailyRate ||
//               null,
//           }
//         : null,
//       startDateTime: b.startDateTime || b.scheduledDate || null,
//       endDateTime: b.endDateTime || null,
//       timeRange:
//         b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : undefined,
//       role: b.role || b.serviceId?.name || '',
//       feeText: b.amount
//         ? `₹ ${b.amount}`
//         : b.serviceProviderId?.hourlyRate
//           ? `₹ ${b.serviceProviderId.hourlyRate}/hr`
//           : '',
//       status: b.status,
//       location: b.location || null,
//     }));

//     return res.status(200).json({
//       status: 'success',
//       meta: { page: Number(page), limit: Number(limit) },
//       data,
//     });
//   } catch (err) {
//     console.error('listBookings error', err);
//     return next(errorHandler(500, 'Failed to fetch bookings'));
//   }
// };

// GET /customer/providers/:id
// export const staffBookingDetails = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     if (!id) return next(errorHandler(400, 'Provider id required'));

//     const provider = await ServiceProvider.findById(id)
//       .populate({
//         path: 'userId',
//         select: 'name profilePicture phone gender dob',
//       })
//       .populate({ path: 'companyId', select: 'name phone email address' })
//       .lean();

//     if (!provider) return next(errorHandler(404, 'Provider not found'));

//     // fetch recent feedbacks (3)
//     const feedbacks = await Feedback.find({ providerId: id })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .populate({ path: 'authorId', select: 'name profilePicture' })
//       .lean();

//     return res.status(200).json({
//       status: 'success',
//       data: {
//         provider,
//         feedbacks: feedbacks.map((f) => ({
//           id: f._id,
//           rating: f.rating,
//           comment: f.comment,
//           authorName: f.authorName || f.authorId?.name,
//           authorAvatar: f.authorId?.profilePicture || null,
//           createdAt: f.createdAt,
//         })),
//       },
//     });
//   } catch (err) {
//     console.error('providerDetails error', err);
//     return next(errorHandler(500, 'Failed to fetch provider details'));
//   }
// };

// GET /customer/providers/:id/feedbacks
export const staffFeedbacks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Feedback.find({ providerId: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'authorId', select: 'name profilePicture' })
        .lean(),
      Feedback.countDocuments({ providerId: id }),
    ]);

    const data = items.map((f) => ({
      id: f._id,
      rating: f.rating,
      comment: f.comment,
      authorName: f.authorName || f.authorId?.name,
      authorAvatar: f.authorId?.profilePicture || null,
      createdAt: f.createdAt,
    }));

    return res.status(200).json({
      status: 'success',
      meta: { page, limit, total },
      data,
    });
  } catch (err) {
    console.error('staffFeedbacks error', err);
    return next(errorHandler(500, 'Failed to fetch feedbacks'));
  }
};

// GET /companies/:id
export const companyDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return next(errorHandler(400, 'Company id required'));

    const company = await Company.findById(id).lean();
    if (!company) return next(errorHandler(404, 'Company not found'));

    return res.status(200).json({ status: 'success', data: company });
  } catch (err) {
    console.error('companyDetails error', err);
    return next(errorHandler(500, 'Failed to fetch company details'));
  }
};

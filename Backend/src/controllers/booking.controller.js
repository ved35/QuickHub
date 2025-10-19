import mongoose from 'mongoose';
import { errorHandler } from '../middleware/errorHandler.js';
import Staff from '../models/staff.model.js';
import Booking from '../models/booking.model.js';

const generateReferenceNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `BK-${y}${m}${d}-${rand}`;
};

export const createBooking = async (req, res, next) => {
  try {
    const { staffId, service, startDate, endDate, notes, location } = req.body;
    if (!staffId || !mongoose.Types.ObjectId.isValid(staffId))
      return next(errorHandler(400, 'Invalid staffId'));
    if (!service) return next(errorHandler(400, 'service is required'));
    if (!startDate || !endDate)
      return next(errorHandler(400, 'startDate and endDate are required'));

    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime()))
      return next(errorHandler(400, 'Invalid dates'));
    if (ed < sd) return next(errorHandler(400, 'endDate must be >= startDate'));

    const staff = await Staff.findById(staffId).lean();
    if (!staff || staff.isActive === false)
      return next(errorHandler(404, 'Staff not found or inactive'));
    if (
      Array.isArray(staff.specializations) &&
      staff.specializations.length &&
      !staff.specializations.includes(service)
    ) {
      return next(
        errorHandler(400, 'Selected staff does not offer this service')
      );
    }

    const employmentType = staff.employmentType || 'full_time';
    const shiftHoursPerDay =
      staff.availability?.weekly?.shiftHoursPerDay ||
      (employmentType === 'part_time' ? 4 : 8);
    const timeWindowPerDay =
      staff.availability?.weekly?.timeWindowPerDay ||
      (employmentType === 'part_time' ? '10:00-14:00' : '10:00-18:00');

    // compute fee snapshot
    const msPerDay = 24 * 60 * 60 * 1000;
    const numDays = Math.floor((ed - sd) / msPerDay) + 1;
    let amount = 0;
    if (employmentType === 'part_time' && staff.hourlyRate) {
      amount = (staff.hourlyRate || 0) * (shiftHoursPerDay || 4) * numDays;
    } else if (employmentType === 'full_time' && staff.dailyRate) {
      amount = (staff.dailyRate || 0) * numDays;
    } else if (staff.hourlyRate) {
      amount = (staff.hourlyRate || 0) * (shiftHoursPerDay || 8) * numDays;
    }

    const feeSnapshot = {
      hourlyRate: staff.hourlyRate || null,
      dailyRate: staff.dailyRate || null,
      amount,
      cgst: 0,
      sgst: 0,
      total: amount,
    };

    const booking = await Booking.create({
      referenceNo: generateReferenceNo(),
      userId: req.user?.id ? mongoose.Types.ObjectId(req.user.id) : undefined,
      staffId: mongoose.Types.ObjectId(staffId),
      service,
      employmentType,
      shiftHoursPerDay,
      timeWindowPerDay,
      startDate: sd,
      endDate: ed,
      feeSnapshot,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      notes,
      location,
    });

    return res.status(201).json({ status: 'success', data: booking });
  } catch (err) {
    console.error('createBooking error', err);
    return next(errorHandler(500, 'Failed to create booking'));
  }
};

export const listCustomerBookings = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId))
      return next(errorHandler(401, 'Unauthorized'));

    const {
      page = 1,
      limit = 20,
      sort = 'date_desc', // date_asc | date_desc
      services, // comma separated service names
      status, // comma separated statuses
    } = req.query;

    const pg = Math.max(1, Number(page));
    const lim = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pg - 1) * lim;

    const match = { userId: mongoose.Types.ObjectId(userId) };
    if (services) {
      const arr = String(services)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) match.service = { $in: arr };
    }
    if (status) {
      const st = String(status)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (st.length) match.status = { $in: st };
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
    ];

    // total count
    const countPipeline = pipeline.concat([{ $count: 'total' }]);
    const countRes = await Booking.aggregate(countPipeline);
    const total = countRes[0] && countRes[0].total ? countRes[0].total : 0;

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
          employmentType: 1,
          shiftHoursPerDay: 1,
          timeWindowPerDay: 1,
          feeSnapshot: 1,
          rating: 1,
          review: 1,
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
      staff: {
        id: b.staff?._id,
        name: b.staff?.name || '',
        avatar: b.staff?.profilePicture || null,
      },
      date: { start: b.startDate, end: b.endDate },
      time:
        b.timeWindowPerDay ||
        (b.shiftHoursPerDay ? `${b.shiftHoursPerDay} hrs/day` : null),
      role: b.service,
      status: b.status,
      feeText: b.feeSnapshot?.hourlyRate
        ? `₹ ${b.feeSnapshot.hourlyRate}/hr`
        : b.feeSnapshot?.dailyRate
          ? `₹ ${b.feeSnapshot.dailyRate}/day`
          : null,
      canPay: b.status === 'Confirmed' || b.status === 'Completed',
      canReview: b.status === 'Completed' && !b.rating,
      rating: b.rating || null,
    }));

    return res
      .status(200)
      .json({ status: 'success', meta: { page: pg, limit: lim, total }, data });
  } catch (err) {
    console.error('listCustomerBookings error', err);
    return next(errorHandler(500, 'Failed to fetch bookings'));
  }
};

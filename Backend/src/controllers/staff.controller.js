import staffModel from '../models/staff.model.js';
import userModel from '../models/user.model.js';


export const listStaff = async (req, res, next) => {
  try {
    const {
      search,
      services,
      type,
      minExp,
      maxExp,
      rating,
      page = 1,
      limit = 20,
      sort,
    } = req.query;

    const pg = Math.max(1, Number(page));
    const lim = Math.max(1, Number(limit));
    const skip = (pg - 1) * lim;

    // base pipeline: join user document
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];

    // Filters
    const match = {};

    if (type) match.employmentType = type;
    if (services) match.specializations = { $in: services.split(',').map((s) => s.trim()).filter(Boolean) };
    if (minExp || maxExp) {
      match.experienceYears = {};
      if (minExp) match.experienceYears.$gte = Number(minExp);
      if (maxExp) match.experienceYears.$lte = Number(maxExp);
    }
    if (rating) match.rating = { $gte: Number(rating) };

    // Apply match if any basic filters present
    if (Object.keys(match).length) pipeline.push({ $match: match });

    // Search handling: if search provided, filter by name / specializations / bio / phone
    if (search && String(search).trim() !== '') {
      const re = new RegExp(String(search).trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': re },
            { 'user.email': re },
            { 'user.phone': re },
            { specializations: re },
            { bio: re },
          ],
        },
      });
    }

    // Count total (use a copy of pipeline)
    const countPipeline = pipeline.concat([{ $count: 'total' }]);
    const countRes = await staffModel.aggregate(countPipeline);
    const total = (countRes[0] && countRes[0].total) ? countRes[0].total : 0;

    // Sorting - default: createdAt desc (table desc order)
    let sortObj = { createdAt: -1 };
    if (sort === 'date_asc') sortObj = { createdAt: 1 };
    else if (sort === 'rating_desc') sortObj = { rating: -1 };
    else if (sort === 'rating_asc') sortObj = { rating: 1 };

    pipeline.push(
      { $sort: sortObj },
      { $skip: skip },
      { $limit: lim },
      {
        $project: {
          _id: 1,
          hourlyRate: 1,
          dailyRate: 1,
          employmentType: 1,
          specializations: 1,
          experienceYears: 1,
          rating: 1,
          isActive: 1,
          'user._id': 1,
          'user.name': 1,
          'user.profilePicture': 1,
          'user.phone': 1,
          'user.gender': 1,
        },
      }
    );

    const items = await staffModel.aggregate(pipeline);

    const data = items.map((p) => ({
      id: p._id,
      name: p.user?.name || '',
      avatar: p.user?.profilePicture || null,
      employmentType: p.employmentType,
      hourlyRate: p.hourlyRate,
      specializations: p.specializations || [],
      experienceYears: p.experienceYears || 0,
      rating: p.rating || 0,
      phone: p.user?.phone || null,
      isActive: p.isActive === undefined ? true : p.isActive,
    }));

    return res.status(200).json({
      status: 'success',
      meta: { page: pg, limit: lim, total },
      data,
    });
  } catch (err) {
    console.error('listStaff error', err);
    return next(errorHandler(500, 'Failed to fetch staff'));
  }
};

// Create staff (manage staff UI)
export const createStaff = async (req, res, next) => {
  try {
    // expected body: user (name,email,phone,gender,dob,address,password optional) and provider fields
    const { user, provider } = req.body;
    if (!user || !user.email || !provider) return next(errorHandler(400, 'Missing required fields'));

    // create or reuse user
    let existing = await userModel.findOne({ email: user.email });
    if (existing) {
      // update minimal fields
      existing.name = user.name || existing.name;
      existing.phone = user.phone || existing.phone;
      await existing.save();
    } else {
      const password = user.password ? await bcryptjs.hash(user.password, 10) : undefined;
      existing = await userModel.create({
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        username: user.username || user.email,
        password,
      });
    }

    const sp = await staffModel.create({
      userId: existing._id,
      companyId: provider.companyId,
      hourlyRate: provider.hourlyRate,
      dailyRate: provider.dailyRate,
      employmentType: provider.employmentType,
      specializations: provider.specializations || [],
      bio: provider.bio,
      experienceYears: provider.experienceYears || 0,
      availability: provider.availability || {},
      isActive: provider.isActive !== false,
    });

    return res.status(201).json({ status: 'success', data: { id: sp._id } });
  } catch (err) {
    console.error('createStaff error', err);
    return next(errorHandler(500, 'Failed to create staff'));
  }
};

// PUT /staff/:id
export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(errorHandler(400, 'Invalid staff id'));

    // Combined payload shape:
    // { user: {...}, provider: {...}, availability: {...}, slotsToAdd: [...], slotsToRemove: [...] }
    const { user, provider, availability, slotsToAdd, slotsToRemove } = req.body;

    const sp = await staffModel.findById(id);
    if (!sp) return next(errorHandler(404, 'Staff not found'));

    // Provider updates (manage staff fields)
    if (provider) {
      if (provider.hourlyRate !== undefined) sp.hourlyRate = provider.hourlyRate;
      if (provider.dailyRate !== undefined) sp.dailyRate = provider.dailyRate;
      if (provider.employmentType) sp.employmentType = provider.employmentType;
      if (provider.specializations) sp.specializations = provider.specializations;
      if (provider.bio) sp.bio = provider.bio;
      if (provider.experienceYears !== undefined) sp.experienceYears = provider.experienceYears;
      if (provider.isActive !== undefined) sp.isActive = provider.isActive;
      if (provider.companyId && mongoose.Types.ObjectId.isValid(provider.companyId)) sp.companyId = provider.companyId;
      if (provider.location) sp.location = provider.location;
      if (provider.documents) sp.documents = provider.documents;
    }

    // Availability handling
    if (availability) {
      // Replace entire availability object if provided
      sp.availability = availability;
    }
    // Append slots if provided (slotsToAdd expected as array of {date,startTime,endTime,payPerHour})
    if (Array.isArray(slotsToAdd) && slotsToAdd.length) {
      sp.availability = sp.availability || {};
      sp.availability.slots = sp.availability.slots || [];
      for (const slot of slotsToAdd) {
        sp.availability.slots.push(slot);
      }
    }
    // Remove slots if provided (slotsToRemove is array of slot _id strings)
    if (Array.isArray(slotsToRemove) && slotsToRemove.length && Array.isArray(sp.availability?.slots)) {
      sp.availability.slots = sp.availability.slots.filter(s => !slotsToRemove.includes(String(s._id)));
    }

    await sp.save();

    // Update linked user document if provided
    if (user && sp.userId) {
      const u = await userModel.findById(sp.userId);
      if (u) {
        if (user.name) u.name = user.name;
        if (user.phone) u.phone = user.phone;
        if (user.gender) u.gender = user.gender;
        if (user.dob) u.dob = user.dob;
        if (user.address) u.address = user.address;

        if (user.email && user.email !== u.email) {
          const exists = await userModel.findOne({ email: user.email });
          if (exists && String(exists._id) !== String(u._id)) {
            return next(errorHandler(400, 'Email already in use'));
          }
          u.email = user.email;
        }

        await u.save();
      }
    }

    // Return fresh populated document
    const updated = await staffModel.findById(id)
      .populate({ path: 'userId', select: 'name email phone profilePicture gender dob address' })
      .populate({ path: 'companyId', select: 'name phone email address' })
      .lean();

    return res.status(200).json({ status: 'success', message: 'Staff updated', data: updated });
  } catch (err) {
    console.error('updateStaff error', err);
    return next(errorHandler(500, 'Failed to update staff'));
  }
};



// GET /customer/services
export const listServices = async (req, res, next) => {
  try {
    const services = await serviceModel.find({ isActive: true })
      .select('name description basePrice category')
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ status: 'success', data: services });
  } catch (err) {
    return next(errorHandler(500, 'Failed to fetch services'));
  }
};

// GET /customer/bookings
export const listBookings = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.userId;
    if (!userId) return next(errorHandler(401, 'Unauthorized'));

    const {
      sort = 'date_asc', // date_asc | date_desc
      services, // comma separated service ids
      status, // comma separated statuses
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { serviceSeekerId: userId };

    if (services) {
      const svcArray = services.split(',').map((s) => s.trim()).filter(Boolean);
      if (svcArray.length) filter.serviceId = { $in: svcArray };
    }

    if (status) {
      const statusArray = status.split(',').map((s) => s.trim()).filter(Boolean);
      if (statusArray.length) filter.status = { $in: statusArray };
    } else {
      // active bookings default statuses if you want only active ones
      filter.status = { $in: ['requested', 'confirmed', 'in_progress', 'pending'] };
    }

    const sortField = (sort === 'date_desc') ? -1 : 1;
    // prefer startDateTime, fallback to scheduledDate
    const sortBy = { startDateTime: sortField, scheduledDate: sortField };

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
    const docs = await bookingModel.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Math.max(1, parseInt(limit, 10)))
      .populate({
        path: 'serviceProviderId',
        populate: { path: 'userId', select: 'name profilePicture' },
        select: 'hourlyRate employmentType specializations',
      })
      .populate('serviceId', 'name')
      .lean();

    // map to UI-friendly shape
    const data = docs.map((b) => ({
      id: b._id,
      bookingId: b.referenceNo || b._id,
      serviceName: b.serviceId?.name || '',
      provider: b.serviceProviderId?.userId
        ? {
            id: b.serviceProviderId._id,
            name: b.serviceProviderId.userId.name,
            avatar: b.serviceProviderId.userId.profilePicture,
            specializations: b.serviceProviderId.specializations || [],
            employmentType: b.serviceProviderId.employmentType,
            rate: b.serviceProviderId.hourlyRate || b.serviceProviderId.dailyRate || null,
          }
        : null,
      startDateTime: b.startDateTime || b.scheduledDate || null,
      endDateTime: b.endDateTime || null,
      timeRange: b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : undefined,
      role: b.role || b.serviceId?.name || '',
      feeText: b.amount ? `₹ ${b.amount}` : (b.serviceProviderId?.hourlyRate ? `₹ ${b.serviceProviderId.hourlyRate}/hr` : ''),
      status: b.status,
      location: b.location || null,
    }));

    return res.status(200).json({ status: 'success', meta: { page: Number(page), limit: Number(limit) }, data });
  } catch (err) {
    console.error('listBookings error', err);
    return next(errorHandler(500, 'Failed to fetch bookings'));
  }
};


// GET /customer/providers/:id
export const staffBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return next(errorHandler(400, 'Provider id required'));

    const provider = await ServiceProvider.findById(id)
      .populate({ path: 'userId', select: 'name profilePicture phone gender dob' })
      .populate({ path: 'companyId', select: 'name phone email address' })
      .lean();

    if (!provider) return next(errorHandler(404, 'Provider not found'));

    // fetch recent feedbacks (3)
    const feedbacks = await Feedback.find({ providerId: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: 'authorId', select: 'name profilePicture' })
      .lean();

    return res.status(200).json({
      status: 'success',
      data: {
        provider,
        feedbacks: feedbacks.map((f) => ({
          id: f._id,
          rating: f.rating,
          comment: f.comment,
          authorName: f.authorName || f.authorId?.name,
          authorAvatar: f.authorId?.profilePicture || null,
          createdAt: f.createdAt,
        })),
      },
    });
  } catch (err) {
    console.error('providerDetails error', err);
    return next(errorHandler(500, 'Failed to fetch provider details'));
  }
};


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
import mongoose from 'mongoose';
import Staff from '../models/staff.model.js';
import { errorHandler } from '../middleware/errorHandler.js';
import bcryptjs from 'bcryptjs';

// List staff
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
    if (services)
      match.specializations = {
        $in: services
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
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
    const total = countRes[0] && countRes[0].total ? countRes[0].total : 0;

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

    // when listing, fall back to embedded fields if user not linked
    const data = items.map((p) => ({
      id: p._id,
      name: (p.user && p.user.name) || p.name || '',
      avatar: (p.user && p.user.profilePicture) || p.profilePicture || null,
      employmentType: p.employmentType,
      hourlyRate: p.hourlyRate,
      specializations: p.specializations || [],
      experienceYears: p.experienceYears || 0,
      rating: p.rating || 0,
      phone: (p.user && p.user.phone) || p.phone || null,
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

// CREATE staff - supports company-created staff (no user) or linked user
export const createStaff = async (req, res, next) => {
  try {
    const { user, provider } = req.body;

    // if frontend provides user object with email -> create/link real User
    let linkedUserId = null;
    if (user && user.email) {
      let existing = await userModel.findOne({ email: user.email });
      if (existing) {
        // update minimal profile on existing user
        existing.name = user.name || existing.name;
        existing.phone = user.phone || existing.phone;
        await existing.save();
        linkedUserId = existing._id;
      } else {
        const passwordHash = user.password
          ? await bcryptjs.hash(user.password, 10)
          : undefined;
        const createdUser = await userModel.create({
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          dob: user.dob,
          username: user.username || user.email,
          password: passwordHash,
        });
        linkedUserId = createdUser._id;
      }
    }

    // Build staff doc
    const staffDoc = {
      userId: linkedUserId || undefined,
      name: linkedUserId ? undefined : (user?.name || provider?.name),
      email: linkedUserId ? undefined : (user?.email || provider?.email),
      phone: linkedUserId ? undefined : (user?.phone || provider?.phone),
      profilePicture: provider?.profilePicture,
      companyId: provider?.companyId,
      hourlyRate: provider?.hourlyRate,
      dailyRate: provider?.dailyRate,
      employmentType: provider?.employmentType,
      specializations: provider?.specializations || [],
      bio: provider?.bio,
      experienceYears: provider?.experienceYears || 0,
      availability: provider?.availability || {},
      isActive: provider?.isActive !== false,
    };

    const sp = await Staff.create(staffDoc);

    return res.status(201).json({ status: 'success', data: { id: sp._id } });
  } catch (err) {
    console.error('createStaff error', err);
    return next(errorHandler(500, 'Failed to create staff'));
  }
};

// UPDATE staff - manage both linked user and embedded contact fields + availability
export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id))
      return next(errorHandler(400, 'Invalid staff id'));

    const { user, provider, availability, slotsToAdd, slotsToRemove } = req.body;
    const sp = await Staff.findById(id);
    if (!sp) return next(errorHandler(404, 'Staff not found'));

    // update provider fields
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

    // availability handling
    if (availability) sp.availability = availability;
    if (Array.isArray(slotsToAdd) && slotsToAdd.length) {
      sp.availability = sp.availability || {};
      sp.availability.slots = sp.availability.slots || [];
      sp.availability.slots.push(...slotsToAdd);
    }
    if (Array.isArray(slotsToRemove) && slotsToRemove.length && Array.isArray(sp.availability?.slots)) {
      sp.availability.slots = sp.availability.slots.filter(s => !slotsToRemove.includes(String(s._id)));
    }

    // Update linked user if exists
    if (sp.userId) {
      if (user) {
        const u = await userModel.findById(sp.userId);
        if (u) {
          if (user.name) u.name = user.name;
          if (user.phone) u.phone = user.phone;
          if (user.gender) u.gender = user.gender;
          if (user.dob) u.dob = user.dob;
          if (user.address) u.address = user.address;
          if (user.email && user.email !== u.email) {
            const exists = await userModel.findOne({ email: user.email });
            if (exists && String(exists._id) !== String(u._id)) return next(errorHandler(400, 'Email already in use'));
            u.email = user.email;
          }
          await u.save();
        }
      }
    } else {
      // update embedded contact fields if no linked user
      if (user) {
        if (user.name) sp.name = user.name;
        if (user.phone) sp.phone = user.phone;
        if (user.email) sp.email = user.email;
        if (user.profilePicture) sp.profilePicture = user.profilePicture;
        if (user.gender) sp.gender = user.gender;
        if (user.dob) sp.dob = user.dob;
      }
    }

    await sp.save();

    const updated = await Staff.findById(id)
      .populate({ path: 'userId', select: 'name email phone profilePicture gender dob' })
      .populate({ path: 'companyId', select: 'name phone email address' })
      .lean();

    return res.status(200).json({ status: 'success', message: 'Staff updated', data: updated });
  } catch (err) {
    console.error('updateStaff error', err);
    return next(errorHandler(500, 'Failed to update staff'));
  }
};

// List staff for customer
export const listStaffCustomer = async (req, res, next) => {
  try {
    const {
      search,
      services,
      type,
      minExp,
      maxExp,
      rating,
      priceMin,
      priceMax,
      company,
      sort = 'createdAt_desc', // options: price_asc, price_desc, rating_desc, rating_asc, exp_desc, exp_asc, createdAt_asc, createdAt_desc
      page = 1,
      limit = 20,
    } = req.query;

    const pg = Math.max(1, Number(page));
    const lim = Math.max(1, Number(limit));
    const skip = (pg - 1) * lim;

    const pipeline = [
      // join user if linked
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      // only active staff shown to customers
      { $match: { isActive: true } },
    ];

    const match = {};

    if (type) match.employmentType = type;
    if (services) {
      const arr = String(services).split(',').map((s) => s.trim()).filter(Boolean);
      if (arr.length) match.specializations = { $in: arr };
    }
    if (minExp || maxExp) {
      match.experienceYears = {};
      if (minExp) match.experienceYears.$gte = Number(minExp);
      if (maxExp) match.experienceYears.$lte = Number(maxExp);
    }
    if (rating) match.rating = { $gte: Number(rating) };
    if (priceMin || priceMax) {
      match.hourlyRate = {};
      if (priceMin) match.hourlyRate.$gte = Number(priceMin);
      if (priceMax) match.hourlyRate.$lte = Number(priceMax);
    }
    if (company && mongoose.Types.ObjectId.isValid(company)) match.companyId = mongoose.Types.ObjectId(company);

    if (Object.keys(match).length) pipeline.push({ $match: match });

    if (search && String(search).trim() !== '') {
      const re = new RegExp(String(search).trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': re },
            { name: re }, // fallback embedded name
            { specializations: re },
            { bio: re },
            { 'location.address': re },
            { 'location.city': re },
          ],
        },
      });
    }

    // total count
    const countPipeline = pipeline.concat([{ $count: 'total' }]);
    const countRes = await Staff.aggregate(countPipeline);
    const total = (countRes[0] && countRes[0].total) ? countRes[0].total : 0;

    // sorting
    let sortObj = { createdAt: -1 };
    switch (sort) {
      case 'price_asc': sortObj = { hourlyRate: 1 }; break;
      case 'price_desc': sortObj = { hourlyRate: -1 }; break;
      case 'rating_desc': sortObj = { rating: -1 }; break;
      case 'rating_asc': sortObj = { rating: 1 }; break;
      case 'exp_desc': sortObj = { experienceYears: -1 }; break;
      case 'exp_asc': sortObj = { experienceYears: 1 }; break;
      case 'createdAt_asc': sortObj = { createdAt: 1 }; break;
      case 'createdAt_desc': default: sortObj = { createdAt: -1 }; break;
    }

    pipeline.push(
      { $sort: sortObj },
      { $skip: skip },
      { $limit: lim },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          profilePicture: 1,
          hourlyRate: 1,
          dailyRate: 1,
          employmentType: 1,
          specializations: 1,
          experienceYears: 1,
          rating: 1,
          companyId: 1,
          location: 1,
          'user._id': 1,
          'user.name': 1,
          'user.profilePicture': 1,
        },
      }
    );

    const items = await Staff.aggregate(pipeline);

    const data = items.map((p) => ({
      id: p._id,
      name: (p.user && p.user.name) || p.name || '',
      avatar: (p.user && p.user.profilePicture) || p.profilePicture || null,
      employmentType: p.employmentType,
      feeText: p.hourlyRate ? `₹ ${p.hourlyRate}/hr` : (p.dailyRate ? `₹ ${p.dailyRate}/day` : ''),
      hourlyRate: p.hourlyRate,
      dailyRate: p.dailyRate,
      specializations: p.specializations || [],
      experienceYears: p.experienceYears || 0,
      rating: p.rating || 0,
      companyId: p.companyId || null,
      location: p.location || null,
    }));

    return res.status(200).json({
      status: 'success',
      meta: { page: pg, limit: lim, total },
      data,
    });
  } catch (err) {
    console.error('listStaffCustomer error', err);
    return next(errorHandler(500, 'Failed to fetch staff list'));
  }
};

// GET /customer/providers/:id  (Customer -> Staff Details UI)
export const staffDetailsForCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return next(errorHandler(400, 'Invalid id'));

    const staff = await Staff.findById(id)
      .populate({ path: 'userId', select: 'name profilePicture' })
      .populate({ path: 'companyId', select: 'name phone email address' })
      .lean();

    if (!staff) return next(errorHandler(404, 'Staff not found'));

    // return shape tailored for customer UI
    const feedbacks = await Feedback.find({ providerId: id }).sort({ createdAt: -1 }).limit(6).lean();

    return res.status(200).json({
      status: 'success',
      data: {
        id: staff._id,
        name: staff.userId?.name || staff.name,
        avatar: staff.userId?.profilePicture || staff.profilePicture || null,
        employmentType: staff.employmentType,
        shiftInfo: staff.availability?.weekly?.shiftHoursPerDay || null,
        hourlyRate: staff.hourlyRate,
        experienceYears: staff.experienceYears,
        location: staff.location,
        phone: staff.phone || (staff.userId ? undefined : null), // show only if present
        specializations: staff.specializations || [],
        bio: staff.bio || '',
        availability: staff.availability || {},
        company: staff.companyId || null,
        feedbacks: feedbacks.map(f => ({ id: f._id, rating: f.rating, comment: f.comment, authorName: f.authorName, createdAt: f.createdAt }))
      }
    });
  } catch (err) {
    console.error('providerDetailsForCustomer', err);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};


export const companyDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return next(errorHandler(400, 'Invalid company id'));

    const company = await Company.findById(id).lean();
    if (!company) return next(errorHandler(404, 'Company not found'));

    return res.status(200).json({ status: 'success', data: company });
  } catch (err) {
    console.error('companyDetails error', err);
    return next(errorHandler(500, 'Failed to fetch company details'));
  }
};
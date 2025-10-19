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

    // base pipeline: no user lookup needed
    const pipeline = [];

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
            { name: re },
            { email: re },
            { phone: re },
            { specializations: re },
            { bio: re },
            { description: re },
          ],
        },
      });
    }

    // Count total (use a copy of pipeline)
    const countPipeline = pipeline.concat([{ $count: 'total' }]);
    const countRes = await Staff.aggregate(countPipeline);
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
          name: 1,
          email: 1,
          phone: 1,
          profilePicture: 1,
          gender: 1,
          hourlyRate: 1,
          dailyRate: 1,
          employmentType: 1,
          specializations: 1,
          experienceYears: 1,
          rating: 1,
          isActive: 1,
          dob: 1,
          address: 1,
          description: 1,
          availableHours: 1,
          availableDays: 1,
        },
      }
    );

    const items = await Staff.aggregate(pipeline);

    // Map staff data directly from embedded fields
    const data = items.map((p) => ({
      id: p._id,
      name: p.name || '',
      avatar: p.profilePicture || null,
      employmentType: p.employmentType,
      hourlyRate: p.hourlyRate,
      specializations: p.specializations || [],
      experienceYears: p.experienceYears || 0,
      rating: p.rating || 0,
      phone: p.phone || null,
      isActive: p.isActive === undefined ? true : p.isActive,
      // New fields
      dob: p.dob || null,
      email: p.email || null,
      address: p.address || null,
      description: p.description || null,
      availableHours: p.availableHours || null,
      availableDays: p.availableDays || null,
      gender: p.gender || null,
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

// CREATE staff - company-created staff with embedded fields
export const createStaff = async (req, res, next) => {
  try {
    const { provider } = req.body;

    // Build staff doc with embedded fields
    const staffDoc = {
      name: provider?.name,
      email: provider?.email,
      phone: provider?.phone,
      profilePicture: provider?.profilePicture,
      gender: provider?.gender,
      dob: provider?.dob,
      address: provider?.address,
      companyId: provider?.companyId && mongoose.Types.ObjectId.isValid(provider.companyId) 
        ? new mongoose.Types.ObjectId(provider.companyId) 
        : undefined,
      hourlyRate: provider?.hourlyRate,
      dailyRate: provider?.dailyRate,
      employmentType: provider?.employmentType,
      specializations: provider?.specializations || [],
      bio: provider?.bio,
      description: provider?.description,
      experienceYears: provider?.experienceYears || 0,
      availability: provider?.availability || {},
      isActive: provider?.isActive !== false,
      // Conditional availability fields (optional)
      availableHours: provider?.availableHours || undefined,
      availableDays: provider?.availableDays || undefined,
    };

    const sp = await Staff.create(staffDoc);

    return res.status(201).json({ 
      status: 'success', 
      data: { 
        id: sp._id.toString(),
        message: 'Staff created successfully'
      } 
    });
  } catch (err) {
    console.error('createStaff error', err);
    return next(errorHandler(500, 'Failed to create staff'));
  }
};

// UPDATE staff - manage embedded contact fields + availability
export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id))
      return next(errorHandler(400, 'Invalid staff id'));

    const { provider, availability, slotsToAdd, slotsToRemove } = req.body;
    const sp = await Staff.findById(id);
    if (!sp) return next(errorHandler(404, 'Staff not found'));

    // update provider fields
    if (provider) {
      if (provider.name !== undefined) sp.name = provider.name;
      if (provider.email !== undefined) sp.email = provider.email;
      if (provider.phone !== undefined) sp.phone = provider.phone;
      if (provider.profilePicture !== undefined) sp.profilePicture = provider.profilePicture;
      if (provider.gender !== undefined) sp.gender = provider.gender;
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
      // New fields
      if (provider.dob !== undefined) sp.dob = provider.dob;
      if (provider.address !== undefined) sp.address = provider.address;
      if (provider.description !== undefined) sp.description = provider.description;
      // Conditional availability fields (optional)
      if (provider.availableHours !== undefined) sp.availableHours = provider.availableHours;
      if (provider.availableDays !== undefined) sp.availableDays = provider.availableDays;
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

    await sp.save();

    const updated = await Staff.findById(id)
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
            { name: re },
            { specializations: re },
            { bio: re },
            { description: re },
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
          description: 1,
          availableHours: 1,
          availableDays: 1,
        },
      }
    );

    const items = await Staff.aggregate(pipeline);

    const data = items.map((p) => ({
      id: p._id,
      name: p.name || '',
      avatar: p.profilePicture || null,
      employmentType: p.employmentType,
      feeText: p.hourlyRate ? `₹ ${p.hourlyRate}/hr` : (p.dailyRate ? `₹ ${p.dailyRate}/day` : ''),
      hourlyRate: p.hourlyRate,
      dailyRate: p.dailyRate,
      specializations: p.specializations || [],
      experienceYears: p.experienceYears || 0,
      rating: p.rating || 0,
      companyId: p.companyId || null,
      location: p.location || null,
      description: p.description || null,
      availableHours: p.availableHours || null,
      availableDays: p.availableDays || null,
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
      .populate({ path: 'companyId', select: 'name phone email address' })
      .lean();

    if (!staff) return next(errorHandler(404, 'Staff not found'));

    // return shape tailored for customer UI
    const feedbacks = await Feedback.find({ providerId: id }).sort({ createdAt: -1 }).limit(6).lean();

    return res.status(200).json({
      status: 'success',
      data: {
        id: staff._id,
        name: staff.name,
        avatar: staff.profilePicture || null,
        employmentType: staff.employmentType,
        shiftInfo: staff.availability?.weekly?.shiftHoursPerDay || null,
        hourlyRate: staff.hourlyRate,
        experienceYears: staff.experienceYears,
        location: staff.location,
        phone: staff.phone || null,
        specializations: staff.specializations || [],
        bio: staff.bio || '',
        description: staff.description || '',
        availability: staff.availability || {},
        availableHours: staff.availableHours || null,
        availableDays: staff.availableDays || null,
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
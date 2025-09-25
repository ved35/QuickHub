import mongoose from 'mongoose';

const serviceProviderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    experience: {
        type: Number,
        required: true,
    },
    employmentType: {
        type: String,
        enum: ['full_time', 'part_time', 'freelance'],
        required: true,
    },
    dailyRate: {
        type: Number,
        required: true,
    },
    shiftHours: {
        type: Number,
        required: true,
    },
    bio: {
        type: String,
    },
    specializations: [{
        type: String,
        required: true,
    }],
    location: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        coordinates: {
            latitude: {
                type: Number,
            },
            longitude: {
                type: Number,
            }
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    totalBookings: {
        type: Number,
        default: 0,
    },
    completedBookings: {
        type: Number,
        default: 0,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    }
}, {
    timestamps: true,
});

const serviceProviderModel = mongoose.model("ServiceProvider", serviceProviderSchema);

export default serviceProviderModel;
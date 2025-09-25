import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
    },
    staff: [{
        serviceProviderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceProvider',
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        addedAt: {
            type: Date,
            default: Date.now,
        }
    }],
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

const companyModel = mongoose.model("Company", companySchema);

export default companyModel;
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    referenceNo: {
        type: String,
        required: true,
        unique: true,
    },
    serviceSeekerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    serviceProviderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceProvider',
        required: true,
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    scheduledDate: {
        type: Date,
        required: true,
    },
    completedDate: {
        type: Date,
    },
    duration: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    cgst: {
        type: Number,
        required: true,
    },
    sgst: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: [
            'requested',
            'accepted',
            'waiting_company_response',
            'assigned',
            'in_progress',
            'completed',
            'cancelled',
            'paid'
        ],
        default: 'requested',
    },
    isCompanyBooking: {
        type: Boolean,
        default: false,
    },
    companyResponse: {
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
        },
        respondedAt: {
            type: Date,
        },
        assignedStaff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceProvider',
        }
    },
    notes: {
        type: String,
    },
    specialRequirements: {
        type: String,
    }
}, {
    timestamps: true,
});

const bookingModel = mongoose.model("Booking", bookingSchema);

export default bookingModel;
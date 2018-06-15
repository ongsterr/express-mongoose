// import npm modules
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'mongoose-bcrypt';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';

// import custom utilities
import logger from '../utils/logger';
import email from '../utils/email';
import events from '../utils/events';

// build user schema
export const UserSchema = new Schema(
    {
        email: {
            type: String,
            lowercase: true,
            trim: true,
            index: true,
            unique: true,
            required: true,
        },
        username: {
            type: String,
            lowercase: true,
            trim: true,
            index: true,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
            bcrypt: true,
        },
        name: {
            type: String,
            trim: true,
            required: true,
        },
        bio: {
            type: String,
            trim: true,
            default: '',
        },
        url: {
            type: String,
            trim: true,
            default: '',
        },
        twitter: {
            type: String,
            trim: true,
            default: '',
        },
        background: {
            type: Number,
            default: 1,
        },
        interests: {
            type: Schema.Types.Mixed,
            default: [],
        },
        preferences: {
            notifications: {
                daily: {
                    type: Boolean,
                    default: false,
                },
                weekly: {
                    type: Boolean,
                    default: true,
                },
                follows: {
                    type: Boolean,
                    default: true,
                }
            }
        },
        recoveryCode: {
            type: String,
            trim: true,
            default: '',
        },
        active: {
            type: Boolean,
            default: true,
        },
        admin: {
            type: Boolean,
            default: false,
        },
    },
    { collection: 'users' } // What is the second argument in new Schema mean?
)

// pre-save hook that sends welcome email via custom email utility
UserSchema.pre('save', (next) => {
    if (!this.isNew) {
        next();
    }

    email({
        type: 'welcome',
        email: this.email,
    })
        .then(() => {
            next();
        })
        .catch(err => {
            logger.error(err);
            next();
        });
})

// pre-save hook that sends password recovery email via custom email utility
UserSchema.pre('findOneAndUpdate', (next) => {
    if (!this._update.recoveryCode) { // What is '_update' referring to?
        return next();
    }

    email({
        type: 'password',
        email: this._conditions.email,
        passcode: this._update.recoveryCode,
    })
        .then(() => {
            next();
        })
        .catch(err => {
            logger.error(err);
            next();
        });
})

// require plugins
UserSchema.plugin(bcrypt); // automatically bcrypts passwords
UserSchema.plugin(timestamps); // automatically adds createdAt and updatedAt timestamps
UserSchema.plugin(mongooseStringQuery); // enables query capabilities (e.g. ?foo=bar)

UserSchema.index({ email: 1, username: 1 }); // compound index on email + username

module.exports = exports = mongoose.model('User', UserSchema); // export model for use
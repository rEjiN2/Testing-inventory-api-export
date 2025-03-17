const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bankSchema = new Schema({
  _id: false,
  bankName: { type: String, default: "" },
  accountName: { type: String, default: "" },
  accountNumber: { type: String, default: "" },
  ibanNumber: { type: String, default: "" },
  ibanLetter: { type: String, default: "" },
  isDefault: { type: Boolean, default: true },
});

const userSchema = new Schema(
  {
    planId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    roleId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    branchId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    warehosIds: [
      {
        type: mongoose.Types.ObjectId,
        default: [],
        index: true,
      },
    ],
    email: { type: String, index: true, unique: true, lowercase: true },
    password: String,
    phone: { type: String, index: true },
    name: {
      type: String,
      // index: true,
    },
    displayName: { type: String },
    userType: { type: Number, default: 2, index: true, immutable: true },
    sellerBuyerType: String,
    businessType: { type: String, default: "external" },
    uniqueIdentifier: {
      type: String,
      index: true,
      default: "",
      immutable: true,
    },
    eid: String,
    address: String,
    addedFrom: String,
    companyDetails: {
      primaryName: String,
      primaryContact: String,
      trn: String,
    },
    // eid: String,
    eidExpiry: { type: Date },
    tradeLicenceNo: String,
    tlExpiry: { type: Date },
    trnCertificate: String,
    eidCertificate: String,
    eidBackCertificate: String,
    tradeLicense: String,
    commercialAgreement: String,
    token: { type: String, default: "", index: true },
    accessToken: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
    status: { type: Number, default: 1 }, //0=not approved,1=aproved,2=rejected, 3 = suspended
    whyRejected: String,
    rejectedRemarks: String,
    verifyStatus: { type: Number, default: 0 },
    loginStatus: { type: Number, default: 0 },
    loginFrom: { type: String, default: "" }, // * admin|web|app
    resetSession: { type: String, default: "" }, //index:true
    userVerify: { type: Boolean, default: false }, //index:true
    deviceId: { type: String, default: "" },
    countryCode: String,
    countryIso: String,
    createdBy: String,
    qwaitingDepart: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    qwaitingMappCounterId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    creditLimit: { type: Number, default: 0 },
    depositAmt: { type: Number, default: 0 },
    unpaidAmt: { type: Number, default: 0 },
    overdueAmt: { type: Number, default: 0 },
    curBalance: { type: Number, default: 0 },
    walletAmount: { type: Number, default: 0 },
    sapId: { type: String, default: "" },
    allSapId: [
      {
        db: { type: String },
        sapId: { type: String },
      },
    ],
    secondaryPhone: { type: String, index: true },
    secondaryCountryCode: { type: String, index: true },
    secondaryCountryIso: { type: String, index: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isVerificationCompleted: { type: Boolean, default: false },
    isProfileCompleted: { type: Boolean, default: false },
    isAuctionMute: { type: Boolean, default: false },
    isLoginRestricted: { type: Boolean, default: false },
    tnm: { type: Boolean, default: false },
    captchaVerified: { type: Boolean, default: false },
    banks: { type: [bankSchema], default: [] },
    creditLimitValidators: {
      planAdjustment: { type: Boolean, default: false },
    },
    walletAmountValidators: {
      planAdjustment: { type: Boolean, default: false },
    },
    emailers: {
      isSignupEmailSent: { type: Boolean, default: false },
      isApprovedEmailSent: { type: Boolean, default: false },
    },
    isFirstOrderVerified: { type: Boolean, default: false },
    sapIntercompanyCode: String, // SAP INTERCOMPANY ISV
    sapBusinessPartnerMaxTries: Number, // SAP BUSINESS PARTNER MAX TRIES
    maxDiscount: { type: Number, default: 0 },
    secretDeviceId: { type: String },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    termsAcceptedAt: {
      type: Date,
      default: null,
    },
    termsVersion: {
      type: String,
      default: "1.0",
    },
    adminNotifications: [
      {
        notificationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "adminNotification",
        },
        expiresAt: { type: Date }, // Field to track expiration date
        _id: false,
      },
    ], // References to notifications
    isBiddingRestricted: { type: Boolean, default: false },
    sessions: [
      {
        _id: false,
        token: String,
        deviceInfo: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reifitnedIleveLssedecA: {
      type: String,
      immutable: true,
      select: false,
    },
    isLoginOtpVerified: { type: Boolean, default: false },
    isForgotPasswordOtpVerified: { type: Boolean, default: false },
    sapSyncStatus: {
      isUpdated: { type: Boolean, default: false },
      lastSyncedAt: { type: Date, default: null },
      updatedFields: [
        {
          key: String,
          value: mongoose.Schema.Types.Mixed,
        },
      ],
    },
    failureCounter: { type: Number, default: 0 },
    is2faConfigured: { type: Boolean, default: false },
    twoFaSecret: { type: String, default: null },
    buyerApprovedBy: { type: String, default: null },
    sellerApprovedBy: { type: String, default: null },
    isLeadUser: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

const User = mongoose.model("users", userSchema);

module.exports = {
  User,
};

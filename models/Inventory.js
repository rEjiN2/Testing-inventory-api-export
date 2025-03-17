const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorySchema = new Schema(
  {
    lotNo: { type: Number, default: 0, index: true },
    keyNo: { type: String, default: "" },
    branchId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    branch: {
      branchName: String,
    },
    warehosId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    warehouse: {
      warehouseName: String,
    },
    sellerId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    salesUserId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    vin: {
      type: String,
    },
    make: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    makes: {
      makeName: String,
    },
    model: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    models: {
      modelName: String,
    },
    specification: String,
    year: String,
    interiorcolorId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    interiorColor: {
      colorName: String,
      colorCode: String,
    },
    exteriorcolorId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    exteriorColor: {
      colorName: String,
      colorCode: String,
    },
    bodyId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    body: {
      bodyName: String,
    },
    drivetypeId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    driveType: {
      drivetypeName: String,
    },
    engineId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    engine: {
      engineName: String,
    },
    seriesId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    series: {
      seriesName: String,
    },
    fueltypeId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    fuelType: {
      fueltypeName: String,
    },
    transmissionId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    transmission: {
      transName: String,
    },
    receiptId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    milage: Number,
    costPrice: { type: Number, default: 0 },
    startingBid: { type: Number, default: 0 },
    marketPrice: { type: Number, default: 0 },
    mutuallyAgreedStartingBid: { type: Number, default: 0 },
    containerNo: { type: String, default: "", index: true },
    reservePrice: { type: Number, default: 0 },
    invoicePrice: { type: Number, default: 0 },
    purchaseFrom: { type: String, default: "" },
    purchaserId: { type: String, default: "" },
    sapDbCode: {
      type: String,
      default: "",
      validate: {
        validator: function (value) {
          if (this.inventoryType === "direct") {
            return inventory.sapDbCodeEnums.includes(value);
          }
          return true;
        },
        message: "Invalid enum value for direct inventory",
      },
    },
    purchaseEntity: { type: String, default: "" },
    itemSapId: { type: String, default: "" },
    AuctioneerSapId: { type: String, default: "" },
    purchaseDate: { type: Date, default: null },
    sellerReservePrice: { type: Number, default: 0 },
    cylinder: { type: Number, default: 0 },
    sellerPriceAccept: String,
    lastAuctionDate: { type: Date },
    lastBid: { type: String, default: "" },
    inventoryStatus: { type: Number, default: 1, index: true }, // 0:pending,  1: approved, 2: in auction, 3:sold, 4:unsold, 5:re-auction
    planPrice: Number,
    rejectedMsg: String,
    carDocRecieved: { type: Number, default: 0 },
    vccDoc: String,
    mulkiya: String,
    hayaza: String,
    purchaseDoc: String,
    reservepriceDoc: String, // FILE UPLAOD AFTER signature
    QRCode: String, //qrCode path
    counterStatus: String,
    status: String, //pending,waiting for car,approved, ready to auction
    key: String,
    displayNo: { type: Number, default: 0 },
    getpassissue: { type: Number, default: 0 }, //add on 20-06-2023 as disciuss
    completeRuns: { type: Number, default: 0 },
    totalCompletedRuns: { type: Number, default: 0 },
    inventcopy: { type: Number, default: 0 },
    transferId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    inventoryPlanId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true,
    },
    inventoryType: { type: String, default: "" },
    createdBy: { type: String, default: "" },
    isPaymentCleared: { type: Boolean, default: false, index: true },
    forReAuction: { type: Boolean, default: false, index: true },
    createdFrom: String,
    addedFrom: String,
    inventoryRemarks: String,
    internalInventoryRemarks: String,
    customsClearanceDate: { type: Date, default: null },
    isCreatedBySalesReturn: { type: Boolean, default: false, index: true },
    bidWith: { type: String, default: "", index: true }, // for indirect only - starting-bid | reserve-price
    auctionSoldDate: { type: Date, default: null, index: true }, // when sold - auctionDate
    primaryDamage: { type: String, default: "", index: true },
    secondaryDamage: { type: String, default: "", index: true },
    isCostPriceUpdated: { type: Boolean, default: false, index: true },
    landedCostLocal: { type: Number, default: 0 },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
inventorySchema.index({ vin: 1 }, { collation: { locale: "en", strength: 2 } });
inventorySchema.index({ inventoryType: 1, inventoryStatus: 1 });

const Inventory = mongoose.model("inventorys", inventorySchema);

module.exports = { Inventory };

const BASE_URL = process.env.BASE_URL;
const NODE_ENV = process.env.NODE_ENV;

module.exports = Object.freeze({
    ENV: NODE_ENV,
    baseURL: process.env.BASE_URL,
    imsBaseURL: process.env.IMS_BASE_URL,
    PORT: process.env.PORT,
    DEV: "development",
    PROD: "production",
    APP_NAME: "ACA",
    isDev: function () {
      return this.ENV === this.DEV ? true : false;
    },
    isProd: function () {
      return this.ENV === this.PROD ? true : false;
    },
   
    defaultSort: { createdAt: -1 },

    makeexport: [
      { header: "iD", key: "_id", width: 10 },
      { header: "MakeName", key: "makeName", width: 10 },
      { header: "Status", key: "status", width: 10 },
    ],
    userRole: {
      1: "admin",
      2: "seller",
      3: "seller",
      4: "buyer",
      5: "buyer",
    },
    userRoles: {
      1: "Admin",
      2: "Individual Seller",
      3: "Corporate Seller",
      4: "Individual Buyer",
      5: "Corporate Buyer",
    },
    userStatus: {
      0: "pending",
      1: "approved",
      2: "rejected",
      3: "suspended",
    },
    userTypes: {
      ADMIN: "admin",
      SELLER: "seller",
      BUYER: "buyer",
    },
    userTypeStatus: {
      admin: [1],
      seller: [2, 3],
      buyer: [4, 5],
    },
    globalUsers: {
      admin: [1],
      client: [2, 3, 4, 5],
    },
    internalUsers: {
      Auctioneer: "Auctioneer",
      Mechanic: "Mechanic",
      Driver: "Driver",
    },
    inventoryStatus: {
      0: "approved",
      1: "pending",
      2: "in auction",
      3: "sold",
      4: "unsold",
      5: "re-auction",
    },
    inventoryTypes: {
      DIRECT: "direct",
      INDIRECT: "indirect",
    },
    boolStatus: {
      inactive: 0,
      active: 1,
    },
    inventoryBidWithForIndirectInventories: {
      "starting-bid": "starting-bid",
      "reserve-price": "reserve-price",
    },
    lang: "eng",
    errorShow: true,


    existURL: [
     "api/inventory/export-inventory"
    ],
    passURL: [
        
    ], 
  defaultInventoryImage: `${BASE_URL}/public/temp/default-car.jpg`,
  defaultAuctionImage: `${BASE_URL}/public/temp/auction.jpeg`,
  });
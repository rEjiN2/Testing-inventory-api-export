const {
  isArrayWithLength,
  makeObjectId,
  checkBoolean,
  dynamicSort,
} = require("../functions/global.functions");
const {
  DateMatch,
  ExactMatch,
  IDMatch,
  LookupWithPipeline,
  InMatch,
  Lookup,
  Unwind,
  AddFields,
  Match,
  Project,
  Sort,
  Limit,
} = require("../functions/mongoose.functions");
const { downloadInventoryListXlsx } = require("../helpers/inventory.helper");
const cMethod = require("../functions/common.functions");
const { Inventory } = require("../models/Inventory");
const configJs = require("../config.js");

const exportInventory = async (postData, res) => {
  try {
    const query = [];
    if (postData.date === "created" && postData.fromDate && postData.toDate) {
      DateMatch(query, "createdAt", postData.fromDate, postData.toDate);
    }
    if (postData.addedFrom) {
      ExactMatch(query, "addedFrom", postData.addedFrom);
    }
    if (postData.completeRuns) {
      ExactMatch(query, "completeRuns", postData.completeRuns);
    }
    if (postData.containerNo) {
      ExactMatch(query, "containerNo", postData.containerNo);
    }
    if (postData.sellerDbId) {
      IDMatch(query, "sellerId", postData.sellerDbId);
    }
    if (postData.salesUserId) {
      IDMatch(query, "salesUserId", postData.salesUserId);
    }
    if (postData.vin) {
      ExactMatch(query, "vin", postData.vin);
    }
    if (postData.uniqueIdentifier) {
      ExactMatch(query, "uniqueIdentifier", postData.uniqueIdentifier);
    }
    if (postData.status) {
      postData.status = Number(postData.status);
      ExactMatch(query, "inventoryStatus", postData.status);
    }
    if (postData.inventoryType) {
      ExactMatch(query, "inventoryType", postData.inventoryType);
    }
    if (postData.inventoryId) {
      IDMatch(query, "_id", postData.inventoryId);
    }

    LookupWithPipeline(
      query,
      "vinimages",
      {
        inventoryId: "$_id",
        imageType: "inventory",
        type: "seller-car-image",
      },
      [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$imageType", "$$imageType"] },
                { $eq: ["$type", "$$type"] },
                { $eq: ["$referenceId", "$$inventoryId"] },
              ],
            },
          },
        },
      ],
      "sellerVinImages"
    );

    if (isArrayWithLength(postData.statusArr)) {
      InMatch(query, "status", postData.statusArr);
    }
    let inventoryStatusData = [];
    if (isArrayWithLength(postData.inventoryStatus)) {
      let pdata = postData.inventoryStatus;
      for (let i in pdata) {
        inventoryStatusData.push(Number(pdata[i]));
      }
      InMatch(query, "inventoryStatus", inventoryStatusData);
    }
    if (postData.processStatus) {
      if (postData.processStatus == "NA") {
        ExactMatch(query, "status", " ");
      } else {
        ExactMatch(query, "status", postData.processStatus);
      }
    }
    let branchData = [];
    if (postData.branchId) {
      let pdata = postData.branchId;
      for (let i in pdata) {
        branchData.push(makeObjectId(pdata[i]));
      }
      InMatch(query, "branchId", branchData);
    }
    if (postData.warehosId) {
      IDMatch(query, "warehosId", postData.warehosId);
    }
    let warehosnewData = [];
    if (postData.warehosIds) {
      let pdata = postData.warehosIds;
      for (let i in pdata) {
        warehosnewData.push(makeObjectId(pdata[i]));
      }
      InMatch(query, "warehosId", warehosnewData);
    }

    Lookup(query, "users", "sellerId", "_id", "users");
    Unwind(query, "$users");
    Lookup(query, "users", "salesUserId", "_id", "salesusers");
    Unwind(query, "$salesusers");

    // * inspection
    if (checkBoolean(postData?.isInspectionNeeded)) {
      Lookup(query, "inspections", "_id", "inventoryId", "inspection");
      Unwind(query, "$inspection");
    }

    if (postData.apiType !== "web") {
      // * inGatePass
      const inGatePassLet = {
        inventoryId: "$_id",
        direction: "in",
      };
      const inGatePassPipeline = [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$inventoryId", "$$inventoryId"],
                },
                {
                  $eq: ["$direction", "$$direction"],
                },
              ],
            },
          },
        },
      ];
      LookupWithPipeline(
        query,
        "getpasses",
        inGatePassLet,
        inGatePassPipeline,
        "inGatePass"
      );

      // * outGatePass
      const outGatePassLet = {
        inventoryId: "$_id",
        direction: "out",
      };
      const outGatePassPipeline = [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$inventoryId", "$$inventoryId"],
                },
                {
                  $eq: ["$direction", "$$direction"],
                },
              ],
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $limit: 1,
        },
      ];

      LookupWithPipeline(
        query,
        "getpasses",
        outGatePassLet,
        outGatePassPipeline,
        "outGatePass"
      );

      if (Array.isArray(postData.inGatePassStatus)) {
        InMatch(query, "inGatePass.status", postData.inGatePassStatus);
      }

      if (Array.isArray(postData.outGatePassStatus)) {
        InMatch(query, "outGatePass.status", postData.outGatePassStatus);
      }

      if (
        postData.date === "inGatePassProcessedDate" &&
        postData.fromDate &&
        postData.toDate
      ) {
        DateMatch(
          query,
          "inGatePass.processedDate",
          postData.fromDate,
          postData.toDate
        );
      }
    }
    if (postData?.apiType === "web" && checkBoolean(postData?.pagination)) {
      const pipeline = [];
      LookupWithPipeline(
        pipeline,
        "auctionvehicles",
        {
          inventoryId: "$_id",
        },
        [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$inventoryId", "$$inventoryId"] },
                  { $eq: ["$status", "pending"] },
                ],
              },
            },
          },
        ],
        "auctionVehicles"
      );
      Unwind(pipeline, "$auctionVehicles");
      LookupWithPipeline(
        pipeline,
        "auctionvehicles",
        {
          auctionId: "$auctionVehicles.auctionId",
          currentDisplayNo: "$auctionVehicles.displayNo",
        },
        [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$auctionId", "$$auctionId"],
                  },
                  { $eq: ["$status", "pending"] },
                  {
                    $eq: ["$displayNo", { $add: ["$$currentDisplayNo", 1] }],
                  },
                ],
              },
            },
          },
        ],
        "nextCar"
      );
      LookupWithPipeline(
        pipeline,
        "auctionvehicles",
        {
          auctionId: "$auctionVehicles.auctionId",
          currentDisplayNo: "$auctionVehicles.displayNo",
        },
        [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$auctionId", "$$auctionId"],
                  },
                  { $eq: ["$status", "pending"] },
                  {
                    $eq: [
                      "$displayNo",
                      { $subtract: ["$$currentDisplayNo", 1] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        "previousCar"
      );
      AddFields(pipeline, "isNextCarAvailable", {
        $cond: [{ $gt: [{ $size: ["$nextCar"] }, 0] }, true, false],
      });
      AddFields(pipeline, "isPreviousCarAvailable", {
        $cond: [{ $gt: [{ $size: ["$previousCar"] }, 0] }, true, false],
      });

      query.push(...pipeline);
      const _let = {
        inventoryId: makeObjectId(postData.inventoryId),
        buyerId: makeObjectId(postData.buyerId),
      };

      const _pipeline = [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$inventoryId", "$$inventoryId"] },
                { $eq: ["$buyerId", "$$buyerId"] },
              ],
            },
          },
        },
      ];

      LookupWithPipeline(query, "watchlists", _let, _pipeline, "watchList");
      Unwind(query, "$watchList");
    }

    if (checkBoolean(postData?.needAuctionTitle)) {
      const _let = { inventoryId: "$_id" };
      const _pipeline = [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$inventoryId", "$$inventoryId"] },
                { $eq: ["$status", "pending"] },
              ],
            },
          },
        },
      ];
      LookupWithPipeline(
        query,
        "auctionvehicles",
        _let,
        _pipeline,
        "auctionVehiclesForAuction"
      );
      Unwind(query, "$auctionVehiclesForAuction");
      Lookup(
        query,
        "auctions",
        "auctionVehiclesForAuction.auctionId",
        "_id",
        "auction"
      );
      Unwind(query, "$auction");
    }

    if ([true, "true"].includes(postData.getpass)) {
      LookupWithPipeline(
        query,
        "getpasses",
        {
          inventoryId: "$_id",
          direction: "out",
        },
        [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$inventoryId", "$$inventoryId"],
                  },
                  {
                    $eq: ["$direction", "$$direction"],
                  },
                ],
              },
            },
          },
        ],
        "outGatePass"
      );

      AddFields(query, "outGatePass", {
        $cond: {
          if: {
            $and: [
              {
                $in: ["$inventoryStatus", [1, 2]],
              },
            ],
          },
          then: [{ status: "pending" }],
          else: "$outGatePass",
        },
      });

      InMatch(query, "outGatePass.status", ["pending", "in warehouse"]);
    }
    if (checkBoolean(postData.needCompletedRuns)) {
      LookupWithPipeline(
        query,
        "auctionvehicles",
        {
          inventoryId: "$_id",
          status: "unsold",
        },
        [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$inventoryId", "$$inventoryId"],
                  },
                  { $eq: ["$status", "$$status"] },
                ],
              },
            },
          },
        ],
        "auctionVehicles"
      );
    }
    if (checkBoolean(postData.isOutGatePassNeeded)) {
      LookupWithPipeline(
        query,
        "getpasses",
        {
          inventoryId: "$_id",
          direction: "out",
        },
        [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$inventoryId", "$$inventoryId"],
                  },
                  {
                    $eq: ["$direction", "$$direction"],
                  },
                ],
              },
            },
          },
        ],
        "outgoingGatePass"
      );
    }
    if (checkBoolean(postData.needLastBid)) {
      LookupWithPipeline(
        query,
        "auctionvehicles",
        {
          inventoryId: "$_id",
        },
        [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$inventoryId", "$$inventoryId"],
                  },
                ],
              },
            },
          },
        ],
        "biddenAuctionVehicles"
      );
    }
    if (checkBoolean(postData.needLastMutuallyAcceptedReservePrice)) {
      LookupWithPipeline(
        query,
        "reseverprices",
        {
          inventoryId: "$_id",
        },
        [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$inventoryId", "$$inventoryId"] },
                  { $eq: ["$acaStatus", 1] },
                  { $eq: ["$sellerStatus", 1] },
                ],
              },
            },
          },
        ],
        "lastMutuallyAcceptedReservePrice"
      );
    }
    if (checkBoolean(postData.isCreatedBySalesReturn)) {
      ExactMatch(
        query,
        "isCreatedBySalesReturn",
        checkBoolean(postData.isCreatedBySalesReturn)
      );
    }

    // * vinimages
    LookupWithPipeline(
      query,
      "vinimages",
      {
        inventoryId: "$_id",
        imageType: "inventory",
        type: ["carimage", "other-docs", "interior-video", "exterior-video"],
      },
      [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$imageType", "$$imageType"] },
                { $in: ["$type", "$$type"] },
                { $eq: ["$referenceId", "$$inventoryId"] },
              ],
            },
          },
        },
      ],
      "vinimages"
    );
    // * singlevinimages
    Unwind(query, "$vinimages");

    // * singlevinimages
    LookupWithPipeline(
      query,
      "vinimages",
      {
        inventoryId: "$_id",
        imageType: "inventory",
        type: "carimage",
      },
      [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$imageType", "$$imageType"] },
                { $eq: ["$type", "$$type"] },
                { $eq: ["$referenceId", "$$inventoryId"] },
                { $eq: ["$defaultimage", 1] },
              ],
            },
          },
        },
      ],
      "singlevinimages"
    );

    LookupWithPipeline(
      query,
      "reseverprices",
      {
        id: "$_id",
        inventoryId: "$inventoryId",
      },
      [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$inventoryId", "$$id"] }],
            },
          },
        },
      ],
      "reseverprices"
    );
    AddFields(query, "reseverprices", { $last: "$reseverprices" });
    Lookup(query, "carwisesellerplans", "_id", "inventoryId", "carPlan");
    if (postData.search) {
      Match(query, {
        $and: [
          {
            $or: [
              { vin: { $regex: postData.search, $options: "i" } },
              { year: { $regex: postData.search, $options: "i" } },
            ],
          },
        ],
      });
    } else {
      Match(query, {
        $and: [{ costPrice: { $exists: true } }],
      });
    }
    LookupWithPipeline(
      query,
      "auctionvehicles",
      {
        inventoryId: "$_id",
      },
      [
        {
          $match: {
            $expr: {
              $eq: ["$inventoryId", "$$inventoryId"],
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $limit: 1,
        },
      ],
      "currentAuctionVehicle"
    );
    LookupWithPipeline(
      query,
      "auctions",
      {
        auctionId: {
          $arrayElemAt: ["$currentAuctionVehicle.auctionId", 0],
        },
      },
      [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $ne: ["$$auctionId", null],
                },
                {
                  $eq: ["$_id", "$$auctionId"],
                },
              ],
            },
          },
        },
      ],
      "currentAuction"
    );
    let apiType = postData.apiType;
    if (apiType == "web") {
      Project(query, {
        lotNo: 1, // marked
        vin: 1,
        addedFrom: 1,
        year: 1,
        sapDbCode: 1,
        purchaseEntity: 1,
        itemSapId: 1,
        startingBid: 1,
        containerNo: 1,
        counterStatus: 1,
        purchaserId: 1,
        salesUserName: "$salesusers.name",
        sellerUniqueIdentifier: "$users.uniqueIdentifier",
        sellerName: "$users.name",
        branchName: "$branch.branchName",
        warehouseName: "$warehouse.warehouseName",
        makeName: "$makes.makeName",
        modelName: "$models.modelName",
        exteriorColor: "$exteriorColor.colorName",
        completedRuns: {
          $cond: {
            if: {
              $eq: [
                {
                  $type: "$auctionVehicles",
                },
                "array",
              ],
            },
            then: {
              $size: {
                $ifNull: ["$auctionVehicles", []],
              },
            },
            else: 0,
          },
        },
        purchaseDateFormatted: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$purchaseDate",
          },
        },
        statusFormatted: {
          $switch: {
            branches: [
              {
                case: {
                  $eq: ["$inventoryStatus", 0],
                },
                then: "$status",
              },
              {
                case: {
                  $eq: ["$inventoryStatus", 1],
                },
                then: "Instock",
              },
              {
                case: {
                  $eq: ["$inventoryStatus", 2],
                },
                then: "Auction Stock",
              },
              {
                case: {
                  $eq: ["$inventoryStatus", 3],
                },
                then: "Sold",
              },
              {
                case: {
                  $eq: ["$inventoryStatus", 4],
                },
                then: "Unsold",
              },
              {
                case: {
                  $eq: ["$inventoryStatus", 5],
                },
                then: "ReAuction",
              },
            ],
            default: "$status",
          },
        },
        inGatePass: {
          $arrayElemAt: ["$inGatePass.status", 0],
        },
        inGatePassProcessDateFormatted: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: {
              $arrayElemAt: ["$inGatePass.processedDate", 0],
            },
          },
        },
        outGatePass: {
          $arrayElemAt: ["$outGatePass.status", -1],
        },
        acaOffered: "$reseverprices.acaOffer",
        sellerReserve: "$reseverprices.sellerOffer",
        internalInventoryRemarks: 1,
        createdAtFormatted: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$createdAt",
          },
        },
        daysPassedSinceCreated: {
          $dateDiff: {
            startDate: "$createdAt",
            endDate: "$$NOW",
            unit: "day",
          },
        },
        daysPassedSinceReceived: {
          $dateDiff: {
            startDate: {
              $arrayElemAt: ["$inGatePass.processedDate", 0],
            },
            endDate: "$$NOW",
            unit: "day",
          },
        },
      });
    } else {
      Project(query, {
        lotNo: 1, // marked
        vin: 1,
        addedFrom: 1,
        salesUserName: "$salesusers.name",
        sellerUniqueIdentifier: "$users.uniqueIdentifier",
        sellerName: "$users.name",
        branchName: "$branch.branchName",
        warehouseName: "$warehouse.warehouseName",
        makeName: "$makes.makeName",
        modelName: "$models.modelName",
        year: 1,
        sapDbCode: 1,
        purchaseEntity: 1,
        itemSapId: 1,
        exteriorColor: "$exteriorColor.colorName",
        startingBid: 1,
        containerNo: 1,
        completedRuns: {
          $cond: {
            if: {
              $eq: [
                {
                  $type: "$auctionVehicles",
                },
                "array",
              ],
            },
            then: {
              $size: {
                $ifNull: ["$auctionVehicles", []],
              },
            },
            else: 0,
          },
        },
        purchaseDateFormatted: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$purchaseDate",
          },
        },
        purchaserId: 1,
        statusFormatted: {
          $switch: {
            branches: [
              {
                case: {
                  $eq: ["$inventoryStatus", 0],
                },
                then: "$status",
              },
              {
                case: {
                  $eq: ["$inventoryStatus", 1],
                },
                then: "Instock",
              },
              {
                case: {
                  $eq: ["$inventoryStatus", 2],
                },
                then: "Auction Stock",
              },
              {
                case: {
                  $eq: ["$inventoryStatus", 3],
                },
                then: "Sold",
              },
              {
                case: {
                  $eq: ["$inventoryStatus", 4],
                },
                then: "Unsold",
              },
              {
                case: {
                  $eq: ["$inventoryStatus", 5],
                },
                then: "ReAuction",
              },
            ],
            default: "$status",
          },
        },
        inGatePass: {
          $arrayElemAt: ["$inGatePass.status", 0],
        },
        inGatePassProcessDateFormatted: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: {
              $arrayElemAt: ["$inGatePass.processedDate", 0],
            },
          },
        },
        outGatePass: {
          $arrayElemAt: ["$outGatePass.status", -1],
        },
        acaOffered: "$reseverprices.acaOffer",
        sellerReserve: "$reseverprices.sellerOffer",
        counterStatus: 1,
        internalInventoryRemarks: 1,
        createdAtFormatted: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$createdAt",
          },
        },
        daysPassedSinceCreated: {
          $dateDiff: {
            startDate: "$createdAt",
            endDate: "$$NOW",
            unit: "day",
          },
        },
        daysPassedSinceReceived: {
          $dateDiff: {
            startDate: {
              $arrayElemAt: ["$inGatePass.processedDate", 0],
            },
            endDate: "$$NOW",
            unit: "day",
          },
        },
      });
    }

    if (postData.sortbydisplayNo == true) {
      Sort(query, { displayNo: -1 });
    } else if (postData.sortBySalesReturnDesc) {
      Sort(query, { isCreatedBySalesReturn: -1 });
    } else {
      Sort(query, dynamicSort(postData));
    }


    if (postData.isExport) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="inventory-export-${Date.now()}.xlsx"`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      const cursor = Inventory.aggregate(query , {readPreference: "secondaryPreferred"}).cursor();
      await downloadInventoryListXlsx(cursor, res);
    } else {
      Limit(query, cMethod.pageLimit(postData.pageLimit));
      const result = await Inventory.aggregate(query);
      return {
        status: true,
        data: result,
        message: "List Retrieved",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: "Error in getting inventory list",
      error: error.message || error,
    };
  }
};

module.exports = {
  exportInventory,
};

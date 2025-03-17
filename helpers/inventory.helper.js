const ExcelJS = require("exceljs");
const { getBatchedIterable } = require("../functions/global.functions");

const downloadInventoryListXlsx = async (cursor, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventory_List");
  
    worksheet.columns = [
      { header: "Lot_No", key: "lotNo" },
      { header: "FULL_VIN_NO", key: "vin" },
      { header: "Sales_Man", key: "salesUserName" },
      { header: "SELLER_ID", key: "sellerUniqueIdentifier" },
      { header: "SELLER_NAME", key: "sellerName" },
      { header: "Branch_Name", key: "branchName" },
      { header: "Warehouse_Name", key: "warehouseName" },
      { header: "MAKE", key: "makeName" },
      { header: "MODEL", key: "modelName" },
      { header: "YEAR", key: "year" },
      { header: "SapDbCode", key: "sapDbCode" },
      { header: "purchaseEntity", key: "purchaseEntity" },
      { header: "itemSapId", key: "itemSapId" },
      { header: "COLOR", key: "exteriorColor" },
      { header: "Starting_Bid", key: "startingBid" },
      { header: "Container_No", key: "containerNo" },
      { header: "Complete_Runs", key: "completedRuns" },
      { header: "Purchase_Date", key: "purchaseDateFormatted" },
      { header: "Purchaser_Id", key: "purchaserId" },
      { header: "STATUS", key: "statusFormatted" },
      { header: "In_GatePass", key: "inGatePass" },
      {
        header: "In_GatePass_Process_Date",
        key: "inGatePassProcessDateFormatted",
      },
      { header: "Out_GatePass", key: "outGatePass" },
      { header: "ACA_OFFERED", key: "acaOffered" },
      { header: "SELLER_RESERVE", key: "sellerReserve" },
      { header: "Offer_By", key: "counterStatus" },
      { header: "Internal_Inventory_Remarks", key: "internalInventoryRemarks" },
      { header: "created_at", key: "createdAtFormatted" },
    ];
  
    const batchSize = 1000;
  
    try {
      for await (const batch of getBatchedIterable(cursor, batchSize)) {
        worksheet.addRows(batch);
      }
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
     console.log(error);
     throw new Error
    }
  };


  module.exports = {
    downloadInventoryListXlsx
  }
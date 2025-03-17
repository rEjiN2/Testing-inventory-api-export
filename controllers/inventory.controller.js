const { inventoryService } = require("../services/index.js");
const cMethod = require("../functions/common.functions.js");

const exportInventory = async (req, res) => {
  const { body } = req;
  try {
    const exportData = await inventoryService.exportInventory(body, res);

    if (exportData && exportData.status === false) {
      return cMethod.returrnErrorMessage(res, exportData.message);
    }

    if (exportData) {
      return cMethod.returnSuccess(res, exportData, false, "List Retrieved");
    }
  } catch (error) {
    if (!res.headersSent) {
      return cMethod.returnServerError(res, error.message);
    }
  }
};

module.exports = {
  exportInventory,
};

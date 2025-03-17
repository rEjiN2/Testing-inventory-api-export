const express = require("express");
const { inventoryController } = require("../controllers");


const router = express.Router();


router.post("/export-inventory", inventoryController.exportInventory);






module.exports = router;
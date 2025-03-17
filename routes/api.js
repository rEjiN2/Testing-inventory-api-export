const { inventoryRoutes } = require("./index.js");


module.exports = function (app) {
    app.use("/api/inventory", inventoryRoutes);
  };
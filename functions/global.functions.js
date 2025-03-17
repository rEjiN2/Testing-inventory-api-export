const mongoose = require("mongoose");

const makeObjectId = (id) => {
    if (!id) return;
  
    return mongoose.Types.ObjectId(id);
  };

const isArrayWithLength = (arr) => Array.isArray(arr) && arr.length > 0;  

const checkBoolean = (input) => {
    if (!input) return false;
  
    if (typeof input === "boolean") return input;
  
    if (typeof input === "string") {
      if (input === "true") return true;
      else if (input === "false") return false;
    }
  };

  const getBatchedIterable = async function* (cursor, batchSize) {
    let batch = [];
    let hasNext = false;
    do {
      const item = await cursor.next();
  
      hasNext = !!item;
      if (hasNext) batch.push(item);
  
      if (batch.length === batchSize) {
        yield batch;
        batch = [];
      }
    } while (hasNext);
  
    if (batch.length) yield batch;
  };
  
  const dynamicSort = (data = {}) => {
    const { sortKey = "createdAt", sortOrder } = data;
    const validSortOrder = Number(sortOrder) === 1 ? 1 : -1;
    return { [sortKey]: validSortOrder };
  };

module.exports = {
    makeObjectId,
    isArrayWithLength,
    checkBoolean,
    getBatchedIterable,
    dynamicSort
}
const configJs = require("../config.js");

module.exports = {
    pageOffset: function (page, pageLimit) {
        if (!pageLimit) {
          pageLimit = config.pageLimit;
        }
    
        if (page == 1 || page == 0) {
          return 0;
        }
        return (page - 1) * pageLimit;
      },
      pageLimit: function (pageLimit) {
        if (pageLimit) {
          return parseInt(pageLimit);
        }
    
        return config.pageLimit;
      },
      returnSuccess: function (res, result, hasMore, message, totalCount) {
        if (arguments.length == 5) {
          res.status(200).json({
            status: true,
            result: result,
            message: message,
            hasMore: hasMore,
            totalCount: totalCount,
          });
        } else if (arguments.length == 4) {
          res.status(200).json({
            status: true,
            result: result,
            message: message,
            hasMore: hasMore,
          });
        } else if (arguments.length == 3) {
          res.status(200).json({ status: true, result: result, hasMore: hasMore });
        } else {
          res.status(200).json({ status: true, result: result });
        }
      },
      returnCustomSuccess: function (res, result, hasMore, message, unseenCount) {
        res.status(200).json({
          status: true,
          result: result,
          message: message,
          hasMore: hasMore,
          unseenCount: unseenCount,
        });
      },
      returrnErrorMessage(res, message) {
        res.status(200).json({ status: false, message: message });
      },
      returnServerError: function (res, message, error, errorCode) {
        if (configJs.errorShow) {
          // console.log("returnSreverError Error=>>", error);
          if (arguments.length == 4) {
            res.status(500).json({
              status: false,
              message: message,
              errorCode: errorCode,
              error: error,
            });
          } else if (arguments.length == 3) {
            res.status(500).json({ status: false, message: message });
          } else {
            res.status(500).json({ status: false, message: message });
          }
        } else {
          if (arguments.length == 3) {
            res
              .status(500)
              .json({ status: false, message: message, errorCode: errorCode });
          } else if (arguments.length == 2) {
            res.status(500).json({ status: false, message: message });
          } else {
            res.status(500).json({ status: false, message: message });
          }
        }
      },
      returnNotFoundError: function (res, message, error, errorCode) {
        if (config.errorShow) {
          // console.log("returnNotFoundError Error=>>", error);
          if (arguments.length == 4) {
            res.status(400).json({
              status: false,
              message: message,
              errorCode: errorCode,
              //error: error,
            });
          } else if (arguments.length == 3) {
            res.status(400).json({ status: false, message: message, error: error });
          } else {
            res.status(400).json({ status: false, message: message });
          }
        } else {
          if (arguments.length == 3) {
            res
              .status(400)
              .json({ status: false, message: message, errorCode: errorCode });
          } else if (arguments.length == 2) {
            res.status(400).json({ status: false, message: message });
          } else {
            res.status(400).json({ status: false, message: message });
          }
        }
      },
}
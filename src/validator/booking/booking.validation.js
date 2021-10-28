const { updateBooking } = require("../../controllers/booking.controller");
const { booking } = require("./booking.schema");

module.exports = {
  addBookingValidator: async(req,res,next) =>{
      const value = await booking.validate(req.body);
      if(value.error)
      {
        res.status(400).json({
            ErrorMessage: value.error.details[0].message,
          });
      }
      else{
          next();
      }
  },
  updateBookingValidator: async(req,res,next) =>{
    const value = await updateBooking.validate(req.body);
    if(value.error)
    {
      res.status(400).json({
          ErrorMessage: value.error.details[0].message,
        });
    }
    else{
        next();
    }
},
};

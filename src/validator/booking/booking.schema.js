const joi = require('joi');


module.exports = {
    booking: joi.object({
      user_id: joi.number().integer().required(),
      booking_type_id: joi
        .number()
        .integer()
        .min(1)
        .message("Invalid booking_type_id")
        .max(4)
        .message("Invalid booking_type_id")
        .required(),
      time_start: joi.date().required(),
      time_type: joi
        .number()
        .integer()
        .min(1)
        .message("Invalid time_type")
        .max(4)
        .message("Invalid time_type")
        .required(),
      hour_time: joi.number().integer(),
    }),
    updateBooking:joi.object({
      id: joi.number().integer().required(),
      user_id: joi.number().integer().required(),
      booking_type_id: joi
        .number()
        .integer()
        .min(1)
        .message("Invalid booking_type_id")
        .max(4)
        .message("Invalid booking_type_id")
        .required(),
      time_start: joi.date().required(),
      time_type: joi
        .number()
        .integer()
        .min(1)
        .message("Invalid time_type")
        .max(4)
        .message("Invalid time_type")
        .required(),
      hour_time: joi.number().integer(),
    }),
  };

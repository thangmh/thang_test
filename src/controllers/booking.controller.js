const db = require("../models");
const Sequelize = require("sequelize");
const { response } = require("express");
const Op = Sequelize.Op;

const bookingType = { HOT_DESK: 1, MEETING: 2, PHONE_BOOTH: 3, PARKING: 4 };
const timeType = { HOURLY: 1, DAILY: 2, WEEKLY: 3, MONTHLY: 4 };
const booking = db.booking;

module.exports.createBooking = async (req, res) => {
  const {
    user_id,
    booking_type_id,
    time_end,
    time_start,
    time_type,
    hour_time,
  } = req.body;

  // Phone booth only booking on hourly
  if (
    booking_type_id == bookingType.PHONE_BOOTH &&
    time_type != timeType.HOURLY
  ) {
    res.status(400).json({
      ErrorMessage: "Phone booth hour only booking on hourly",
    });
    return;
  }

  // Parking can't booking on hourly
  if (booking_type_id == bookingType.PARKING && time_type == timeType.HOURLY) {
    res.status(400).json({
      ErrorMessage: "Parking hour can't booking on hourly",
    });
    return;
  }

  // Check max booking
  if (! await CheckQuality(GetBookingCount("", booking_type_id), booking_type_id)) {
    res.status(400).json({
      ErrorMessage: "Dont have available booking",
    });
    return;
  }

  // Check duplicate booking
  if ( await GetBookingCount(user_id, booking_type_id, time_start) != 0) {
    res.status(400).json({
      ErrorMessage: "You already booking",
    });
    return;
  }

  booking
    .create({
      booking_type_id: booking_type_id,
      time_start: time_start,
      time_end: time_end,
      user_id: user_id,
      time_type: time_type,
      hour_time: hour_time,
    })
    .then((booking) => {
      res.send(booking);
      return;
    })
    .catch((err) => {
      console.log(err);
      res.status(503).json({
        ErrorMessage: "Save failed",
      });
      return;
    });
};

async function GetBookingCount(user_id, booking_type_id, time_start = null) {
  let currentTime = time_start == null ? new Date() : new Date(time_start);
  let where = {
    booking_type_id: booking_type_id,
    time_start: { [Op.gt]: time_start == null ? new Date() : new Date(time_start) },
    [Op.or]: [
      {
        time_type: timeType.HOURLY,
        time_start: {
          [Op.lt]: new Date(currentTime.setHours(currentTime.getHours() - 1))
            .toISOString()
            .slice(0, 10),
        },
      },
      {
        time_type: timeType.DAILY,
        time_start: {
          [Op.lt]: new Date(currentTime.setDate(currentTime.getDate() - 1))
            .toISOString()
            .slice(0, 10),
        },
      },
      {
        time_type: timeType.WEEKLY,
        time_start: {
          [Op.lt]: new Date(currentTime.setDate(currentTime.getDate() - 7))
            .toISOString()
            .slice(0, 10),
        },
      },
      {
        time_type: timeType.MONTHLY,
        time_start: {
          [Op.lt]: new Date(currentTime.setMonth(currentTime.getMonth() - 1))
            .toISOString()
            .slice(0, 10),
        },
      },
    ],
  };
  if (user_id != "") where["user_id"] = user_id;
  return await booking.count({ where });
}
function CheckQuality(count, booking_type_id) {
  switch (booking_type_id) {
    case bookingType.HOT_DESK:
      if (count >= 200) return false;
      break;
    case bookingType.MEETING:
      if (count >= 4) return false;
      break;
    case bookingType.PHONE_BOOTH:
      if (count >= 4) return false;
      break;
    case bookingType.PARKING:
      if (count >= 4) return false;
      break;
  }
  return true;
}

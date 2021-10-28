const db = require("../models");
const Sequelize = require("sequelize");
const { response } = require("express");
const Op = Sequelize.Op;

const bookingType = { HOT_DESK: 1, MEETING: 2, PHONE_BOOTH: 3, PARKING: 4 };
const timeType = { HOURLY: 1, DAILY: 2, WEEKLY: 3, MONTHLY: 4 };
const booking = db.booking;

module.exports.createBooking = async (req, res) => {
  const { user_id, booking_type_id, time_start, time_type, hour_time } =
    req.body;

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
  if (
    !(await CheckQuality(GetBookingCount("", booking_type_id), booking_type_id))
  ) {
    res.status(400).json({
      ErrorMessage: "Dont have available booking",
    });
    return;
  }

  // Check duplicate booking
  if ((await GetBookingCount(user_id, booking_type_id, time_start)) != 0) {
    res.status(400).json({
      ErrorMessage: "You already booking",
    });
    return;
  }

  CheckCase(booking_type_id, user_id, time_start, hour_time);
  booking
    .create({
      booking_type_id: booking_type_id,
      time_start: time_start,
      user_id: user_id,
      time_type: time_type,
      hour_time: hour_time,
    })
    .then(() => {
      res.status(201).send(booking);
    })
    .catch((err) => {
      console.log(err);
      res.status(503).json({
        ErrorMessage: "Save failed",
      });
      return;
    });
};

module.exports.updateBooking = async (req, res) => {
  const { id, user_id, booking_type_id, time_start, time_type, hour_time } =
    req.body;

  await booking
    .findOne({
      where: {
        id: id,
        user_id: user_id,
        deleted_date: null,
      },
    })
    .then((booking) => {
      if (booking == null) {
        res.status(404).json({
          ErrorMessage: "Booking is not exist",
        });
        return;
      } else {
        if (
          booking.stime_start <= new Date().setHours(new Date().GetDate + 0.5)
        ) {
          res.status(400).json({
            ErrorMessage: "Can't delete after 30 minutes",
          });
          return;
        }
      }
    });

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

  // Check duplicate booking
  if ((await GetBookingCount(user_id, booking_type_id, time_start, id)) != 0) {
    res.status(400).json({
      ErrorMessage: "You already booking",
    });
    return;
  }

  CheckCase(booking_type_id, user_id, time_start, hour_time);
  console.log(time_start);
  booking
    .update(
      {
        booking_type_id: booking_type_id,
        time_start: new Date(time_start),
        user_id: user_id,
        time_type: time_type,
        hour_time: hour_time,
      },
      {
        where: {
          id: id,
        },
      }
    )
    .then(async () => {
      return await booking.findOne({ where: { id: id } })
    })
    .then((booking) => res.status(200).send(booking))
    .catch((err) => {
      console.log(err);
      res.status(503).json({
        ErrorMessage: "Save failed",
      });
      return;
    });
};

async function GetBookingCount(
  user_id,
  booking_type_id,
  time_start = null,
  id = null
) {
  var currentTime = time_start == null ? new Date() : new Date(time_start);
  console.log(currentTime);
  let where = {
    booking_type_id: booking_type_id,
    deleted_date: null,
    time_start: {
      [Op.lt]: currentTime,
    },
    [Op.or]: [
      {
        time_type: timeType.HOURLY,
        time_start: {
          [Op.gt]: GetDate(
            timeType.HOURLY,
            time_start,
            parseInt(Sequelize.col("hour_time"))
          ),
        },
      },
      {
        time_type: timeType.DAILY,
        time_start: {
          [Op.gt]: GetDate(timeType.DAILY, time_start),
        },
      },
      {
        time_type: timeType.WEEKLY,
        time_start: {
          [Op.gt]: GetDate(timeType.WEEKLY, time_start),
        },
      },
      {
        time_type: timeType.MONTHLY,
        time_start: {
          [Op.gt]: GetDate(timeType.MONTHLY, time_start),
        },
      },
    ],
  };
  if (user_id != 0) where["user_id"] = user_id;
  if (id != 0) where["id"] = { [Op.ne]: user_id };
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

function GetDate(time_type, date, hour_time = 0) {
  hour_time = hour_time == null ? 0 : hour_time;
  let currentTime = date == null ? new Date() : new Date(date);
  switch (time_type) {
    case timeType.HOURLY:
      return new Date(currentTime.setHours(currentTime.getHours() - 1));
    case timeType.DAILY:
      return new Date(currentTime.setDate(currentTime.getDate() - 1));
    case timeType.WEEKLY:
      return new Date(currentTime.setDate(currentTime.getDate() - 7));
    case timeType.MONTHLY:
      return new Date(currentTime.setMonth(currentTime.getMonth() - 1));
  }
}

module.exports.deleteBooking = async (req, res) => {
  booking
    .findOne({
      where: {
        id: req.params.id,
        deleted_date: null,
      },
    })
    .then(async (booking) => {
      if (booking == null) {
        res.status(404).json({
          ErrorMessage: "Booking is not exist or deleted",
        });
        return;
      }
      if (
        booking.stime_start <= new Date().setHours(new Date().GetDate + 0.5)
      ) {
        res.status(400).json({
          ErrorMessage: "Can't delete after 30 minutes",
        });
        return;
      } else {
        booking.deleted_date = new Date();
        await booking.save();
        res.status(200).json({
          ErrorMessage: "Cancel success",
        });
        return;
      }
    });
};

async function CheckCase(
  booking_type_id,
  user_id,
  time_start,
  hour_time,
  id = 0
) {
  switch (booking_type_id) {
    case bookingType.PHONE_BOOTH:
      // Check booking more than 3 hour when booking Phone booth
      var hour = 0;
      let where = {
        user_id: user_id,
        booking_type_id: booking_type_id,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("time_start")),
            "=",
            new Date(time_start).toISOString().substr(0, 10)
          ),
        ],
      };
      if (id != 0) where["id"] = { [Op.ne]: user_id };
      await booking
        .findAll({
          where,
        })
        .then((booking) => (hour += booking.hour_time));
      if (hour + hour_time >= 3) {
        res.status(400).json({
          ErrorMessage: "Your hour booking meeting greater than 3",
        });
        return;
      }
      break;
    case bookingType.PARKING:
      let whereParking = {
        user_id: user_id,
        booking_type_id: booking_type_id,
        deleted_date: null,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("time_start")),
            ">=",
            new Date(time_start).toISOString().substr(0, 10)
          ),
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("time_start")),
            "=",
            new Date(time_start).toISOString().substr(0, 10)
          ),
        ],
      };
      if (id != 0) where["id"] = { [Op.ne]: user_id };
      // Booked host-desk before book parking
      booking.count({ whereParking }).then((count) => {
        if (count == 0) {
          res.status(400).json({
            ErrorMessage: "You must booking host desk first",
          });
          return;
        }
      });
      break;
  }
}
module.exports.getBooking = async (req, res) => {
  await booking
    .findAll({
      where: {
        deleted_date: null,
      },
    })
    .then((booking) => {
      res.status(200).send(booking);
      return;
    });
};

module.exports.getBookingById = async (req, res) => {
  await booking
    .findAll({
      where: {
        id: req.params.id,
        deleted_date: null,
      },
    })
    .then((booking) => {
      if (!booking) {
        res.status(400).json({
          ErrorMessage: "Booking is not exist",
        });
        return;
      } else {
        res.status(200).send(booking);
        return;
      }
    });
};

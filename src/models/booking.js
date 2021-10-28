module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define("booking", {
    booking_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    time_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    time_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hour_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    deleted_date: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  });
  return Booking;
};

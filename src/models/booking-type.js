
module.exports = (sequelize, DataTypes) =>{
    const BookingType = sequelize.define("booking_type",{
        name:{
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity:{
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
    return BookingType;
};
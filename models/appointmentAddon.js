const AppointmentAddon = sequelize.define('AppointmentAddon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  appointmentId: { type: DataTypes.INTEGER, allowNull: false },
  addonId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: false,
  tableName: 'appointment_addons',
});

export default AppointmentAddon
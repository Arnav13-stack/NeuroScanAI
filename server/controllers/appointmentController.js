const Appointment = require("../models/Appointment");
const User = require("../models/User");

const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      patientName,
      patientAge,
      department,
      doctorName,
      appointmentType,
      date,
      time,
    } = req.body;

    const appointment = new Appointment({
      patientId,
      doctorId,
      patientName,
      patientAge,
      department,
      doctorName,
      appointmentType,
      date,
      time,
      status: "pending",
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment created", appointment });
  } catch (err) {
    console.error("❌ Appointment error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("-password -__v")
      .lean();

    const formattedDoctors = doctors.map((doctor) => ({
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      department: doctor.department || "",
      bio: doctor.bio || "",
      image: doctor.image || "",
      age: doctor.age || 0,
      experience: doctor.experience || "",
    }));

    res.json(formattedDoctors);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAppointmentsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;

    const filter = { doctorId };
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppointmentsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name email _id")
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching appointments" });
  }
};

const acceptAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "accepted" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rejectAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "rejected" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createAppointment,
  getAllDoctors,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  acceptAppointment,
  rejectAppointment,
};

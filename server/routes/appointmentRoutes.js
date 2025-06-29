const express = require("express");
const {
  createAppointment,
  getAllDoctors,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  acceptAppointment,
  rejectAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.get("/doctors", getAllDoctors);
router.post("/book", createAppointment);
router.get("/doctor/:doctorId", getAppointmentsForDoctor);
router.get("/by-patient/:patientId", getAppointmentsForPatient);
router.put("/accept/:appointmentId", acceptAppointment);
router.put("/reject/:appointmentId", rejectAppointment);

module.exports = router;

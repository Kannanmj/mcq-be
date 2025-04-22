const express = require("express");
const router = express.Router();
const { trackVisit, getVisits } = require("../controllers/visitors");

router.post("/track", trackVisit);
router.get("/", getVisits);

module.exports = router;

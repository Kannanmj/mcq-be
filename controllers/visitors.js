const Visit = require("../model/visitors");

async function trackVisit(req, res) {
  try {
    // Check if the 'visited' cookie is present
    const hasVisited = req.cookies?.visited;

    // Find or create the document
    let visitDoc = await Visit.findOne();

    if (!visitDoc) {
      visitDoc = await Visit.create({
        allVisits: 1,
        uniqueVisits: hasVisited ? 0 : 1,
      });
    } else {
      visitDoc.allVisits += 1;
      if (!hasVisited) {
        visitDoc.uniqueVisits += 1;
      }
      await visitDoc.save();
    }

    // Set a 'visited' cookie if not present
    if (!hasVisited) {
      res.cookie("visited", "true", {
        httpOnly: true,
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        sameSite: "Lax",
      });
    }

    res.status(200).json({
      success: true,
      message: "Visit tracked successfully.",
      data: {
        allVisits: visitDoc.allVisits,
        uniqueVisits: visitDoc.uniqueVisits,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while tracking visit.",
      error: err.message,
    });
  }
}

async function getVisits(req, res) {
  try {
    const visitDoc = await Visit.findOne();

    if (!visitDoc) {
      return res.status(404).json({
        success: false,
        message: "No visit record found.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        allVisits: visitDoc.allVisits,
        uniqueVisits: visitDoc.uniqueVisits,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch visit counts.",
      error: err.message,
    });
  }
}

module.exports = { trackVisit, getVisits };

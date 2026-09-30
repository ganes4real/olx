const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Item = require('../models/Item');

// POST /api/reports - Create new report for an item
router.post('/', async (req, res) => {
  try {
    const { itemId, reporterId, reporterName, reporterEmail, reason, description } = req.body;

    if (!itemId || !reason) {
      return res.status(400).json({ success: false, message: 'Item ID and reason are required' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const report = new Report({
      itemId: item._id,
      itemTitle: item.title,
      sellerId: item.userId,
      sellerName: item.sellerName,
      reporterId: reporterId || null,
      reporterName: reporterName || 'Anonymous User',
      reporterEmail: reporterEmail || '',
      reason,
      description: description || ''
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our safety team will review it shortly.',
      reportId: report._id
    });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ success: false, message: 'Server error submitting report' });
  }
});

// GET /api/reports - List all reports (admin)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('itemId')
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ success: false, message: 'Error retrieving reports' });
  }
});

// PUT /api/reports/:id/status - Update report status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    await report.save();

    res.json({ success: true, message: `Report marked as ${status}`, report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating report' });
  }
});

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, message: 'Report removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting report' });
  }
});

module.exports = router;

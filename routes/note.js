import express from "express";
import User from "../models/user.js";
import Note from "../models/note.js";
import checkAuth from "../middlewares/auth.js";

const router = express.Router();

// Create a new note
router.post("/new", checkAuth, async (req, res) => {
  if (!req.body || !req.body.title || !req.body.content) {
    return res
      .status(400)
      .json({ msg: "Please provide all the credentials", status: 400 });
  }
  const { title, content, tags } = req.body;
  try {
    const note = new Note({
      title,
      content,
      tags,
      owner: req.user_id,
    });
    const savedNote = await note.save();
    res.status(200).json({
      notes: savedNote,
      msg: "All notes have been successfully retrieved",
      status: 200,
    });
  } catch (err) {
    res.status(400).json({ msg: err.message, status: 400 });
  }
});

// Get all notes for logged-in user
router.get("/", checkAuth, async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user_id }).sort({
      updatedAt: -1,
    });
    res.json({
      notes,
      msg: "All notes have been successfully retrieved",
      status: 200,
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

// Get single note by ID
router.get("/:id", checkAuth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user_id });
    if (!note) {
      return res.status(404).json({ msg: "Note not found", status: 404 });
    }
    res.json({ note, msg: "Note has been successfully retrieved", status: 200 });
  } catch (err) {
    res.status(500).json({ msg: err.message, status: 500 });
  }
});

// Update a note
router.post("/:id", checkAuth, async (req, res) => {
  if (!req.body || !req.body.title || !req.body.content) {
    return res
      .status(400)
      .json({ msg: "Please provide all the credentials", status: 400 });
  }
  const { title, content, tags } = req.body;
  try {
    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user_id },
      { title, content, tags },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ msg: "Note not found", status: 404 });
    }
    res.json({
      updated,
      msg: "The note has been successfully updated",
      status: 200,
    });
  } catch (err) {
    res.status(400).json({ msg: err.message, status: 400 });
  }
});

// Delete a note
// DELETE /api/notes/:id
router.post("/:id/delete", checkAuth, async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user_id,
    });
    if (!deleted)
      return res.status(404).json({ msg: "Note not found", status: 404 });
    res.json({ msg: "Note successfully deleted", status: 200 });
  } catch (err) {
    res.status(500).json({ msg: err.message, staus: 500 });
  }
});

export default router;

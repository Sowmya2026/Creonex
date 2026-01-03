const firestoreService = require('../services/firestore.service');

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
exports.createNote = async (req, res) => {
    try {
        const { title, content, priority } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const note = await firestoreService.create('notes', {
            title: title.trim(),
            content: content || '',
            priority: priority || 'normal',
            status: 'pending',
            userId: req.user?.id || 'admin'
        });

        res.status(201).json({
            success: true,
            message: 'Note created successfully',
            data: note
        });
    } catch (error) {
        console.error('Create Note Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get all notes
 * @route   GET /api/notes
 * @access  Private
 */
exports.getNotes = async (req, res) => {
    try {
        const notes = await firestoreService.getAll('notes', {
            orderBy: ['createdAt', 'desc']
        });

        res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        console.error('Get Notes Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get single note
 * @route   GET /api/notes/:id
 * @access  Private
 */
exports.getNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await firestoreService.getById('notes', id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            data: note
        });
    } catch (error) {
        console.error('Get Note Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Update note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, priority } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (content !== undefined) updateData.content = content;
        if (priority !== undefined) updateData.priority = priority;

        const note = await firestoreService.update('notes', id, updateData);

        res.status(200).json({
            success: true,
            message: 'Note updated successfully',
            data: note
        });
    } catch (error) {
        console.error('Update Note Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Update note status (partial update)
 * @route   PATCH /api/notes/:id
 * @access  Private
 */
exports.updateNoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const note = await firestoreService.update('notes', id, { status });

        res.status(200).json({
            success: true,
            message: 'Note status updated',
            data: note
        });
    } catch (error) {
        console.error('Update Note Status Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Delete note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        await firestoreService.delete('notes', id);

        res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error('Delete Note Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    const { content, receiver } = req.body;

    // Check if the necessary fields are present
    if (!content || !receiver) {
        return res.status(400).json({ msg: 'Message content and receiver are required' });
    }

    try {
        // Create a new message
        const newMessage = new Message({
            sender: req.user.id, // This is set by authMiddleware
            receiver, // This should be provided in the request body
            content
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

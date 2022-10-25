const router = require("express").Router();
const { User, Thought } = require("../../models");
// api/thoughts
//  get all thoughts

router.get("/", async (req, res) => {
    try {
        const dbThoughtData = await Thought.find().sort({ createdAt: -1 });
        res.status(200).json(dbThoughtData);
    } catch (err) {
        console.log(err)
        res.status(404).json(err);
    }
});

router.post("/", async (req, res) => {
    try {
        const dbThoughtData = await Thought.create(req.body);
        const dbUserData = await User.findOneAndUpdate(
            {
                _id: req.body.userId,
            },
            { $push: { thoughts: dbThoughtData._id } },
            { new: true }
        );
        if (!dbUserData) {
            return res.status(404).json({ message: "thought created but no user with this ID." })
        }
        res.status(200).json({ ...dbThoughtData, message: 'thought successfully created' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// //  api/Thoughts/:userId
router.get("/:thoughtId", async (req, res) => {
    try {
        const dbThoughtData = await Thought.findOne({ _id: req.params.thoughtId })
        if (!dbThoughtData) {
            return res.status(404).json({ message: "No user with this ID." })
        }
        res.status(200).json(dbThoughtData);

    } catch (err) {
        res.status(500).json(err);
    }
});

router.put("/:thoughtId", async (req, res) => {
    try {
        const dbThoughtData = await Thought.findOneAndUpdate({ _id: req.params.thoughtId }, { $set: req.body }, { runValidators: true, new: true });
        if (!dbThoughtData) {
            return res.status(404).json({ message: "No user with this Id." })
        }
        res.status(200).json(dbThoughtData);

    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete("/:thoughtId", async (req, res) => {
    try {
        const dbThoughtData = await Thought.findOneAndRemove({ _id: req.params.thoughtId });

        if (!dbThoughtData) {

            return res.status(404).json({ message: "No thought with this Id." })
        }

        const dbUserData = await User.findOneAndUpdate(
            {
                thoughts: req.params.thoughtId,
            },
            { $pull: { thoughts: req.params.thoughtId } },
            { new: true }

        );
        if (!dbUserData) {
            return res.status(404).json({ message: "No user with this Id." })
        }
        res.status(200).json("Thought successfully deleted");

        await Thought.deleteMany({ _id: { $in: dbThoughtData.thoughts } });

        res.status(200).json({ message: "User and associated thoughts deleted" })

    } catch (err) {
        res.status(500).json(err);
    }
});

router.post("/:thoughtId/reactions/", async (req, res) => {
    try {
        const dbThoughtData = await Thought.findOneAndUpdate({ _id: req.params.thoughtId }, { $addToSet: { reactions: req.body } }, { runValidators: true, new: true });
        if (!dbThoughtData) {

            return res.status(404).json({ message: "No thought with this Id." })
        }
        res.status(200).json(dbThoughtData);

    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete("/:thoughtId/reactions/:reactionId", async (req, res) => {
    try {
        const dbThoughtData = await Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { runValidators: true, new: true });
        if (!dbThoughtData) {

            return res.status(404).json({ message: "No thought with this Id." })
        }
        console.log(dbThoughtData)
        res.status(200).json(dbThoughtData);

    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});


module.exports = router;
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		participants: [{ type: String, ref: "User" }],
		lastMessage: {
			text: String,
			sender: { type: String, ref: "User" },
			seen: {
				type: Boolean,
				default: false,
			},
		},
	},
	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;

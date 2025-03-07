const mongoose = require("../Configration/dbConfig");

const ticketSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["Open", "In_Progress", "Closed"], default: "open", required: true  },
  },
  {
    timestamps: true, 
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;

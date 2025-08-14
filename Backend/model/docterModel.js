        const mongoose = require("mongoose");

        const docterSchema = mongoose.Schema({
        name: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
        },
        password: {
            type: String,
            require: true,
        },
        onDuty: {
            type: Boolean,
            default: false,
        },
        });

        const DocterModel = mongoose.model("Doctor", docterSchema);

        module.exports = DocterModel;

const mongoose = require("./server.js");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        resetToken: String,
        resetTokenExpiration: Date,
    },
    {
        methods: {
            async addUser(array) {
                const newItem = new User(array);
                await newItem.save()
                    .then(res => {
                        console.log("Created:", res);
                    })
                    .catch(err => console.log(err));
            },

            async findOne(email) {
                const result = await mongoose.model("User").findOne({ email: email })
                return result;
            },

            async findByToken(token) {
                const result = await mongoose.model("User").findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
                return result;
            },

            async findByTokenAndId(token, userId) {
                const result = await mongoose.model("User").findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
                return result;
            },

            async findById(id) {
                const result = await mongoose.model("User").findById({ _id: id });
                return result;
            },

            async findByIdAndUpdate(id, array) {
                await mongoose.model("User").findByIdAndUpdate({ _id: id }, array)
                    .then(res => {
                        console.log("Updated:", res);
                    })
                    .catch(err => console.log(err));
            },

            async findByIdAndDelete(id) {
                await mongoose.model("User").findByIdAndDelete({ _id: id }).exec()
                    .then(res => {
                        console.log("Deleted:", res);
                    })
                    .catch(err => console.log(err));
            },

            async findAll() {
                const result = await mongoose.model("User").find({})
                return result;
            },

        }
    }
);

const User = mongoose.model('User', userSchema);
const users = new User();

module.exports = users;
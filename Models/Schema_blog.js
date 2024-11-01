const mongoose = require("./server.js");
const { Schema } = mongoose;

const blogSchema = new Schema(
    {
        title: String,
        imageUrl: String,
        body: String,
        author: String,
        categories: Array,
        date: {
            type: Date,
            default: Date.now,
        }
    },
    {
        methods: {
            async addItem(array) {
                const newItem = new Blog(array);
                await newItem.save()
                    .then(res => {
                        console.log("Created:", res);
                    })
                    .catch(err => console.log(err));
            },

            async findById(id) {
                const result = await mongoose.model("Blog").findById({ _id: id });
                return result;
            },

            async findByIdAndUpdate(id, array) {
                await mongoose.model("Blog").findByIdAndUpdate({ _id: id }, array)
                    .then(res => {
                        console.log("Updated:", res);
                    })
                    .catch(err => console.log(err));
            },

            async findByIdAndDelete(id) {
                await mongoose.model("Blog").findByIdAndDelete({ _id: id }).exec()
                    .then(res => {
                        console.log("Deleted:", res);
                    })
                    .catch(err => console.log(err));
            },

            async findAll() {
                const result = await mongoose.model("Blog").find({})
                return result;
            }
        }
    }
);

const Blog = mongoose.model('Blog', blogSchema);
const blogs = new Blog();

module.exports = blogs;
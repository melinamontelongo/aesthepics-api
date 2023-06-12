const express = require("express");
const app = express();
const cors = require('cors');

require("dotenv").config();
require("./config/db");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");

app.use("/posts", postsRouter);

app.use("/users", usersRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
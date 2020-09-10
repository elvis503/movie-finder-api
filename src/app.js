const express = require("express");
const cors = require("cors");
require("./db/mongoose.js")
const userRouter = require("./routers/user.js")

const app = express();
const port = process.env.PORT;

app.use(express.json())
app.use(cors());
app.use(userRouter);

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})

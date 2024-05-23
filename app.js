const express = require("express");
const app = express();
const session = require("express-session");
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: true },
  })
);

app.use(require("./routes"));

app.listen(port, () => {
  console.log(`listening to port${port}`);
});

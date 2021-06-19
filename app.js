const { request } = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./src/database");

const app = express();
app.use(bodyParser.json());

app.listen(3000, () => {
  console.log("Server is listening at http://localhost:3000");
});

app.get("/", (req, res) => {
  res.send("Homepage of restaurant manager");
});

//Add products
app.post("/addProduct", (req, res) => {
  const { item_name, item_price, category, price_currency } = req.body;

  let sql = "INSERT INTO menu SET ?";
  db.query(
    sql,
    { item_name, item_price, category, price_currency },
    (err, result) => {
      if (err) throw err;
      res.send("Product added to menu");
    }
  );
});

//Menu with all products
app.get("/products", (req, res) => {
  let sql = "SELECT * FROM menu";

  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    if (result.length < 12) {
      res.send("Add at least 12 products!");
      console.log("List of products: ", result);
    } else {
      res.send("List of products");
    }
  });
});

//Editing menu
app.patch("/editMenu", (req, res) => {
  const { item_id, item_name, item_price, category, price_currency } = req.body;

  let sql1 = "UPDATE menu SET item_name = ?, item_price = ?, category = ?, price_currency = ? WHERE item_id = ?";
  db.query(
    sql1,{ item_id, item_name, item_price, category, price_currency },
    (err, result) => {
      if (err) throw err;
      res.send("Product update to menu");
    }
  );
});

app.post("/order", (req,res) =>{
  const {item_name, item_price, price_currency} = req.body;

  let sql = "INSERT INTO order SET ?";


})
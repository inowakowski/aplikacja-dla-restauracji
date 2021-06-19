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

//Endpoint - adding products to menu
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

//Endpoint - List of products
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

//Edycja Menu - TODO

// Endpoint - Adding orders
app.post("/addOrder", (req, res) => {
  const { status_name, item_id, table_nr } = req.body;

  let sql = "INSERT INTO orders SET ?";
  db.query(
    sql,
    {
      status_name,
      item_id: JSON.stringify({ data: item_id }),
      table_nr,
      order_time: new Date(),
    },
    (err, result) => {
      if (err) throw err;
      res.send("Order accepted");
    }
  );
});

// Endpoint - Change order status
app.put("/changeOrderStatus", (req, res) => {
  const { new_status_name, order_id } = req.body;

  let sqlUpdate = `UPDATE orders SET status_name = "${new_status_name}", ? WHERE order_id = ${order_id}`;

  db.query(
    sqlUpdate,
    {
      delivered_time: new Date(),
    },
    (err, result) => {
      if (err) throw err;
      console.log("result ", result);
      res.send("Changed order status");
    }
  );
});

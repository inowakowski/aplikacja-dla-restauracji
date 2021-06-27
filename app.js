const { request } = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./src/database");
const { json } = require("body-parser");

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
    // console.log(result);
    if (result.length < 12) {
      res.send("Add at least 12 products!");
      console.log("List of products: ", result);
    } else {
      res.send(result);
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
      item_id: JSON.stringify(item_id),
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

// const apiNbp = `http://api.nbp.pl/api/exchangerates/rates/a/${code}/?format=json`

// Endpoint - Compose bills
app.get("/bill", (req, res) => {
  const { order_id } = req.body;
  
  let sqlItem = `SELECT item_id, order_time, delivered_time  FROM orders WHERE order_id = ${order_id}`;
  console.log(" ");
  db.query(sqlItem, (err, result) => {
    if (err) throw err;
    const items_ids = JSON.parse(result[0]["item_id"]);
    for(const items of items_ids ){
      let sqlBill = `SELECT item_name, item_price, price_currency FROM menu WHERE item_id = ?`;
      db.query(sqlBill, items,
        (err, result) => {
          if (err) throw err;
          const i_name = result[0]["item_name"];
          const i_price = JSON.parse(result[0]["item_price"]);
          const p_currency = result[0]["price_currency"];
          // console.log(result);
          console.log(i_name, " ", i_price, p_currency);

          return i_price;
        })
        // let sum =+ i_price;
        // console.log(i_price);
    };
    const orderT = result[0]["order_time"];
    const deliceredT = result[0]["delivered_time"];
    var timeHours = deliceredT.getHours() - orderT.getHours();
    var timeMinutes = deliceredT.getMinutes() - orderT.getMinutes();
    var timeSeconds = deliceredT.getSeconds() - orderT.getSeconds();
    var od = 1000 * 60 * 60 * 24;
    console.log("Czas dostarczenia:", timeHours, "h", timeMinutes, "min", timeSeconds, "sec") ;
    res.send("Bill is generate");
  });
});
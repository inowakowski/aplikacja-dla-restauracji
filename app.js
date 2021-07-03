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
      res.json(result);
    }
  });
});

//Endpoint - Edit menu
app.put("/changeMenu", (req, res) => {
  const { item_name, item_price, category, item_id } = req.body;

  let sqlUpdate = `UPDATE menu SET item_name = "${item_name}", item_price = "${item_price}", category = "${category}" WHERE item_id = ${item_id}`;

  db.query(
    sqlUpdate,
    (err, result) => {
      if (err) throw err;
      console.log("result ", result);
      res.send("Menu has changed");
    }
  );
});

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


// Endpoint - Compose bills
app.get("/bill", (req, res) => {
  const { order_id } = req.body;
  
  let sqlItem = `SELECT item_id, order_time, delivered_time  FROM orders WHERE order_id = ${order_id}`;
  console.log(" ");
  db.query(sqlItem, 
    (err, result) => {
      if (err) throw err;
      const orderT = result[0]["order_time"];
      const deliveredT = result[0]["delivered_time"];
      const items_ids = JSON.parse(result[0]["item_id"]);
      var timeHours = deliveredT.getHours() - orderT.getHours();
      var timeMinutes = Math.abs(deliveredT.getMinutes() - orderT.getMinutes());
      var timeSeconds = Math.abs(deliveredT.getSeconds() - orderT.getSeconds());
      var time = Math.abs(deliveredT - orderT);
      var count = 0;
      let sqlBill = `SELECT item_name, item_price, price_currency FROM menu WHERE item_id = ?`;
      let sqlBillInsert = `INSERT INTO bill SET ?`;
      for(const items of items_ids ){
        if (items_ids.length -1 !== items_ids.indexOf(items)){
          db.query(sqlBill, items,
            (err, result2) => {
              if (err) throw err;
              const i_name = result2[0]["item_name"];
              const i_price = JSON.parse(result2[0]["item_price"]);
              const p_currency = result2[0]["price_currency"];
              console.log(i_name, " ",i_price, p_currency)
              count = count + i_price;
              sum = count.toFixed(2);
            });
          }
          else{
          db.query(sqlBill, items,
            (err, result2) => {
              if (err) throw err;
              const i_name = result2[0]["item_name"];
              const p_currency = result2[0]["price_currency"];
              const i_price = JSON.parse(result2[0]["item_price"]);
              console.log(i_name, " ",i_price, p_currency);
              count = count + i_price;
              sum = parseFloat(count.toFixed(2));
              console.log("-----------------------\nSuma: ",sum, p_currency);
              db.query(sqlBillInsert,
                {
                  items_ids: JSON.stringify(items_ids),
                  cost_pln: sum,
                  time_delivery: timeHours+":"+timeMinutes+":"+timeSeconds,
                  date: new Date(),
                },
                )
            },
          );
        }
    };

    console.log("Devidery time:", timeHours,"h ",timeMinutes,"min ",timeSeconds,"sec\n") ;
    res.send("Bill is generate");
  });
});

//Endpoint - Currency
app.get("/currency", (req, res) => {
  const {id_bill, currency} = req.body;

  sqlSelect = `SELECT cost_pln FROM bill WHERE id_bill = ${id_bill}`;
  sqlInsert = `INSERT INTO currency SET ?`
  var url = `http://api.nbp.pl/api/exchangerates/rates/a/${currency}/?format=json`;
  var request = require("request")
  
  db.query(sqlSelect, 
    (err, result) => {
      if (err) throw err;
      const pln = result[0]["cost_pln"];
      request({
        url: url,
        json: true
        }, function (error, response, body) {
    
          if (!error && response.statusCode === 200) {
            const c_value = body["rates"][0]["mid"];
            var exchange = pln/c_value;
            res.json(body);
            db.query(sqlInsert,
              {
                bill_id: id_bill,
                currency_value: parseFloat(exchange.toFixed(2)),
                currency: currency,
              },
              );
          }
        }
      )
    },)

})
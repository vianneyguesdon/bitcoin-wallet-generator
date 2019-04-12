const express = require("express");
const request = require ("request");
const bodyParser = require ("body-parser");
const exphbs = require ("express-handlebars");
const bitcore = require ("bitcore-lib");
var QRCode = require('qrcode');


const port = process.env.port || 3000;
const app = express(); 

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get("/", function(req, res) {

  // Api Request
  request ({
    url: "https://blockchain.info/stats?format=json",
    json: true
  }, function(error, response, body){
    // console.log("error:", error)
    // console.log("response:", response)
    // console.log("body:", body)
    // console.log("Bitcoin Price is :", body.market_price_usd)
    btcPrice = body.market_price_usd;
    btcTotal = body.totalbc;
    btcVolume = body.trade_volume_btc;
    btcMinedPerDay = body.miners_revenue_btc;
    // console.log(body)

    res.render("home", {
      btcPrice,
      btcTotal,
      btcVolume,
      btcMinedPerDay
    });
  })
});

app.post("/wallet", function(req, res){

  // On récupère L'input dans une variable
  const brainSrc = req.body.brainSrc;
  console.log("brainSrc: ", brainSrc)

  // On convertit chaque lettre de la source en Hexadecimal ASCII
  const input = Buffer.from(brainSrc);
  console.log("input after Buffer: ", input)

  // Ici l'entrée input convertie en chiffre est cryptée par l'algorythme sha256
  const hash = bitcore.crypto.Hash.sha256(input);
  console.log("hash: ", hash)

  // On applique BN à notre hash
  const bigNumbers = bitcore.crypto.BN.fromBuffer(hash);
  console.log("bigNumbers: ", bigNumbers)

  // On crée une Private Key (to Wallet Import Format) et une address
  const privateKey = new bitcore.PrivateKey(bigNumbers).toWIF();
  const address = new bitcore.PrivateKey(bigNumbers).toAddress();

  //On stringify from Buffer to Address
  const strAddress = address.toString('utf8')

  // Ici on génère le QR code. Comme c'est un callback on place le render dedans
  QRCode.toDataURL(strAddress, function (err, url) {
    res.render("wallet", {
      privateKey,
      address,
      brainSrc,
      url : url
    })
  })
})

app.listen(port, function() {
  console.log("server started on port:", port)
})
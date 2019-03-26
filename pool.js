var mysql = require('mysql')

var pool = mysql.createPool({
    host: '127.0.0.1',
    port:'3306',
    user:'root',
    password:'Aptx4869',
    database:'restaurant',
    connectionLimit:'20'

})

module.exports=pool
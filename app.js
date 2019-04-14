var express = require('express')

var path=require('path')
var favicon=require('express-favicon')





var app=express()

//
// secret: 'AAA', //配置加密字符串，他会在原有加密基础上和这个字符串拼接起来再次加密，目的增加安全性
//     resave: true,
//     saveUninitialized: true //无论你是否使用session，都默认给你分配一把钥匙


var userRouter= require('./routes/user')
var restaurantRouter=require('./routes/restaurant')
var session=require('express-session')
var FileStore=require('session-file-store')(session)
var idKey='skey'
app.use(session({
    name:idKey,
    secret:'fendicloser',
    //store:new FileStore(),
    saveUninitialized:false,
    resave:true,//是否自动保存未自动保存初始化的对话，
    cookie:{
        maxAge:30*60*1000
    }
}))

app.listen(8081)

app.use(express.static('public/views'))
app.use(express.static('public'))
app.use(express.static('public/scripts'))
app.use(express.static('public/images'))
app.use(express.static('static/bossRestaurantImage'))








app.use('/restaurant',restaurantRouter)
app.use('/user',userRouter)
///Users/fendicloser/tedu/code/restaurantProject/restaurant/public/ico
app.use(favicon('public/ico/icon.ico'));


app.get('/',function (req,res) {
    res.redirect('http://localhost:8081/restaurant_main.html')
})







var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8181 });

function bordcastData(data){
    wss.clients.forEach(ws=>{
        ws.send(data)
    })
}
wss.on('connection', function (ws) {
    ws.on('message', function (data) {
        // Broadcast to everyone else.
        console.log(data);
        bordcastData(data)
    });
});


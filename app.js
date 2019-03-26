var express = require('express')
var userRouter= require('./routes/user')
var restaurantRouter=require('./routes/restaurant')


var app=express()

app.listen(8080)

app.use(express.static('public/views'))
app.use(express.static('public'))
app.use(express.static('public/scripts'))
app.use(express.static('public/images'))

app.use('/restaurant',restaurantRouter)
app.use('/user',userRouter)




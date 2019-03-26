var express=require('express')

var router = express.Router()

var bodyParser=require('body-parser')
var pool=require('../pool')
var querystring=require('querystring')
router.use(bodyParser.urlencoded({extended:false}))


//注册，登陆，
//注销，修改密码
router.post('/login',function(req,res){
    var num = 400
    var obj = req.body
    for(var index in req.body){
        num=num+1
        if(!req.body[index]){
            res.send({code:num,msg:index+' is required'})
            return
        }
    }
    pool.query('select * from user where userNickName=?',[obj.userNickName],function(err,result){
        if(!err){
            //查找返回的是对象
            if(result[0]==undefined){
                res.send({code:300,msg:'username incorrect'})
            }
            else{
                pool.query('select * from user where userID=?',[result[0].userID],function(err,result){
                    if(!err){
                        if(result[0].userPassowrd==obj.userPassowrd){
                            res.send({code:200,msg:'login success'})

                        }
                        else {
                            res.send({code:301,msg:'password incorrected'})
                        }
                    }
                    else throw err
                })
            }
        }
        else throw err
    })
})

//用户修改密码

router.post('/changPW',function(req,res){
    var num=400
    var obj=req.body
    for(var index in obj){
        num=num+1
        if(!obj[index]){
            res.send({code:num,msg:index+' is required'})
            return
        }
    }
    var NickName = req.body.userNickName
    var oldpwd=req.body.userPassowrd
    var newpwd=req.body.newpwd

    pool.query('select * from user where userNickName=?',[NickName],function(err,result){
        console.log(result)
        if(!err){
            if(result[0]==undefined){
                res.send('找不到对象')
            }
            else{
                if(result[0].userPassowrd!=oldpwd){
                    res.send('密码不正确')
                }
                else{
                    if(oldpwd==newpwd){
                        res.send({code:302,msg:'新旧密码相同，修改无效'})
                    }
                    else{
                        pool.query('update user set userPassowrd=? where userNickName=?',[newpwd,NickName],function(err,result){
                            if(!err){
                                if(result.affectedRows>0){
                                    res.send({code:200,msg:'update success'})
                                }
                                else
                                    res.send({code:300,msg:'update failed'})
                            }else throw  err
                        })

                    }
                }

            }
        }
    })


    //res.send(req.body)

})

//用户注册
router.post('/registered',function(req,res){
    var num=400
    var obj=req.body
    for(var index in obj){
        num=num+1
        if(!obj[index]){
            res.send({code:num,msg:index+' is required'})
            return
        }
    }
    // var date=new Date()
    // obj.regtime=date.toDateString()
    pool.query('select * from user where userNickName=?',[obj.userNickName],function(err,result){
        if(!err){
            if(result[0]==undefined){
                pool.query('insert into user set ?',[obj],function(err,result){
                    if(!err){
                        res.send('插入成功')
                    }
                    else
                        res.send('插入失败')
                })
            }
            else
                res.send({code:300,msg:'用户名重复'})
        }
        else throw err
    })
})


//成为老板
router.post('/updateIdentify',function(req,res){
    var num=400
    var obj=req.body
    for(var index in obj){
        num=num+1
        if(!obj[index]){
            res.send({code:num,msg:index+' is required'})
            return
        }
    } pool.query('select * from user where userNickName=?',[obj.userNickName],function(err,result){
        if(!err){
            if(result[0]==undefined){
                res.send({code:301,msg:'用户名不正确'})
            }
            else
                if(result[0].userPassowrd!=req.body.userPassowrd){
                    res.send({code:301,msg:'密码不正确'})
                }
                else{
                    pool.query('update user set isBoss=?,identify=? where userNickName=? ',[1,req.body.identify,req.body.userNickName],function(err,result){
                      if(result.affectedRows>0){
                          res.send({code:200,msg:'修改成功'})
                      }
                       else {
                          res.send({code:302,msg:'修改失败'})
                      }
                    })
                }
        }
        else throw err
    })

})





module.exports=router
var express=require('express')
var path=require('path')
var sd=require('silly-datetime')
var fs=require('fs')


const formidable = require("formidable");

var router = express.Router()

var bodyParser=require('body-parser')
var pool=require('../pool')
var querystring=require('querystring')
router.use(bodyParser.urlencoded({extended:false}))



router.post('/addRestaurant',function(req,res){
    //res.send(req.body)
    // var num=400
    // var obj=req.body
    // for(var index in obj){
    //     num=num+1
    //     if(!obj[index]){
    //         res.send({code:num,msg:index+' is required'})
    //         return
    //     }
    // }

    var form = new formidable.IncomingForm();
    form.uploadDir='/Users/fendicloser/tedu/code/restaurantProject/restaurant/static/bossRestaurantImage'
    form.parse(req,function(err,fields,files){
        var num=400
        for(var index in fields){
            num=num+1
            if(!fields[index]){
                res.send({code:num, msg:index+' is required'})
                return
            }

        }
        if(files.picture.name==''){
            res.send({code:6,msg:'picture is required'})
            return
        }
        //使用第三方模块silly-datetime
        var t = sd.format(new Date(),'YYYYMMDDHHmmss');
        //生成随机数
        var ran = parseInt(Math.random() * 89 +100);
        if(err) throw err;
        if(files.picture.type=='image/jpeg'||files.picture.type=='image/png'){
            var oldName=files.picture.path
            var newName=t+'_'+ran+files.picture.type.replace('image/','.')

            if(fs.existsSync(oldName)){
                fs.renameSync(oldName,newName)
                //res.send('添加成功')
                pool.query('select * from user where userNickName=?',[fields.resBoss],function(err,result){
                    if(!err){
                        if(result[0]==undefined){

                            res.send({code:300,msg:'没有此用户'})
                        }
                        else{
                            console.log(fields)
                            pool.query('insert into restaurant set ?',[fields],function(err,result){
                                if(err){
                                    throw err
                                }
                                else{
                                    if(result.affectedRows>0){
                                        console.log(result)
                                        pool.query('update restaurant set picpath=? where resID=?',[newName,result.insertId],function(err,result){
                                            if(!err){
                                                res.send({code:200,msg:'添加成功'})
                                            }
                                            else {
                                                throw err
                                            }
                                        })

                                    }
                                    else
                                        res.send({code:301,msg:'添加失败'})
                                }

                            })
                            //res.send(fields)
                        }
                    }
                    else throw err
                })
            }
            else res.send('修改失败')
        }
        else{
            res.send('类型不对')
        }
        //把生成的文件复制到bossRestaurantImage中。
        if(fs.existsSync(__dirname+'/../'+newName)){
            console.log('存在')
            fs.copyFileSync(__dirname+'/../'+newName,__dirname+'/../static/bossRestaurantImage/'+newName)
            fs.unlinkSync(__dirname+'/../'+newName)
        }
        else{
            console.log('不存在')
        }

        //每次结束时，异步遍历文件夹，把文件加中没进行过改名的文件删除
        fs.readdir(form.uploadDir,function(err,result){
                if(err){
                    console.warn(err)
                }else{
                    //遍历读取到的文件列表
                    for(var index in result){
                        if(result[index].indexOf('upload')>-1){
                            fs.unlinkSync(form.uploadDir+'/'+result[index])
                        }
                    }
                }
        })
    });
})



module.exports=router
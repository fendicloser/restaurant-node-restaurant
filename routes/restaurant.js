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




//首页按照输入框内容查询数据库的ajax
router.get('/selectAll',function(req,res){
    //console.log(req.query)
    pool.query('select * from restaurant',[],function (err,result) {
        if(!err){
            //console.log(result)
            res.json(result)
        }
        else throw err
    })


})



router.post('/addRestaurant',function(req,res){
    var form=formidable.IncomingForm();
    form.uploadDir= '/Users/fendicloser/tedu/code/restaurantProject/restaurant/static/bossRestaurantImage/'
    form.keepExtensions = true//保留后
    form.multiples=true
    form.maxFieldsSize = 3 * 1024 * 1024//byte//最大可上传大小
    var files=[];
    //文件都将保存在files数组中
    form.on('file', function (filed,file) {
        files.push([filed,file]);
    })
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
        if(files.picture.length>=4){
            res.send('最多上传三张照片')
            return
        }
        // if(files.length>=4){
        //     res.send({code:7,msg:'最多允许上传3张照片'})
        //     return
        // }
        if(err){
            throw err
            return
        }
        //console.log(files.picture.length)
        var picturePath=''
        for(var i=0;i<files.picture.length;i++){
            var t = sd.format(new Date(),'MMDDHHmm');
            //生成随机数
            var ran = parseInt(Math.random() * 89 +100);
            if(err) throw err;
                var oldName=files.picture[i].path
                var newName=t+'_'+ran+files.picture[i].type.replace('image/','.')
                picturePath=picturePath+newName+'#'//每个图片的路径用'#'分割开
                if(fs.existsSync(oldName)){
                    fs.renameSync(oldName,newName)//重命名，会在static文件夹下生成新的图片文件
                }
        }
        //console.log(picturePath)
        if(picturePath.length!=0){
            pool.query('select * from user where userNickName=?',[fields.resBoss],function (err,result) {
                //先检查有没有这个用户
                if(!err){
                    //console.log(result[0])
                    if(result.length==0){
                        res.send('没有此用户')
                    }else{
                        pool.query('insert into restaurant set ?',[fields],function(err,result){
                            if(!err){
                                pool.query('update restaurant set picpath=? where resID=?',[picturePath,result.insertId],function(err,result){
                                    if(!err){
                                        res.send({code:200,msg:'添加成功'})
                                    }
                                    else {
                                        throw err
                                    }
                                })
                            }else throw err
                        })

                    }
                }else throw err
            })

        }
        //把生成的文件复制到bossRestaurantImage中。
        var pictureArr=picturePath.split('#')
        for(var j=0;j<pictureArr.length;j++){
            //console.log(pictureArr[j])
            if(pictureArr[j].length>=1&&fs.existsSync(__dirname+'/../'+pictureArr[j])){
                //console.log('存在')
                fs.copyFileSync(__dirname+'/../'+pictureArr[j],__dirname+'/../public/images/bossRestaurantImage/'+pictureArr[j])

                fs.unlinkSync(__dirname+'/../'+pictureArr[j])

            }
        }


    })

})

//    /restaurant/selectAll



router.get('/restaurant_detail',function (req,res) {
    pool.query('select * from restaurant where resID=?',[req.query.resID],function (err,result) {
        if(!err){
            res.send(result)
        }
        else throw err
    })
    //res.send(req.query)
    // pool.query('select * from restaurant where uid')
})

//res应该多加一列：评分人数
//user应该多加一列：collect
router.post('/restaurant_commit',function (req,res) {

    //console.log(req.body)
    var resID=req.body.resID;
    var commiter=req.body.commiter;
    var start=req.body.start
    var fileDir1,fileDir2
    if(req.body.canvas1!='no'){
        var img1Data = req.body.canvas1.replace(/^data:image\/\w+;base64,/, "");
        //准备第一个图的材料，路径/buffer
        var dataBuffer = Buffer.from(img1Data, 'base64');
        var t ='1_'+sd.format(new Date(),'MMDDHHmm');
        //生成随机数
        var ran = parseInt(Math.random() * 89 +100);
        fileDir1=__dirname+'/../public/images/customerRestaurantImage/'+resID+t+'_'+ran+'.jpeg'
        fs.writeFile(fileDir1,dataBuffer,function(err){
            if(err){
                throw err
            }
        })
    }else{
        fileDir1=''
    }
    if(req.body.canvas2!='no'){
        var img2Data = req.body.canvas2.replace(/^data:image\/\w+;base64,/, "");
        //准备第一个图的材料，路径/buffer
        var dataBuffer = Buffer.from(img2Data, 'base64');
        var t ='2_'+sd.format(new Date(),'MMDDHHmm');
        //生成随机数
        var ran = parseInt(Math.random() * 89 +100);
        fileDir2=__dirname+'/../public/images/customerRestaurantImage/'+resID+t+'_'+ran+'.jpeg'
        fs.writeFile(fileDir2,dataBuffer,function(err){
            if(err){
                throw err
            }
        })
    }else{
        fileDir2=''
    }

    var commitArr=[]//评论数组应该包括 评论人，所给分数，推荐，优点，缺点，如果有图片，存图片路径；


    res.json({'code':'200','text':'commit success'})
})


module.exports=router

























// router.post('/addRestaurant',function(req,res){
//     var form = new formidable.IncomingForm();
//     form.uploadDir= '/Users/fendicloser/tedu/code/restaurantProject/restaurant/public/images/bossRestaurantImage'
//     form.parse(req,function(err,fields,files){
//         var num=400
//         for(var index in fields){
//             num=num+1
//             if(!fields[index]){
//                 res.send({code:num, msg:index+' is required'})
//                 return
//             }
//
//         }
//         if(files.picture.name==''){
//             res.send({code:6,msg:'picture is required'})
//             return
//         }
//         //使用第三方模块silly-datetime
//         var t = sd.format(new Date(),'YYYYMMDDHHmmss');
//         //生成随机数
//         var ran = parseInt(Math.random() * 89 +100);
//         if(err) throw err;
//         if(files.picture.type=='image/jpeg'||files.picture.type=='image/png'){
//             var oldName=files.picture.path
//             var newName=t+'_'+ran+files.picture.type.replace('image/','.')
//
//             if(fs.existsSync(oldName)){
//                 fs.renameSync(oldName,newName)
//                 //res.send('添加成功')
//                 pool.query('select * from user where userNickName=?',[fields.resBoss],function(err,result){
//                     if(!err){
//                         if(result[0]==undefined){
//
//                             res.send({code:300,msg:'没有此用户'})
//                         }
//                         else{
//                             console.log(fields)
//                             pool.query('insert into restaurant set ?',[fields],function(err,result){
//                                 if(err){
//                                     throw err
//                                 }
//                                 else{
//                                     if(result.affectedRows>0){
//                                         console.log(result)
//                                         pool.query('update restaurant set picpath=? where resID=?',[newName,result.insertId],function(err,result){
//                                             if(!err){
//                                                 res.send({code:200,msg:'添加成功'})
//                                             }
//                                             else {
//                                                 throw err
//                                             }
//                                         })
//
//                                     }
//                                     else
//                                         res.send({code:301,msg:'添加失败'})
//                                 }
//
//                             })
//                             //res.send(fields)
//                         }
//                     }
//                     else throw err
//                 })
//             }
//             else res.send('修改失败')
//         }
//         else{
//             res.send('类型不对')
//         }
//         //把生成的文件复制到bossRestaurantImage中。
//         if(fs.existsSync(__dirname+'/../'+newName)){
//             console.log('存在')
//             fs.copyFileSync(__dirname+'/../'+newName,__dirname+'/../public/images/bossRestaurantImage/'+newName)
//             fs.unlinkSync(__dirname+'/../'+newName)
//         }
//         else{
//             console.log('不存在')
//         }
//
//         //每次结束时，异步遍历文件夹，把文件加中没进行过改名的文件删除
//         fs.readdir(form.uploadDir,function(err,result){
//             if(err){
//                 console.warn(err)
//             }else{
//                 //遍历读取到的文件列表
//                 for(var index in result){
//                     if(result[index].indexOf('upload')>-1){
//                         fs.unlinkSync(form.uploadDir+'/'+result[index])
//                     }
//                 }
//             }
//         })
//     });
// })
//

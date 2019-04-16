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


router.get('/restaurant_detail',function (req,res) {
    pool.query('select resID, picpath,resName,resBoss,resType,latitude,longitude,start,price from restaurant where resID=?',[req.query.resID],function (err,result) {
        if(!err){

            res.send(result[0])
        }
        else throw err
    })
})

///restaurant_getCommit'+window.location.href,
router.get('/restaurant_getCommit',function (req,res) {
    //console.log(req.query)
    pool.query('select commit from restaurant where resID=?',[req.query.resID],function (err,result) {
        if(!err){
            if(result[0].commit=='0'){
                res.send('no commit')
            }else{
                res.send(result[0].commit)
            }

        }
        else throw err
    })

})

router.post('/restaurant_commit',function (req,res) {

    //console.log(req.body)
    var resID=req.body.resID;
    var commiter=req.body.commiter;
    var start=req.body.start
    var fileDir1,fileDir2,saveDir1,saveDir2
    if(req.body.canvas1!='no'){
        var img1Data = req.body.canvas1.replace(/^data:image\/\w+;base64,/, "");
        //准备第一个图的材料，路径/buffer
        var dataBuffer = Buffer.from(img1Data, 'base64');
        var t ='1_'+sd.format(new Date(),'MMDDHHmm');
        //生成随机数
        var ran = parseInt(Math.random() * 89 +100);
        fileDir1=__dirname+'/../public/images/customerRestaurantImage/'+resID+t+'_'+ran+'.jpeg'
        saveDir1='../images/customerRestaurantImage/'+resID+t+'_'+ran+'.jpeg'
        fs.writeFile(fileDir1,dataBuffer,function(err){
            if(err){
                throw err
            }
        })
    }else{
        fileDir1=''
        saveDir1=''
    }
    if(req.body.canvas2!='no'){
        var img2Data = req.body.canvas2.replace(/^data:image\/\w+;base64,/, "");
        //准备第一个图的材料，路径/buffer
        var dataBuffer = Buffer.from(img2Data, 'base64');
        var t ='2_'+sd.format(new Date(),'MMDDHHmm');
        //生成随机数
        var ran = parseInt(Math.random() * 89 +100);
        fileDir2=__dirname+'/../public/images/customerRestaurantImage/'+resID+t+'_'+ran+'.jpeg'
        saveDir2='../images/customerRestaurantImage/'+resID+t+'_'+ran+'.jpeg'
        fs.writeFile(fileDir2,dataBuffer,function(err){
            if(err){
                throw err
            }
        })
    }else{
        fileDir2=''
        saveDir2=''
    }
    var fileDir=saveDir1+'<>'+saveDir2//两个文件的位置由'<>'分开
    var commitArr=[
        commiter,
        start,
        req.body.recommended,
        req.body.advantage,
        req.body.disadvantage,
        req.body.commitMain,fileDir]//评论数组应该包括 评论人，所给分数，推荐，优点，缺点，如果有图片，存图片路径；
    var commitText='^&^'+commitArr.join('#$#')//每个评论用'^&^'分割，每条评论中的每条元素用#$#分
    var sql=`update restaurant set commit=CONCAT(commit,?) where resID=?`
    pool.query(sql,[commitText,resID],function (err,result) {
             if(!err){
                 res.json({'code':'200','text':'commit success'})
                 //进行评分
                 pool.query('select commit from restaurant where resID=?',[resID],function(err,result){

                     console.log(result)
                     if(!err){
                         var numOfStarted=0
                         var numOfStartedHum=0
                         var finalStar
                         if(result[0].commit===undefined){
                             finalStar=req.body.start
                         }
                         else{
                             var commit=result[0].commit.split('^&^')
                             commit.shift()
                             for(var i=0;i<commit.length;i++){
                                 var commitIArr=commit[i].split('#$#')
                                 if(commitIArr[1]!='0'){//可能有些人没评分
                                     numOfStarted=numOfStarted+parseInt(commitIArr[1])
                                     numOfStartedHum=numOfStartedHum+1
                                 }
                             }
                             finalStar=numOfStarted/numOfStartedHum
                             finalStar=finalStar.toFixed(1)

                         }
                         pool.query('update restaurant set start=? where resID=?',[finalStar,resID],function (err,result) {
                             if(!err){
                                 console.log('评分成功')
                             }else throw err
                         })
                     }
                 })
             }else
             {
                res.json({'code':'201','text':'commit failed'})
             }
    })





})


module.exports=router



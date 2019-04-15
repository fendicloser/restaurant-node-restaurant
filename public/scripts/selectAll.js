var label='name'
$(document).ready(function(){
    $.ajax({
        url: '/user/welcomeUser' ,
        data: '',
        type: 'POST',
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        success: function (dataR) {

            //a href="javascript:void(0);" onclick="js_method()"


            var loginState=dataR[0].code
            if(loginState==200){
                console.log(dataR[0].text)
                $('#loginState').html(
                    `
                    <li style="margin-top: -6px" class="navbar-brand dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                    欢迎您： ${dataR[0].text}
                    <b class="caret"></b>
                </a>
                <ul class="dropdown-menu ">
                    <li><a href="javascript:void(0);" onclick="myCollect()">我的收藏</a></li>
                    <li class="divider"></li>
                    <li><a href="javascript:void(0);" onclick="beBoss()">我要当老板</a></li>
                    <li class="divider"></li>
                    <li><a href="javascript:void(0);" onclick="logout()">登出</a></li>
                </ul>
            </li>
                    `
                )
            }
            else{
                console.log('没有登陆过')

                $('#loginState').html(`
                    <li class="navbar-brand text-white" ><a id="login" href="javascript:void(0);"  onclick="js_method1()"><span class="glyphicon glyphicon-log-in"></span>登陆</a></li>
                    <li class="navbar-brand text-white"><a id="reg" href="javascript:void(0);"  onclick="js_method2()"><span class="glyphicon glyphicon-user"></span>注册</a></li>
                
                `)
            }
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }
    });
    $('#nav').localScroll(800);
    $('#intro').parallax("50%", 0.1);
    $('#second').parallax("50%", 0.1);
    $('.bg').parallax("50%", 0.4);
    $('#third').parallax("50%", 0.3);
    $('#closeArea').click(function () {
        $('#endPage').animate({height:0})
        $('#endPagePhone').css({'display':'none'})
        $('#endPageArea').css({'display':'none'})
        $('#endPageQR').css({'display':'none'})
    })
    $('#nameLable').click(function () {
        label='name'
        $('#traniangle').animate({'margin-left':'12.5%'})
    })
    $('#typeLable').click(function () {
        label='type'
        $('#traniangle').animate({'margin-left':'19.3%'})
    })
    $('#locationLable').click(function () {
        label='location'
        $('#traniangle').animate({'margin-left':'27.5%'})
    })
    $('#scopeLable').click(function () {
        label='scope'
        $('#traniangle').animate({'margin-left':'35%'})
        $("#SearchQuery").attr("placeholder","请以'经度':'纬度'的格式进行输入");
    })

    $('#resultList').on('mouseenter','div.boxInfo',function(event){
        event.stopPropagation();
        var target=$(event.target)
        target.animate({
            opacity:'0.9',
            top:'-50%',
            height:'80%'

        },250)
    })
    $('#resultList').on('mouseleave','div.boxInfo',function(event){
        event.stopPropagation();
        var target=$(event.target)
        target.animate({
            opacity:'1',
            top:'0%',
            height:'30%'

        },250)
    })
    $('#resultList').on('click','div.box',function (event) {

        event.stopPropagation()
        var target=$(event.target)
        signal=target.context.getAttribute("signal")
        if(signal!=null){
            var url='/restaurant/restaurant_detail'+'?resID='+signal
            window.open('http://localhost:8081/restaurant_detail.html'+'?resID='+signal)
            console.log(url)
            $.get(url,function (data,status) {
                console.log('服务器返回的数据：'+data )
            })
        }


    })
    $('#goSearch').click(function() {
        $('html,body').animate({
            scrollTop: $("#second").offset().top + 200
        }, 1000);
    });
})
var js_method1=function() {
    window.location.href="http://localhost:8081/user_login.html"
}
var js_method2=function() {
    window.location.href="http://localhost:8081/user_Reg.html"
}

var myCollect=function(){
    console.log('123')
}
var beBoss=function () {
    console.log('456')
}
var logout=function(){
    $.ajax({
        url: '/user/logout' ,
        data: '',
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function (dataR) {
            //console.log(dataR[0])
            if(dataR[0].code==200){
                console.log('登出成功')
                window.location.href="/selectAll.html"

            }
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }
    });
}



function goSearch() {//ajax!!!
    var query={label:label,query:document.getElementById('SearchQuery').value}
    queryJson=JSON.stringify(query)
    var url='?label='+label+'&'+ 'SearchQuery='+document.getElementById('SearchQuery').value

    url='/restaurant/selectAll'+url
    //ajax
    //h5  sessionSTORAGE
    var xhr
    if(window.XMLHttpRequest){xhr=new XMLHttpRequest()}
    else {xhr=new ActiveXObject('Microsoft.XMLHTTP')}
    xhr.open('get',url,true)
    xhr.send()
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4&xhr.status==200){
            var selectAllResult=JSON.parse(xhr.responseText)

            console.log(selectAllResult)

            var resultList=document.getElementById('resultList')
            var htmlStr=''
            for (var index in selectAllResult){
                console.log(selectAllResult[index])
                var resName=selectAllResult[index].resName  //需要
                var expressResName
                if(resName.length>12){
                    expressResName=resName.substring(0,9)+'...'
                }
                else expressResName=resName
                var longitude=parseFloat(selectAllResult[index].longitude)
                var latitude=parseFloat(selectAllResult[index].latitude)
                var picpath=selectAllResult[index].picpath   //需要
                var star=selectAllResult[index].start       //需要
                if(selectAllResult[index].start ===null){
                    star='无评分'
                }
                var price=selectAllResult[index].price      //需要

                var picInter="../images/bossRestaurantImage/"+picpath

                var resID=selectAllResult[index].resID

                // htmlStr=htmlStr+'<div class="box">'+selectAllResult[index]+'</div>'
                htmlStr=htmlStr+
                    `<div class="box" signal=${resID}>
                        <div id='resultImage' style="z-index:29;border-top-right-radius:10%;border-top-left-radius:10%;width: 100% ;height: 70%;background-color: white" >
                            <img style="border-top-right-radius:10%;border-top-left-radius:10%;width: 100%;height: 110%" src=${picInter} signal=${resID}>
                        </div>
                        <div class="boxInfo" id="resultInfo" signal=${resID} style="position:relative;overflow:hidden;background-color:darkmagenta;border-bottom-left-radius:24px;border-bottom-right-radius:24px;z-index:30;align-items:center;color: white; height: 30%;width: 100.5%">
                               <div style="position: absolute;left: 5px">   
                                    <h4 signal=${resID} style=" margin-top: 1px;">${expressResName}</h4>      
                               </div>
                               <div style="position: absolute;right: 5px;">
                                     <h6 signal=${resID} style="margin-top: 25px">评分：${star}</h6>
                               </div>
                               <div style="position: absolute;top: 60px;left: 15px;">
                                     <h6 signal=${resID}>均价：¥${price}</h6>
                               </div>
                               <div style="position: absolute;top: 85px;left: 15px;">
                                    <h6 signal=${resID}>经度${longitude},纬度${latitude}</h6>
                               </div>            
                        </div>
                    </div>`
            }
            resultList.innerHTML=htmlStr


        }
    }
    //开始渲染

}



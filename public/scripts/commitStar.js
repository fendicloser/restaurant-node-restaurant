$(document).ready(function(){
    var commiter
    $.ajax({
        url:'navbar.html',
        type:'GET',
        success:function (dataR) {
            $('#external').html(dataR)
        }
    })
    $.ajax({
        url:'readme.html',
        type:'GET',
        success:function (dataR) {
            $('#readmore').html(dataR)
        }
    })
    $.ajax({
        url:'/user/checkWhetherLogin',
        type:'GET',
        success:function (dataR) {
            if(dataR[0].code!=200){
                $(document.body).css({
                    "overflow-x":"hidden",
                    "overflow-y":"hidden"
                });


            }else{
                commiter=dataR[0].text
                $(document.body).css({
                    "overflow-x":"auto",
                    "overflow-y":"auto"
                });
                $('#model').css({
                    "display":'none'
                })
            }
        }
    })
    $('#guest').click(function () {

        commiter='unnamedguest'
        $(document.body).css({
            "overflow-x":"auto",
            "overflow-y":"auto"
        });
        $('#model').animate({'margin-top':'100%'},1000,function(){
            $('#model').css({
                "display":'none'
            })
        });
    })
    $('#goLogin').click(function () {
        window.location.href='/user_login.html'
    })
    $('#readDetail').click(function () {
        $('html,body').animate({
            scrollTop: 0
        }, 100,function () {
            $('#readmoreArea').css({
                'display':'flex'
            }),
            $(document.body).css({
                "overflow-x":"hidden",
                "overflow-y":"hidden"
            });
        });
    })
    $('#closeReadMore').click(function () {
        $(document.body).css({
            "overflow-x":"auto",
            "overflow-y":"auto"
        });
        $('#readmoreArea').css({
            'display':'none'
        })
    })

    $('#commitButton').click(function () {
        if($('input[name="checkProtocol"]:checked').val()=='true'){
            var StartNum=0
            $(".star-six").each(function(){
                if($(this).css("border-bottom")!='15px solid rgb(135, 206, 235)'){
                    StartNum=StartNum+1
                }
            });
            var resID=window.location.search.substring(window.location.search.indexOf('=')+1)
            var canvasURL = document.getElementById('canvas').toDataURL();
            var canvas2URL=document.getElementById('canvas2').toDataURL()
            var sendDataObj={
                resID:resID,
                commiter:commiter,
                start:StartNum,
                recommended:$('#recommand').val(),
                advantage:$('#advantage').val(),
                disadvantage:$('#disadvantage').val(),
                commitMain:$('#commitMain').val(),
            }
            if(canvasURL.length<1000){
                sendDataObj.canvas1='no'
            }
            else {
                sendDataObj.canvas1=canvasURL
            }
            if(canvas2URL.length<1000){
                sendDataObj.canvas2='no'
            }
            else {
                sendDataObj.canvas2=canvas2URL
            }
            var sendDataJson=sendDataObj
            $.ajax({
                url:'/restaurant/restaurant_commit',
                type:'POST',
                data:sendDataJson,
                dataType: 'json',
                success:function (data) {
                    if(data.code=='200'){
                        window.location.href='/restaurant_commit_success.html'+window.location.search
                    }else{
                        alert('评论失败')
                    }

                }



            })


        }else{
            $('#readWarning').css({
                display:'inline'
            })
        }

        //         //readProtocol
        //$("input[type='checkbox']").is(':checked')



    })


    // #closeReadMore
    // #closeReadMore
    // #readmore



    $('#starArea').delegate('','mouseover',function(event){
        var target=$(event.target)
        event.stopPropagation();
        var id='#'+target.attr('id')
        var appendStr="<style>"+id+":after{border-top:15px solid red}</style>"
        $('#starArea').append(appendStr)
        target.css({'border-bottom': '15px solid red'})
        $('#starArea').css({'border-bottom': ''})

    })
    $('#starArea').delegate('','click',function(event){
        var target=$(event.target)
        event.stopPropagation();
        var id='#'+target.attr('id')
        var appendStr="<style>"+id+":after{border-top:15px solid skyblue}</style>"
        $('#starArea').append(appendStr)
        target.css({'border-bottom': '15px solid skyblue'})
        $('#starArea').css({'border-bottom': ''})

    })




})




//摄像头
var videoOpened=false
function getMedia() {
    videoOpened=true
    let constraints = {
        video: {width: 100, height: 100},
        audio: false
    };
    let video = document.getElementById("video");
    let promise = navigator.mediaDevices.getUserMedia(constraints);
    promise.then(function (MediaStream) {
        video.srcObject = MediaStream;
        video.play();
    });
}
function takePhoto() {
    //获得Canvas对象
    if(videoOpened){
        let canvas1=document.getElementById('canvas')
        let canvas2=document.getElementById('canvas2')
        let video = document.getElementById("video");
        if(canvas1.getAttribute('isUsed')=='false'){
            let ctx = canvas1.getContext('2d');
            ctx.drawImage(video, 0, 0, 100, 100);
            canvas1.setAttribute('isUsed','true')
        }
        else{
            if(canvas2.getAttribute('isUsed')=='false'){
                let ctx=canvas2.getContext('2d');
                ctx.drawImage(video, 0, 0, 100, 100);
                canvas2.setAttribute('isUsed','true')
            }else{
                let ctx1=canvas1.getContext('2d')
                ctx1.drawImage(canvas2,0,0,120,150)
                let ctx2=canvas2.getContext('2d')
                //
                // ctx1.drawImage(ctx2,0,0,100,100)
                ctx2.drawImage(video,0,0,100,100)
            }
        }
    }


}





var ws = new WebSocket("ws://localhost:8181");
ws.onopen = function (e) {
    console.log('Connection to server opened');
}
class FullDiv extends React.Component{



    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
            socketValue:[],
            showChatRoom:false,
            resID:0,
            resName:'',
            resType:'',
            resBoss:'',
            longitude:'',
            latitude:'',
            start:0,
            price:0,
            commit:['no commit'],
            defaultImage:'',
            allImage:[],
            showMap:false,
            clickedImage:0,
            profileScr:'',
            sendCommit:false
        };
        this.searchGif = this.searchGif.bind(this);
    }
    webSocket=()=>{
        this.setState((state,props)=>{
            return {
                showChatRoom: true
            }
        })
    }
    closeWebSocket=()=>{
        this.setState((state,props)=>{
            return {
                showChatRoom: false
            }
        })
    }


    searchGif=()=>{
        $.ajax({
            url:'navbar.html',
            type:'GET',
            success:function (dataR) {
                $('#external').html(dataR)
            }.bind(this)
        })
        $.ajax({
            url:'/restaurant/restaurant_detail'+window.location.search,
            type:'GET',
            dataType:'json',
            success:function (dataR) {

                document.getElementsByTagName("title")[0].innerText = dataR.resName;
                this.setState((state,props)=>{
                    var pictureStr='#'+dataR.picpath
                    var pictureArr=[]
                    for(var i=0;i<pictureStr.split('#').length;i++){
                        if(pictureStr.split('#')[i].length>1){
                            pictureArr.push(pictureStr.split('#')[i])
                        }
                    }
                    for(var j=0;j<pictureArr.length;j++){
                        pictureArr[j]='../images/bossRestaurantImage/'+pictureArr[j]
                    }
                    return {
                        resID:dataR.resID,
                        resName:dataR.resName,
                        resBoss:dataR.resBoss,
                        resType:dataR.resType,
                        latitude:dataR.latitude,
                        longitude:dataR.longitude,
                        start:dataR.start,
                        price:dataR.price,
                        allImage:pictureArr,
                        defaultImage:pictureArr[0],
                    }
                })
            }.bind(this),
            error: function (xhr, status, error) {
                    alert('Error: ' + error.message);
            }.bind(this)
        })
    }

    showImage=(num)=>{
        //alert(num)
        if(num<this.state.allImage.length){
            var src=this.state.allImage[num]
            this.setState((state,props)=>{
                return {
                    defaultImage:src,
                    showMap:false,
                    clickedImage: num

                }
            })
        }else{
            this.setState((state,props)=>{
                return {
                    showMap:true,
                    clickedImage: num
                }
            })
        }
    }

    componentDidMount(){
        var proArr=['../images/profile/pro1.png','../images/profile/pro2.png','../images/profile/pro3.png','../images/profile/pro4.png','../images/profile/pro5.png']

        function RandomNumBoth(Min,Max){
            var Range = Max - Min;
            var Rand = Math.random();
            var num = Min + Math.round(Rand * Range); //四舍五入
            return num;
        }
        var num=RandomNumBoth(0,proArr.length-1)
        this.setState((state,props)=>{
            return {
                profileScr: proArr[num]
            }
        })


        ws.addEventListener('message',evt =>{
            var newSocketValue=this.state.socketValue
            if(newSocketValue.length>10){
                newSocketValue.shift()
            }
            newSocketValue.push(evt.data)
            this.setState((state,props)=>{
                return {
                    socketValue: newSocketValue

                }
            })

        })

        this.searchGif()

    }
    componentWillUpdate(){
        var dirLng=this.state.longitude
        var dirLat=this.state.latitude
        const { BMap, BMAP_STATUS_SUCCESS } = window
        var map = new BMap.Map("allmap"); // 创建Map实例
        var myLng,myLat
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                var mk = new BMap.Marker(r.point);
                map.addOverlay(mk);
                map.panTo(r.point);
                myLng=r.point.lng
                myLat=r.point.lat
                map.centerAndZoom(new BMap.Point(116.404, 39.915), 5); // 初始化地图,设置中心点坐标和地图级别
                var p1 = new BMap.Point(parseFloat(myLng), parseFloat(myLat));
                var p2 = new BMap.Point(116.508328, 39.919141);
                var driving = new BMap.DrivingRoute(map, { renderOptions: { map: map, autoViewport: true } });
                driving.search(p1, p2);

            }
            else {
                alert('failed'+this.getStatus());

            }
        });
    }
    rollLeft=()=>{
        var nowImage=this.state.clickedImage
        if(nowImage>0){
            var nextImage=nowImage-1
            var src=this.state.allImage[nextImage]
            this.setState((state,props)=>{
                return{
                    defaultImage:src,
                    showMap:false,
                    clickedImage:nextImage
                }
            })
        }
    }
    rollRight=()=>{
        if(this.state.clickedImage!=this.state.allImage.length){
            var next=this.state.clickedImage+1
            if(next<this.state.allImage.length){
                var src=this.state.allImage[next]
                this.setState((state,props)=>{
                    return {
                        defaultImage:src,
                        showMap:false,
                        clickedImage: next
                    }
                })
            }else{
                this.setState((state,props)=>{
                    return {
                        showMap:true,
                        clickedImage: next
                    }
                })
            }
        }
    }
    getPhone=()=>{
        alert('ajax查询该老板的电话')
    }
    someType=()=>{
        alert('ajax查找相同类型的饭店')
    }

    goCommit=()=>{
        //在commit页面先检测是否已经登陆了
        var resId=this.state.resID
        var url='/restaurant_commit.html?resID='+resId
        //alert(url)
        window.open(url)

    }
    sendSocket=()=>{
        ws.send($('#socketValue').val());
        document.getElementById("socketValue").value=""
    }

    handleWheel=()=>{
        //document.body.scrollTop


        var distance=$('#header').offset().top-$(window).scrollTop()
        var text=0
        if(distance<-75){
            $('#detailInfo').css({
                position: 'fixed',
                marginLeft:'51.5%',
                marginTop:'-126px',
                height:'500px',
                width:'34.6%'
            })
        }else{
            $('#detailInfo').css({
                position: '',
                marginLeft:'',
                marginTop:'',
                height:'100%',
                width:'40%',
            })
        }

        if(distance<=10&&distance>=5){

            if(this.state.sendCommit===false){

                console.log(this.state.resID)
                $.ajax({
                    url:'/restaurant/restaurant_getCommit'+window.location.search,
                    type:'GET',
                    success:function (dataR) {
                        if(dataR=='no commit'){
                            this.setState((state,props)=>{
                                return {
                                    commit: [dataR],
                                    sendCommit: true
                                }
                            })
                            console.log(dataR)
                        }else{
                            var commitArr=dataR.split('^&^')
                            commitArr.shift()
                            console.log(commitArr)
                            var newCommitArr=[]
                            for(var i=0;i<commitArr.length;i++){
                                newCommitArr.push(commitArr[i].split('#$#'))
                            }
                            this.setState((state,props)=>{
                                return {
                                    commit: newCommitArr,
                                    sendCommit: true
                                }
                            })
                        }
                    }.bind(this)

                })

            }
        }


    }

    collect=()=>{

    }
    render = ()=>{
        var flex=this.state.showMap?'flex-end':'flex-start'
        const styles={
            header:{display:'flex', justifyContent:'space-around', alignItems:'right', marginTop:'30px', width:'100%', height:'130px',backgroundColor:'#fafafa'},
            headerButton:{marginTop: '4%',height:'30px'},
            headerContent:{marginTop:'3%',marginLeft:'-10%'},
            detailBody:{display:'flex', flexDirection:'row', width: '86%', height:'500px', marginLeft:'7%', marginRight:'7%',},
            pictureArea:{width:'60%', height:'100%'},
            detailInfo:{display:'flex',justifyContent:'space-between',flexDirection:'column',width:'40%', height:'100%'},
            defaultImage:{
                marginLeft:'10%',
                width:'80%',
                height:'70%',
                zIndex:'2147483647',
            },
            ImageSelectorArea:{
                display:'flex',
                flexDirection:'row',
                justifyContent:'center',
                height:'25%',
                width:'80%',
                marginLeft:'10%',
                marginTop:'3%',
                backgroundColor:'white',
            },
            rollLeft:{
                height:'100%',
                width:'35px',
                marginLeft:'20px',
                marginRight:'20px',
                backgroundColor:'black'
            },
            arrowsLeft:{
                marginTop:'40px',
                marginLeft:'-40px',
                border:'20px solid',
                borderColor:'transparent white transparent transparent'
            },
            arrowsRight:{
                marginTop:'36px',
                border:'20px solid',
                borderColor:'transparent transparent  transparent white'
            },
            gallery:{
                display:'flex',
                flexDirection:'row',
                justifyContent:flex,
                overflow:'auto',
                height:'100%',
                width:'90%'
            },
            smallImageUnclicked:{
                height:'125px',
                width:'125px',
                marginRight:'10px',
                border:'3px white solid'
            },
            smallImageClicked: {
                height:'125px',
                width:'125px',
                marginRight:'10px',
                border:'3px red solid'
            },
            profileImage:{
                width:'100px',
                height:'100px',
                borderRadius:'50%',
            },
            profileComImage:{
                width:'50px',
                height:'50px',
                borderRadius:'50%',
            },
            price:{
                fontSize:50,
                color:'#ffc601'
            },
            secondInfoArea:{
                width:'80%',height:'30%',display:'flex',flexDirection:'column',justifyContent:'space-around',
            },
            secondInfoTopic:{
                color:'rgba(0,0,0,0.3)'
            },
            singleCommitArea:{
                width:'95%',height:'200px',backgroundColor:'white',display:'flex',flexDirection:'row'
            },
            chatroom:{
                position:'fixed',
                width:'350px',
                height:'400px',
                bottom:'0px',
                right:'10px',
                backgroundColor:'black',
            }
        };

        var imageLeft=[]
        for(var num=0;num<this.state.allImage.length;num++){
            if(num==this.state.clickedImage){
                imageLeft.push(<img id={num} key={num} onClick={this.showImage.bind(this,num)} style={styles.smallImageClicked} src={this.state.allImage[num]}/>)
            }
            else imageLeft.push(<img id={num} key={num} onClick={this.showImage.bind(this,num)} style={styles.smallImageUnclicked} src={this.state.allImage[num]}/>)
        }
        if(this.state.clickedImage==this.state.allImage.length){
            imageLeft.push(<img id={this.state.allImage.length} key={this.state.allImage.length} style={styles.smallImageClicked} onClick={this.showImage.bind(this,this.state.allImage.length)} src='../images/map.png'/>)
        }
        else  imageLeft.push(<img id={this.state.allImage.length} key={this.state.allImage.length} style={styles.smallImageUnclicked} onClick={this.showImage.bind(this,this.state.allImage.length)} src='../images/map.png'/>)
        var biggerImage=<img style={styles.defaultImage} src={this.state.defaultImage}/>
        var imageSelector=
            <div style={styles.ImageSelectorArea}>
                <div onClick={this.rollLeft} style={styles.rollLeft}><div style={styles.arrowsLeft}></div></div>
                <div style={styles.gallery}>{imageLeft}</div>
                <div onClick={this.rollRight} style={styles.rollLeft}><div style={styles.arrowsRight}></div></div>
            </div>
        //var map= <div id="allmap" style={{  width: '200px', height: '200px' }}></div>
        // var imageArea=biggerImage
        // var imageArea=this.state.showMap?<div style={styles.defaultImage}> <div id="allmap" style={{  width: '200px', height: '200px' }}></div></div>:biggerImage
        //
        var commitArea=[]//this.state.commit
        var proComArr=['../images/profileCom/1.png','../images/profileCom/2.png','../images/profileCom/3.png','../images/profileCom/4.png','../images/profileCom/5.png','../images/profileCom/6.png','../images/profileCom/7.png',]
        var socketValue=[]
        for(var socketValueL=0;socketValueL<this.state.socketValue.length;socketValueL++){
            socketValue.push(
                <div style={{display:'flex'}}>
                    <div style={{marginRight:'10px',width:'30px',height:'30px',borderRadius:'15px',backgroundColor:'blue'}}>

                    </div>
                    <div style={{float:'left',padding:'5px',width:'50%',backgroundColor:'rgb(176 227 110)', borderRadius:'5px',marginBottom:'5px'}}>
                        {this.state.socketValue[socketValueL]}
                        </div>
                </div>)
        }
        var chatRoom=this.state.showChatRoom?
            <div style={styles.chatroom}>
                <div style={{display:'flex',flexDirection:'row', justifyContent:'space-between',width:'100%',height:'35px',backgroundColor:'#333333',}}>
                    <h6 style={{color:'white'}}>关于{this.state.resName}的实时群聊</h6>
                    <button onClick={this.closeWebSocket}  type="button" className="btn btn-default btn-s"><span className="glyphicon glyphicon-remove"></span></button>
                </div>
                <div style={{overflow:'auto',backgroundColor:'rgb(250,250,250)',width:'100%',height:'250px'}}>
                    {socketValue}
                </div>
                <div style={{borderTop:' 1px solid rgba(0,0,0,0.1)',backgroundColor:'rgb(255,255,255)',width:'100%',height:'115px'}}>
                    <textarea id='socketValue' style={{resize:'none',border:'none',width:'100%',height:'100%'}}></textarea>
                    <button  style={{marginLeft:'70%',marginTop:'-70px'}} type="button" id="send" className="btn btn-primary" onClick={this.sendSocket}>Send!</button>
                </div>
            </div>:<div></div>
        function RandomNumBoth(Min,Max){
            var Range = Max - Min;
            var Rand = Math.random();
            var num = Min + Math.round(Rand * Range); //四舍五入
            return num;
        }
        for(var num=0;num<this.state.commit.length;num++){
            var photoNum=RandomNumBoth(0,proComArr.length-1)
            commitArea.push(
                <div style={styles.singleCommitArea}>
                    <div style={{width:'30%',display:'flex',flexDirection:'column',alignItems:'center'}}>
                        <div><img style={styles.profileComImage} src={proComArr[photoNum]}/></div>
                        <div>
                            {this.state.commit[num][0]}:
                        </div>
                    </div>
                    <div style={{height:'198px',width:'70%'}}>
                        <div>star:{this.state.commit[num][1]} 推荐:{this.state.commit[num][2]}</div>
                        <div>#优点:{this.state.commit[num][3]}#缺点{this.state.commit[num][4]}</div>
                        <div>评论正文:{this.state.commit[num][5]}</div>
                        {this.state.commit[num][6].split('<>')[0].length!=0?<div>
                                <img src={this.state.commit[num][6].split('<>')[0]} />
                                <img style={{marginLeft:'10px'}} src={this.state.commit[num][6].split('<>')[1]}/>
                            </div>:<div></div>
                        }
                        <div style={{border:'0.5px black solid',marginTop:'-20px',opacity:'0.1'}}></div>
                    </div>
                </div>
            )
        }
        var opacity=this.state.showMap?'1':'0'
        return (
            <div id='whole' onWheel={this.handleWheel}    >
                <div id='external'>
                </div>
                <div id='header' style={styles.header}>
                    <h1 style={styles.headerContent}>
                        {this.state.resName}
                    </h1>
                    <button style={styles.headerButton} onClick={this.collect} type="button" className="btn btn-warning">Collect</button>
                </div>
                <div style={styles.detailBody} >
                    <div style={styles.pictureArea}>
                        <div id="allmap" style={{position:'absolute',left:'12%',opacity:opacity, width: '41.5%', height: '350px' }}></div>
                        {biggerImage}
                        {imageSelector}
                    </div>
                    <div id='detailInfo' style={styles.detailInfo}>
                        {/*{map}*/}
                        {/*<div style={styles.starArea}>{this.state.start}</div>*/}
                        <div style={{width:'80%',height:'15%',display:'flex',alignItem:'center'}}>
                            <div style={{color:'#ffc601',marginTop:'20px'}}>
                                <span style={styles.price}>{this.state.price}</span>元人均
                            </div>
                            <div style={{width:'200px',height:'50px',marginTop:'30px',marginLeft:'20px'}}>
                                <span style={{color:'red',fontSize:25}}>{this.state.start}星级</span>
                                <div>共12433位顾客为此饭店评分</div>
                            </div>
                        </div>

                        <div style={{width:'80%',height:'1px',backgroundColor:'rgba(0,0,0,0.1)'}}></div>
                        <div style={styles.secondInfoArea}>
                            <div>
                                <span style={styles.secondInfoTopic}>主打类型</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{this.state.resType}</span>
                                <button style={{float:'right'}} onClick={this.someType} type="button" className="btn btn-xs btn-primary">查看更多相似饭店</button>
                            </div>
                            <div>
                                <span style={styles.secondInfoTopic}>地理经度</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{this.state.longitude}</span>
                            </div>
                            <div>
                                <span style={styles.secondInfoTopic}>地理纬度</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{this.state.latitude}</span>
                            </div>
                            <div>
                                <spane style={styles.secondInfoTopic}>最低消费</spane>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>无最低消费标准</span>
                            </div>

                        </div>
                        <div style={{width:'80%',height:'1px',backgroundColor:'rgba(0,0,0,0.1)'}}></div>
                        {/*{this.state.resID}*/}

                        {/*<hr width='80%' size='3' color={#5151A2} style={{FILTER: alpha(opacity=100,finishopacity=0,style=3)}}/>*/}
                        <div style={{display:'flex',alignItems:'center',justifyContent:'flex-start',width:'80%',height:'25%'}}>
                            <div >
                                <img style={styles.profileImage} src={this.state.profileScr}/>
                            </div>
                            <div style={{marginLeft:'5%'}}>
                                <div>
                                    老板名：
                                </div>
                                <div style={{color:'#ffc601',fontSize:30}}>
                                    {this.state.resBoss}
                                </div>
                            </div>
                            <div style={{marginLeft:'40px'}}>
                                <button style={{float:'right'}} onClick={this.getPhone} type="button" className="btn btn-lg btn-danger">预约</button>
                            </div>
                        </div>
                        <div style={{width:'80%',height:'1px',backgroundColor:'rgba(0,0,0,0.1)'}}></div>
                        <div style={{width:'80%',height:'10%',display:'flex',justifyContent:'space-around',alignItems:'center'}}>
                            <div>
                                <button style={{}} onClick={this.webSocket} type="button" className="btn btn-sm btn-success">加入实时群聊</button>
                            </div>
                            <div>
                                <button style={{}} onClick={this.goCommit} type="button" className="btn btn-sm btn-success">写评论</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{width:'40%',height:'500px',marginTop:'20px',marginLeft:'13%'}}>
                    <div className="panel panel-default">
                        <div style={{backgroundColor: '#222',borderColor:'#080808',color: 'white'}}
                             className="panel-heading">评论
                        </div>
                        <div className="panel-body" >
                            {commitArea}
                        </div>
                    </div>
                </div>
                {chatRoom}
            </div>
        )
    }
}
ReactDOM.render( <FullDiv/>, document.getElementById('app'),)

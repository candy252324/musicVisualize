function $(s){
	return document.querySelectorAll(s);
}





var size=32; //柱状的数量,自行更改
var box=$("#box")[0];
var height,width;
var canvas=document.createElement("canvas");
var ctx=canvas.getContext("2d");
box.appendChild(canvas);
var Dots=[];
var line;
var lis=$("#list li");

var mv=new MusicVisualizer({
	size:size,
	draw:draw,
});

for(var i=0; i<lis.length; i++){
	lis[i].onclick=function(){
		for(var j=0; j<lis.length; j++){
			lis[j].className="";
		}
		this.className="selected";
		mv.play("/media/"+this.title);  //调用mv的play方法
	}
}



// 控制音量
$("#volume")[0].onchange=function(){
	mv.changeVolume(this.value/this.max);
}
$("#volume")[0].onchange();




resize()
window.onresize=resize;

//设置点的坐标、颜色，返回到Dots中
function random(m,n){
	return Math.round(Math.random()*(n-m)+m)
}
function getDots(){
	Dots=[];
	for(var i=0; i<size; i++){
		var x=random(0,width);
		var y=random(0,height);
		var color="rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+",0.2)";
		Dots.push({
			x:x,
			y:y,
			dx:random(1,4), //圆圈偏移距离
			color:color,
			cap:0, //小帽距离容器底部的距离，初始化在最底端
		})
	}
}

function draw(arr){
	ctx.clearRect(0,0, width, height);
	var w=width/size;
	var cw=w*0.6;
	var capH=cw >10 ? 10:cw; //小帽高度不超过10
	ctx.fillStyle=line;
	for(var i=0; i<size; i++){
		var o=Dots[i];
		if(draw.type=="column"){
			var h=arr[i]/256*height*0.9;  //柱子高度
			ctx.fillRect(w*i, height-h, cw, h);
			ctx.fillRect(w*i, height-(o.cap+capH), cw, capH);
			o.cap--;
			if(o.cap<0){
				o.cap=0;
			}
			if( h>0 && o.cap<h+40){
				o.cap=h+40 > height-capH ? height-capH : h+40; //防止小帽跳出顶部
			}
		}else if(draw.type=="dot"){
			ctx.beginPath();
			var r=10+arr[i]/256*(height > width? width :height)/12;  //圆点随浏览器大小变化
			ctx.arc(o.x, o.y, r, 0, Math.PI*2,true);
			var g=ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
			g.addColorStop(0, "#fff");
			g.addColorStop(1, o.color);
			ctx.fillStyle=g;
			ctx.fill();
			o.x +=o.dx;
			o.x =o.x> width ?0: o.x;  //防止偏移后超出画布
			// ctx.strokeStyle="#fff";
			// ctx.stroke();
		}
		
	}
}
draw.type="column"; //默认绘制柱状图

function resize(){
	height=box.clientHeight;
	width=box.clientWidth;
	canvas.height=height;
	canvas.width=width;
	line=ctx.createLinearGradient(0, 0, 0, height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");
	getDots()
}

//页面样式设置

var types=$("#type li");
for(var i=0; i<types.length; i++){
	types[i].onclick=function(){
		for(var j=0; j<types.length; j++){
			types[j].className="";
			this.className="selected";
			draw.type=this.getAttribute("data-type");
		}
	}
}


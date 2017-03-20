
function MusicVisualizer(obj){
	this.source=null;

	this.count=0;

	this.analyser=MusicVisualizer.ac.createAnalyser();  //创建分析节点
	this.size=obj.size;
	this.analyser.fftSize=this.size*2;  //fftSize大小是分析时得到的音频频域数据(frequencyBinCount)个数的2倍

	this.gainNode=MusicVisualizer.ac[MusicVisualizer.ac.createGain?"createGain":"createGainNode"]();  //音量控制节点
	this.gainNode.connect(MusicVisualizer.ac.destination); //音量控制节点连接到AudioDestinationNode对象（音频输出聚集地，所有的Audio都直接或间接连接到这里）

	// 分析节点连接到音量控制节点
	this.analyser.connect(this.gainNode);

	this.xhr=new XMLHttpRequest();

	this.draw=obj.draw;

	this.visualize();
}

MusicVisualizer.ac= new(window.AudioContext||window.webkitAudioContext)();  //创建AudioContext（audio上下文对象）

MusicVisualizer.prototype.load=function(url, fun){
	this.xhr.abort(); //停止上一首歌的请求
	var self=this;
	this.xhr.open("GET",url);
	this.xhr.responseType="arraybuffer";
	this.xhr.onload=function(){
		fun(self.xhr.response);   //ajax返回的数据self.xhr.response，需要解码
	}
	this.xhr.send();
}

MusicVisualizer.prototype.decode=function(arraybuffer, fun){  
	MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){
		fun(buffer);
	},function(err){
		console.log(err);
	});
}

MusicVisualizer.prototype.play=function(url){
	var n= ++this.count;
	var self=this;
	this.source && this.stop();
	this.load(url, function(arraybuffer){
		if(n!=self.count) return;
		self.decode(arraybuffer, function(buffer){
			if(n!=self.count) return;
			var bs=MusicVisualizer.ac.createBufferSource();  //创建audioBufferSourceNode对象
			bs.connect(self.analyser);
			bs.buffer=buffer;
			bs[bs.start?"start":"noteOn"](0);
			self.source=bs;
		});
	})
}

MusicVisualizer.prototype.stop=function(){
	this.source[this.source.stop?"stop":"noteOff"](0);
}

MusicVisualizer.prototype.changeVolume=function(percent){
	this.gainNode.gain.value=percent*percent;
}

MusicVisualizer.prototype.visualize=function(){
	var self=this;
	var arr=new Uint8Array(this.analyser.frequencyBinCount);  //arr是音频频域数据，arr的长度即绘制时圆圈（柱形）的个数，arr[i]的值决定柱形的高度
	requestAnimationFrame= window.requestAnimationFrame||      
						   window.webkitRequestAnimationFrame||
						   window.mozRequestAnimationFrame;
	function v(){
		self.analyser.getByteFrequencyData(arr);
		self.draw(arr); 
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);  //requestAnimationFrame,请求动画帧,跟着浏览器的绘制频率走，一般每秒60帧
}
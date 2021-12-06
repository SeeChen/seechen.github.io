window.onload = function(){
	setNavScrollResponse();
	document.getElementById("top").style.marginTop = document.getElementById("titleBack").clientHeight * 1.2  + "px";
	pictureZoom();
	menuClick();
}
			
function setNavScrollResponse(){
	var prevScrollpos = window.pageYOffset;
	document.body.addEventListener('scroll', () => {
		var currentScrollPos = window.pageYOffset;
		if(prevScrollpos > currentScrollPos){
		}else{
			document.getElementById("titleBack").style.height = "5%";
		}
		prevScrollpos = currentScrollPos;
		if(document.body.scrollTop == 0 && document.documentElement.scrollTop == 0){
			document.getElementById("titleBack").style.height = "15%";
		}
	});
}

function pictureZoom(){
	var classNum = document.getElementsByClassName("example-picture").length;
	for(var i = 0; i < classNum; i++){
		document.getElementsByClassName("example-picture")[i].onclick = function(){
			var currentHeight = this.clientHeight;
			if(currentHeight == 160)
				this.style.height = "20em";
			else
				this.style.height = "10em"
		}
	}
}

function menuClick(){
	var classNum = document.getElementsByClassName("menu").length;
	for(var i = 0; i < classNum; i++){
		document.getElementsByClassName("menu")[i].onclick = function(){
			var id = this.id.replace("to", "");
			document.getElementById(id).scrollIntoView();
		}
	}
}
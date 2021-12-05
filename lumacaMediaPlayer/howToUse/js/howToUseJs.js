window.onload = function(){
	setNavScrollResponse();
	document.getElementById("top").style.marginTop = document.getElementById("titleBack").clientHeight * 1.2  + "px";
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
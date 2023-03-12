window.onload = function (){
	
	loadPageLanguage();
}

function loadPageLanguage() {
	
	alert("test");
	
	let languageUrl = "./JSON/LANGUAGE/index.json";
	
	$.getJSON(languageUrl, function(data) {
		
		let languageObj = data["zh"][0];
		console.log(languageObj);
		
		$("title:eq(0)").text(languageObj.title);
	});
}
window.onload = function (){
	
	loadPageLanguage();
}

function loadPageLanguage() {
	
	let languageUrl = "./JSON/LANGUAGE/index.json";
	
	$.getJSON(languageUrl, function(data) {
		
		let languageObj = data["zh"][0];
		
		$("title:eq(0)").text(languageObj.title);
	});
}
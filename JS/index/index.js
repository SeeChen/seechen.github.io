window.onload = function (){
	
	loadPageLanguage();
}

function loadPageLanguage() {
	
	let languageUrl = "./JSON/LANGUAGE/index.json";
	
	$.getJSON(languageUrl, function(data) {
		
		let languageObj = data["zh"][0];
		
		$("title:eq(0)").text(languageObj._title_);
		
		for (let i = 0; i < $("._to_replace_text").length; i++) {
			
			$("._to_replace_text:eq(" + i + ")").text(languageObj[$("._to_replace_text:eq(" + i + ")").text()]);
		}
	});
}
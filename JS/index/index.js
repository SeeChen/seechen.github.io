import { _language } from "../MODULE/Language.js"

var language = new _language();
var lang_url = "./JSON/LANGUAGE/index.json";

window.onload = function() {

    language.loadPageLanguage(lang_url, language.getLanguage());

    _hover();
    _click_bind();
}

function _click_bind() {

    $("#lang_en").click(function() {

        language.loadPageLanguage(lang_url, "en");
    });

    $("#lang_zh").click(function() {

        language.loadPageLanguage(lang_url, "zh");
    });
}

function _hover() {

    $("#nav_language").hover(
        function() {

            $("#language_module").css("display", "block");
            $("#project_module").css("display", "none");
            $("#header_bar").css("height", $("#nav_home").innerHeight() + $("#header_bar-bottom").innerHeight() + 32 + "px");
        },

        function() {
            
        }
    );

    $("#nav_project").hover(
        function() {

            $("#project_module").css("display", "block");
            $("#language_module").css("display", "none");
            $("#header_bar").css("height", $("#nav_home").innerHeight() + $("#header_bar-bottom").innerHeight() + 32 + "px");
        },

        function() {
            
        }
    );

    $("#nav_home").hover(
        function() {
            $("#header_bar").css("height", "4em");
        },

        function() {
            // out function
        }
    );

    $("#header_bar").hover(
        function() {

            // in function
        },

        function() {

            
            $("#header_bar").css("height", "4em");
        }
    )
}
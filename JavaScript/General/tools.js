
export const tools = {

    deepCopy: (
        obj
    ) => {

        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
    
        if (obj instanceof Date) {
            return new Date(obj);
        }
    
        if (Array.isArray(obj)) {
            const arrCopy = [];
            for (let i = 0; i < obj.length; i++) {
                arrCopy[i] = tools.deepCopy(obj[i]);
            }
            return arrCopy;
        }
    
        const objCopy = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                objCopy[key] = tools.deepCopy(obj[key]);
            }
        }
        return objCopy;
    },

    getJson: async (
        url
    ) => {
        if (window.fetch) {
            return fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP Error! Status: ${response.status}`);
                    }
                    return response.json();
                });
        } else {
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
    
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                var data = JSON.parse(xhr.responseText);
                                resolve(data);
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            reject(new Error(`HTTP Error! Status: ${xhr.status}`));
                        }
                    }
                };
    
                xhr.send();
            });
        }
    },

    getTranslate: async () => {
        try {
            var translateIndex = await tools.getJson("/Language/Index/index.json");
            window.globalValues.translateData.index = translateIndex;
    
            var translateNavigation = await tools.getJson("/Language/General/navigation.json");
            window.globalValues.translateData.navigation = translateNavigation;
        } catch (err) {
            console.error(err);
        }
    },
    
}

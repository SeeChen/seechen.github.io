
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

        const translatePaths = {

            month: "/Language/General/month.json",
            idx: "/Language/Index/index.json",
            nav: "/Language/General/navigation.json",
            footer: "/Language/General/footer.json",
            page404: "/Language/General/page404.json",

            home: "/Language/Home/home.json",
            timeline: "/Language/Home/timeline.json",

            travel: "/Language/Travel/travel.json",

            lens: "/Language/Lens/lens.json",

            country: "/Language/Area/country.json",
            countryCN: "/Language/Area/CN.json",
            countryMY: "/Language/Area/MY.json",
            countrySG: "/Language/Area/SG.json",

            cityCN: "/Language/Area/City/CN.json",
            cityMY: "/Language/Area/City/MY.json",
            citySG: "/Language/Area/City/SG.json",

            imageLabel: "/Language/Image/Label.json",
            imageTitle: "/Language/Image/Title.json",
            imageDesc: "/Language/Image/Desc.json",
        };

        const translateEntries = await Promise.all(
            Object.entries(translatePaths).map(async ([key, path]) => {
                try {
                    const translateData = await tools.getJson(path);
                    return [key, translateData];
                } catch (err) {
                    console.log(err);
                    return [key, {}];
                }
            })
        );

        window.globalValues.translateData = Object.fromEntries(translateEntries);

        console.log(window.globalValues.translateData);
    },
    
}

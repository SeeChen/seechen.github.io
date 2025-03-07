/* 
    File: database.js (https://github.com/SeeChen/seechen.github.io/blob/main/core/database.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024-2025 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/

class BaseDatabase {

    #DatabaseDirectory = null;
    #DatabaseType      = null;

    constructor (
        path,
        type
    ) {

        if (typeof path !== "string") {
            throw new TypeError(`Database Directory must be a string, your path is ${typeof(path)}`);
        }

        this.#DatabaseType      = type.toLowerCase();
        this.#DatabaseDirectory = path;
    }

    getConfig () {
        
        return {
            type:       this.#DatabaseType,
            directory:  this.#DatabaseDirectory
        }
    }
}

class databaseJson extends BaseDatabase {
    
}

export const Database = {

    create: (
        path,
        type
    ) => {

        const listType = {
            json: databaseJson,
        };

        type = type.toLowerCase();
        if (!listType[type]) {

            throw new TypeError(`Currently is not supported Type: ${type}`);
        }

        return new listType[type](path, type);
    }
}
/* 
    File: database.js (https://github.com/SeeChen/seechen.github.io/blob/main/core/database.js).
    Part of [seechen.github.io] (https://github.com/SeeChen/seechen.github.io).

    Copyright (C) 2024-2025 LEE SEE CHEN.

    This file is licensed under the GNU General Public License v3.0 (GPLv3).
    You can redistribute it and/or modify it under the terms of the GPLv3.
    For more details, see <https://www.gnu.org/licenses/>. 
*/

class BaseDatabase {
    static #ConfigSchema = {
        warn    : { type: "boolean" , default: true },
        dir     : { type: "string"  , default: null },
        type    : { type: "string"  , default: null }
    };

    #Config = Object.keys(BaseDatabase.#ConfigSchema).reduce((acc, key) => {
        acc[key] = BaseDatabase.#ConfigSchema[key].default;
        return acc;
    }, {});

    static status = {
        collection: {
            notfound: Symbol("not-found"),
            new     : Symbol("new"),
            loading : Symbol("loading"),
            loaded  : Symbol("loaded")
        }
    };
    #Status = new Map();

    constructor(
        path, 
        type
    ) {
        if (typeof path !== "string") {
            throw new TypeError(`Database Directory must be a string, but got ${typeof path}.`);
        }
        if (typeof type !== "string") {
            throw new TypeError(`Database type must be a string, but got ${typeof type}.`);
        }

        this.#Config["dir"]     = path;
        this.#Config["type"]    = type.toLowerCase()
    }

    get config() {
        return {
            set: (
                newConfig
            ) => {
                Object.entries(newConfig).forEach(([key, value]) => {
                    if (!this.#Config.hasOwnProperty(key)) {
                        throw new ReferenceError(`Invalid config key: "${key}". Allowed keys: [${Object.keys(this.#Config).join(", ")}]`);
                    }
                    const ExpectedType = BaseDatabase.#ConfigSchema[key].type;
                    if (typeof value != ExpectedType) {
                        throw new TypeError(`Invalid type for key "${key}". Expected <${ExpectedType}>, but got <${typeof value}>.`);
                    }
                    this.#Config[key] = value;
                });
            },
    
            get: (
                key = null
            ) => {
                if (!key) {
                    return {...this.#Config};
                }
                if (!BaseDatabase.#ConfigSchema.hasOwnProperty(key)) {
                    throw new ReferenceError(`Invalid config key: "${key}".`);
                }
                return this.#Config[key];
            }
        }
    }

    get status() {
        return {
            set: (
                ...NewStatus
            ) => {
                let LengthStatus = NewStatus.length;
                if (LengthStatus % 2 != 0) {
                    throw new RangeError("Invalid number of arguments: Must be an even number of key-value pairs.");
                }
                for (let i = 0; i < NewStatus.length; i += 2) {
                    const key = NewStatus[i];
                    const value = NewStatus[i + 1];
            
                    if (typeof key !== "string" || typeof value !== "symbol") {
                        throw new TypeError(`Expected <string, symbol> pairs, but got <${typeof key}, ${typeof value}>.`);
                    }
            
                    this.#Status.set(key, value)
                }
            },

            get: () => {
                return {
                    byName: (
                        CollectionName
                    ) => {
                        return this.#Status.get(CollectionName) || BaseDatabase.status.collection.notfound;
                    },

                    byStatus: (
                        CollectionStatus
                    ) => {
                        if (typeof CollectionStatus !== "symbol") {
                            throw new TypeError("Expected a Symbol, but got " + typeof CollectionStatus);
                        }
                    
                        if (!Object.values(BaseDatabase.status.collection).includes(CollectionStatus)) {
                            throw new ReferenceError("Invalid collection status");
                        }

                        return [...this.#Status.entries()]
                                .filter(([, v]) => v === CollectionStatus)
                                .map(([k]) => k);
                    }
                }
            }
        }
    }
}

class databaseJson extends BaseDatabase {

    #DatabaseCollection         = new Set();
    #DatabaseCollcetionDocument = new Map();

    collection (
        collectionName = null
    ) {
        return {
            set: (
                ListCollection,
                ExistOK = true
            ) => {
                if (!Array.isArray(ListCollection)) {
                    throw new TypeError(`This function only accepts an array. Your input type: ${typeof ListCollection}`);
                }
        
                ListCollection.forEach(collection => {
                    if (this.#DatabaseCollection.has(collection)) {
                        if (!ExistOK) {
                            throw new Error(`The collection "${collection}" already exists!`);
                        }
                        if (super.config.get("warn")) {
                            console.warn(`"${collection}" already exists.`);
                        }
                    } else {
                        this.#DatabaseCollection.add(collection);
                        super.status.set(collection, BaseDatabase.status.collection.new);
                    }
                });
            },

            get: (
                CollectionName = null
            ) => {
                if (!CollectionName) {
                    return [...this.#DatabaseCollection].map(name => this.collection().get(name));
                }

                if (typeof CollectionName === "string") {

                    if (!this.#DatabaseCollection.has(CollectionName)) {
                        throw new Error(`Collection "${CollectionName}" does not exist!`);
                    }

                    return {
                        name    : CollectionName,
                        path    : `${super.config.get("dir")}/${CollectionName}.${super.config.get("type")}`,
                        status  : super.status.get().byName(CollectionName)
                    }
                }
                
                if (Array.isArray(CollectionName)) {
                    return CollectionName.map(name => this.collection().get(name));
                }

                throw new TypeError(`Invalid argument: CollectionName must be <string> or <array>. Received value: "${CollectionName}" (type: <${typeof CollectionName}>)`);
            },

            document: (
                documentName = null
            ) => {
                if (typeof collectionName !== "string" || !collectionName.trim()) {
                    throw new Error("Collection name is required and must be a non-empty string.");
                }

                if (!this.#DatabaseCollection.has(collectionName)) {
                    throw new Error(`Collection "${collectionName}" does not exist!`);
                }

                return {
                    set: () => {
                        
                    },

                    get: () => {

                    },

                    load: () => {
                        
                    }
                }
            }
        }
    }
}

export const Database = {
    create: (
        path, 
        type
    ) => {
        if (typeof type !== "string") {
            throw new TypeError(`Type must be a string, but got <${typeof type}>.`);
        }

        const listType = Object.freeze({
            json: databaseJson
        });

        const dbClass = listType[type.toLowerCase()];
        if (!dbClass) {
            throw new TypeError(`Currently unsupported Type: ${type}`);
        }
        return new dbClass(path, type);
    }
};

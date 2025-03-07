
import { Database as db } from "/core/database.js";

window.onload = function () {

    const jsonDatabase = db.create("test", "JSON");
    console.log(jsonDatabase.getData());
}
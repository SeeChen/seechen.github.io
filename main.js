
import { Database as db } from "/core/database.js";

window.onload = function () {

    const jsonDatabase = db.create("test", "JSON");
    console.log(jsonDatabase)

    jsonDatabase.collection().set(
        ["a"]
    )

    jsonDatabase.config.set({warn: true});
    jsonDatabase.collection().set(
        ["b"]
    )

    console.log(jsonDatabase);

    console.log(jsonDatabase.status.get().byName("a"))


    console.log(jsonDatabase.collection().get())
    console.log("New Test");
    console.log(jsonDatabase.collection().get(["b", "b"]))
    console.log(jsonDatabase.collection().get("a"))

    console.log(jsonDatabase.collection("collection").document());
    // console.log(jsonDatabase.collection().get({
    //     1: "a"
    // }))
}
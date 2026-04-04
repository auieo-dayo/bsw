const axios = require("axios");

class CouchManager {
    constructor(baseurl,dbname,User={name:"admin",pass:""}) {
        this.couch = axios.create({
            baseURL: `${baseurl}/${dbname}`,
            auth: {
            username: User.name,
            password: User.pass
            }
        });

        this.get = this.couch.get
        this.post = this.couch.post

        this.couch.get("/_index").then((res) => {
            const exists = res.data.indexes.some(v => v.name === "player_timestamp_index");

            if (!exists) {
            couch.post("/_index", {
                index: {
                fields: ["playername", "timestamp"]
                },
                name: "player_timestamp_index"
            });
            }
        }).catch(console.error);
        


    }
}
module.exports = CouchManager
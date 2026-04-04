const pl = require("./chat/pl");

const d = require("./admin/d");
const p = require("./admin/p");
const ban = require("./admin/ban")

module.exports = {
    chat: { pl },
    admin: { p, d, ban }
}
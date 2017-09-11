const uuid = require("uuid/v4");

let users = new Set();

module.exports = {
    has: (uuid) => users.has(uuid),
    count: () => users.size,
    add: (uuid) => users.add(uuid),
    delete: (uuid) => users.delete(uuid),
    uuid: () => uuid()
};
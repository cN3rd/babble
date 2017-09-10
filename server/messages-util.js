let storage = [];
let lastMsgId = -1;

let addMessage = function (message) {
    // increase the current ID and Inject it into msg.
    message.id = ++lastMsgId;
    storage.push(message);

    // return the msgId.
    return lastMsgId;
}

let getSingleMessage = function (id) {
    return storage.find((msg) => { return msg.id === id; });
}

let getMessages = function (counter) {
    return storage.slice(counter);
}

let deleteMessage = function (id) {
    id = +id;
    msgId = storage.findIndex(msg => msg.id === id);

    if (msgId == -1)
        return false;
    storage.splice(msgId, 1);
    return true;
}

module.exports = {
    addMessage: addMessage,
    getMessages: getMessages,
    deleteMessage: deleteMessage,
    count: () => storage.length
};
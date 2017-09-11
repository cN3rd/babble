let storage = [];
let messageSenders = {};
let lastMsgId = -1;

function addMessage(message) {
    // increase the current ID and Inject it into msg.
    message.id = ++lastMsgId;
    storage.push(message);

    // return the msgId.
    return lastMsgId;
}

function getSingleMessage(id) {
    // iterate through storage
    return storage.find((msg) => { return msg.id === id; });
}

function getMessages(counter) {
    // returns the slice
    return storage.slice(counter);
}

function deleteMessage(id) {
    // parses id and tries to find it
    id = +id;
    let msgId = storage.findIndex(msg => msg.id === id);

    // check if message exists
    if (msgId == -1)
        return false;

    // remove if exists
    storage.splice(msgId, 1);
    return true;
}

function clear() {
    lastMsgId = -1;
    storage = [];
    messageSenders = {};
}

module.exports = {
    addMessage: addMessage,
    count: () => storage.length,
    clear: clear,
    deleteMessage: deleteMessage,
    getMessages: getMessages,
    getSingle: getSingleMessage,
    getSender: (mid) => messageSenders[mid],
    setSender: (mid, sender_id) => messageSenders[mid] = sender_id
};
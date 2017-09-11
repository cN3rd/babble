let storage = [];
let messageSenders = [];
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
    msgId = storage.findIndex(msg => msg.id === id);

    // check if message exists
    if (msgId == -1)
        return false;

    // remove if exists
    storage.splice(msgId, 1);
    return true;
}

module.exports = {
    addMessage: addMessage,
    getMessages: getMessages,
    getSingle: getSingleMessage,
    setSender: (mid, sender_id) => messageSenders[mid] = sender_id,
    getSender: (mid) => messageSenders[mid],
    deleteMessage: deleteMessage,
    count: () => storage.length
};
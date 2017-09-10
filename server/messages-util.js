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
    return storage.find((msg) => { return msg.id === id; });
}

function getMessages(counter) {
    return storage.slice(counter);
}

function deleteMessage(id) {
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
    getSingle: getSingleMessage,
    setSender: (mid, sender_id) => messageSenders[mid] = sender_id,
    getSender: (mid) => messageSenders[mid],
    deleteMessage: deleteMessage,
    count: () => storage.length
};
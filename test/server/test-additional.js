'use strict';

let assert = require('assert');
let messages = require('../../server/messages-util');
let users = require('../../server/user-utils');

let mid = -1;
let firstId = 1;
describe("Messages (Additional)", function () {
    it("should retrieve a single message", function () {
        let message = { message: '1' };
        mid = messages.addMessage(message);
        assert.equal(messages.getSingle(mid), message);
    });

    it("should allow user to get the count", function () {
        assert.equal(messages.count(), 1);
        messages.deleteMessage(String(mid));
        assert.equal(messages.count(), 0);
    });

    it("should allow user to add sender", function () {
        let message = { message: '2' };
        mid = messages.addMessage(message);
        firstId = 1;
        messages.setSender(mid, firstId);
        assert.equal(messages.getSender(mid), firstId);
    });

    it("should allow user to get sender", function () {
        assert.equal(messages.getSender(mid), firstId);
    });

    it("should allow user to modify sender", function () {
        let senderid = 3;
        messages.setSender(mid, senderid);
        assert.equal(messages.getSender(mid), senderid);
    });

    it("should allow us to clear", function () {
        assert.equal(messages.count(), 1);
        messages.clear();
        assert.equal(messages.count(), 0);
    })
});

// users
let uuid = users.uuid();
let uuid2 = users.uuid();
describe("Users", function () {
    it("should start with no users", function () {
        assert.equal(users.count(), 0);
    });

    it("should add a user with a random uuid", function () {
        users.add(uuid);
        assert.equal(users.has(uuid), true);
    });

    it("should count 1 user even if added multiple times", function () {
        assert.equal(users.count(), 1);
    });

    it("should count distinct users", function () {
        assert.equal(users.count(), 1);

        // introduce a new user
        users.add(uuid2);
        assert.equal(users.count(), 2);

        // introduce an existing user
        users.add(uuid);
        users.add(uuid);
        users.add(uuid);
        assert.equal(users.count(), 2);
    });

    it("should delete a user with a given uuid", function () {
        let uuid = users.uuid();
        users.delete(uuid);
        assert.equal(users.has(uuid), false);
    });
});

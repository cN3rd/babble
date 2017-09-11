"use strict";

const express = require("express");
const cors = require("cors");
const events = require("events");
const md5 = require("md5");
let extensions = require("./express-ext");
let users = require("./user-utils");
let messages = require("./messages-util");

// useful consts
let respondWithError = extensions.respondWithError;

// app initialization
let app = extensions.extend(express());

// event emitters
let emitter = new events.EventEmitter();
let statEmitter = new events.EventEmitter();
statEmitter.setMaxListeners(0);
emitter.setMaxListeners(0);

// cors support
app.options("*", cors());
app.use(cors());

// automatic handling of 200 errors
app.use(function (req, res, next) {
    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        console.log("hello");
    }
    else {
        next();
    }
});

// login handler
app.onlyAllow("/login", ["POST"]);
app.post("/login",
    extensions.noQueryKeys,
    extensions.jsonParser,
    extensions.onlyBodyKeys(["uuid"]),
    function (req, res, next) {
        users.add(req.body.uuid);
        statEmitter.emit("stats", "");
        res.end();
    });

// logout handler
app.onlyAllow("/logout", ["POST"]);
app.post("/logout",
    extensions.noQueryKeys,
    extensions.jsonParser,
    extensions.onlyBodyKeys(["uuid"]),
    function (req, res, next) {
        users.delete(req.body.uuid);
        statEmitter.emit("stats", "");
        res.end();
    });

// Long Polling
app.onlyAllow("/messages", ["GET", "POST"]);
app.get("/messages",
    extensions.onlyQueryKeys(["counter"]),
    extensions.customCheck(
        (req, res, next) => Number.isInteger(+req.query.counter),
        "Counter must be a number"),
    function (req, res, next) {
        if (+req.query.counter >= messages.count()) {
            emitter.once("del", function (mesId) {
                statEmitter.emit("stats", "");
                res.end(JSON.stringify({ delete: true, id: mesId }));
            });
            emitter.once("add", function (mes) {
                res.end(JSON.stringify([mes]));
            });
        }
        else {
            res.json(messages.getMessages(+req.query.counter));
        }
        statEmitter.emit("stats", "");
    });

// Add message page
app.post("/messages",
    extensions.noQueryKeys,
    extensions.jsonParser,
    function (req, res, next) {
        // get message and add it to DB
        let message = req.body;
        messages.addMessage(message);

        // add user metadata
        message.uuid = req.get("X-Request-Id");
        messages.setSender(message.id, req.get("X-Request-Id"));
        message.imageUrl = `http://gravatar.com/avatar/${md5(message.email.trim().toLowerCase())}`;

        // notify all users
        emitter.emit("add", message);
        statEmitter.emit("stats", "");

        // notify submitter
        res.json({ id: String(message.id) });
    });

// Delete message page
app.onlyAllow("/messages/:id", ["DELETE"]);
app.delete("/messages/:id",
    extensions.noQueryKeys,
    extensions.customCheck((req, res, next) => Number.isInteger(+req.params.id), "an id is required"),
    extensions.customCheck((req, res, next) => messages.getSingle(+req.params.id), "message does not exist"),
    extensions.customCheck(function (req, res, next) {
        return messages.getSender(+req.params.id) === req.get("X-Request-Id");
    }, "user cannot delete messages he doesn't own."),
    function (req, res, next) {
        // delete messsage from db
        let success = messages.deleteMessage(req.params.id);

        // notify all users
        if (success)
            emitter.emit("del", +req.params.id);

        // notify submitter.
        res.end(JSON.stringify(success));
    });

// Chat statistics
app.onlyAllow("/stats", ["GET"]);
app.get("/stats",
    extensions.noQueryKeys,
    function (req, res, next) {
        statEmitter.once("stats", function (data) {
            res.json({
                users: users.count(),
                messages: messages.count()
            });
        });
    });

app.onlyAllow("/uuid", ["GET"]);
app.get("/uuid", function (req, res, next) {
    res.end(users.uuid());
});

// error handlers
app.use(function (req, res, next) {
    respondWithError(res, 404, { path: req.originalUrl });
});

app.use(function (err, req, res, next) {
    respondWithError(res, 500, { stack: err.stack });
});

app.listen(9000);
// main babble object.
(function () {
    'use strict';

    // constants
    const host = "http://localhost:9000";

    // encapsulated variables
    let counter = 0;
    let session = {
        currentMessage: "",
        userInfo: {
            name: "",
            email: ""
        },
        uuid: ""
    };

    // babble stuff
    window.Babble = (function () {
        // load older session if exists
        let lastSession = JSON.parse(localStorage.getItem("babble"));
        if (lastSession)
            session = lastSession;

        // generate UUID if you have none.
        if (session.uuid === "" && !window.sinon) {
            ajax({
                method: "GET",
                action: "http://localhost:9000/uuid",
                success: function (data) {
                    session.uuid = data;
                }
            });
        }

        // if noting is in the local storage
        if (localStorage.getItem("babble") === null) {
            localStorage.setItem('babble', JSON.stringify(session));
        }

        // updating local storage

        let updateLocalStorage = function (userInfo) {
            session.userInfo.name = userInfo.name;
            session.userInfo.email = userInfo.email;
            localStorage.setItem('babble', JSON.stringify(session));
        };

        let updateCurrentMessage = function (messageContent) {
            session.currentMessage = messageContent;
            localStorage.setItem('babble', JSON.stringify(session));
        };

        // API FUNCTIONS

        let register = function (userInfo) {
            ajax({
                method: "POST",
                action: `${host}/login`,
                data: JSON.stringify({ uuid: session.uuid })
            })
            updateLocalStorage(userInfo);
        };

        let getMessages = function (counter, callback) {
            ajax({
                method: 'GET',
                action: `${host}/messages?counter=${counter}`,
                request_id: session.uuid,
                success: function (data) {
                    callback(JSON.parse(data));
                }
            });
        };

        let postMessage = function (message, callback) {
            ajax({
                method: 'POST',
                action: `${host}/messages`,
                request_id: session.uuid,
                data: JSON.stringify(message),
                success: function (data) {
                    callback(JSON.parse(data));
                }
            });
        };

        let deleteMessage = function (id, callback) {
            ajax({
                method: 'DELETE',
                action: `${host}/messages/${id}`,
                request_id: session.uuid,
                success: function (data) {
                    callback(JSON.parse(data));
                }
            });
        };

        let getStats = function (callback) {
            ajax({
                method: 'GET',
                action: `${host}/stats`,
                request_id: session.uuid,
                success: function (data) {
                    callback(JSON.parse(data));
                }
            });
        };

        return {
            chatContainer: document.getElementById("js-chatContainer"),
            chatWindow: document.getElementById("js-chatWindow"),
            statsMessages: document.getElementById("js-stat-messages"),
            statsPeople: document.getElementById("js-stat-people"),

            register: register,
            getMessages: getMessages,
            postMessage: postMessage,
            deleteMessage: deleteMessage,
            getStats: getStats,

            updateCurrentMessage: updateCurrentMessage
        };
    })();

    // util functions
    function timeToTimestamp(date) {
        let hours = ("0" + date.getHours()).slice(-2);
        let minutes = ("0" + date.getMinutes()).slice(-2);
        return hours + ":" + minutes;
    }

    function htmlToDOM(htmlStr) {
        let div = document.createElement("div");
        div.id = "lol";
        div.innerHTML = htmlStr;
        return div.firstElementChild;
    }

    function autoResize(elem, minHeight, maxHeight) {
        elem.addEventListener("input", function (event) {
            if (minHeight > elem.scrollHeight) {
                elem.style.height = `${minHeight}px`;
                return;
            }
            elem.style.height = "auto";
            elem.style.height = `${elem.scrollHeight}px`;
            if (elem.scrollHeight >= maxHeight)
                elem.style.height = `${maxHeight}px`;
        });
    }

    function compileMessage(content) {
        return {
            name: session.userInfo.name,
            email: session.userInfo.email,
            message: content,
            timestamp: Date.now().toString(),
            id: 0
        };
    }

    function ajax(options) {
        var xhr = new XMLHttpRequest();

        if (!options.method)
            options.method = 'GET';

        xhr.open(options.method, options.action);

        if (options.timeout) {
            xhr.timeout = options.timeout;
        }
        if (options.success) {
            xhr.addEventListener('load', function (e) {
                options.success(e.target.responseText);
            });
        }
        if (options.error) {
            xhr.addEventListener('error', options.fail);
        }
        if (options.request_id) {
            xhr.setRequestHeader("X-Request-Id", options.request_id);
        }
        xhr.send(options.data);
    }

    // DOM Stuff
    function getMessageHTML(message) {
        // handle timestamp
        let date = new Date(message.timestamp * 1);

        // handle button code
        if (message.name !== "" && message.email !== "") {
        } else {
            message.name = "Anonymous";
            message.imageUrl = "./images/anon.png";
        }

        let buttoncode = "";
        if (message.uuid === session.uuid) {
            buttoncode = "\n<button class=\"Message-deleteBtn js-deleteMsgBtn\" aria-label=\"Delete Message #" + message.id + "\">X</button>";
        }

        // handle template code
        return `<li class="Message" id="msg-${message.id}">
                    <img src="${message.imageUrl}" alt="" class="Message-image" />
                    <section class="Message-inner" tabindex="0">
                        <header class="Message-innerHead FlexGridRow">
                            <cite class="Message-author">${message.name}</cite>
                            <time class="Message-time" datetime="${date.toISOString()}">${timeToTimestamp(date)}</time>${buttoncode}
                        </header>
                        <div class="Message-inner-contents">
                            ${message.message.replace("\n", "<br>")}
                        </div>
                    </section>
                </li>`;
    }

    function deleteMessageDOM(messageID) {
        window.Babble.chatWindow.removeChild(document.getElementById("msg-" + messageID));
    }

    function addMessageDOM(message) {
        // dirty hack to create the element
        let messageDOM = htmlToDOM(getMessageHTML(message));

        // delete button
        let messageDelBtn = messageDOM.getElementsByClassName("js-deleteMsgBtn")[0];
        if (messageDelBtn) {
            messageDelBtn.addEventListener("click", function () {
                window.Babble.deleteMessage(message.id, function () { })
            });
        }

        // append to chat window
        window.Babble.chatWindow.appendChild(messageDOM);
        window.Babble.chatContainer.scrollTop = window.Babble.chatWindow.scrollHeight;
    }

    // events & loading
    function sendMessage(e, textarea) {
        e.preventDefault(); // prevent refresh

        if (textarea.value == "") {
            alert("You can't have an empty message");
            return;
        }

        let message = compileMessage(textarea.value);
        window.Babble.postMessage(message, function (data) {
            textarea.value = "";
            textarea.style.height = "auto";
        });
    }

    (function load() {
        // signup dialog
        let loginBtn = document.getElementById("js-loginBtn");
        let anonBtn = document.getElementById("js-stayAnonBtn");

        // login button event
        if (loginBtn) {
            loginBtn.addEventListener("click", function (e) {
                e.preventDefault();
                window.Babble.register({
                    name: document.getElementById("signup-fullname").value,
                    email: document.getElementById("signup-email").value
                });
                initiateLongPolls();
                document.getElementById("js-signupDialog").classList.add("u-hidden");
            });
        }

        // anon button event
        if (anonBtn) {
            anonBtn.addEventListener("click", function (e) {
                e.preventDefault();
                window.Babble.register({
                    name: "",
                    email: ""
                });
                initiateLongPolls();
                document.getElementById("js-signupDialog").classList.add("u-hidden");
            });
        }

        // new message form events
        let newMsgForm = document.getElementById("js-newMessage-form");
        let textarea = document.getElementById("newMessage-contents");
        if (newMsgForm && textarea) {
            newMsgForm.addEventListener("submit", e => sendMessage(e, textarea));
            autoResize(textarea, 100, 300);

            // load event listener
            window.addEventListener('load', function (event) {
                // load previous message
                textarea.value = session.currentMessage;

                // disable login if already logged in
                if (session.userInfo.email !== "") {
                    document.getElementById("js-signupDialog").remove();
                    window.Babble.register(session.userInfo);
                    initiateLongPolls();
                }
            });

            // unload event listener
            window.addEventListener('beforeunload', function (event) {
                window.Babble.updateCurrentMessage(textarea.value);
                navigator.sendBeacon("http://localhost:9000/logout", JSON.stringify({ uuid: session.uuid }));
            });
        }
    })();

    function initiateLongPolls() {
        // long polling for stats.
        (function long_poll_updates() {
            window.Babble.getStats(function (data) {
                window.Babble.statsMessages.innerHTML = data.messages;
                window.Babble.statsPeople.innerHTML = data.users;

                long_poll_updates();
            });
        })();

        // long polling for messages
        (function long_poll() {
            window.Babble.getMessages(counter, function (data) {
                if (data.delete) {
                    // delete from dom.
                    deleteMessageDOM(data.id);
                }
                else {
                    // update internal counter
                    counter += data.length;

                    // visuallly display on the DOM
                    data.forEach(function (message) {
                        addMessageDOM(message);
                    });

                }
                // call the next long poll
                long_poll();
            });
        })();
    }

})();
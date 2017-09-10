// main babble object.
(function () {
    debug = false;
    'use strict';
    window.Babble = function () {
        let session = {
            currentMessage: "",
            userInfo: {
                name: "",
                email: ""
            },
            uuid: ""
        };

        if (debug) {
            localStorage.clear();
        } else {
            session = JSON.parse(localStorage.getItem("babble"));
        }

        function getUUID() {
            ajax({
                method: "GET",
                action: "http://localhost:9000/uuid",
                success: function (data) {
                    session.uuid = data;
                }
            })
        }

        // if noting is in the local storage
        if (localStorage.getItem("babble") === null) {
            localStorage.setItem('babble', JSON.stringify(session));
        }

        let updateLocalStorage = function (userInfo) {
            session.userInfo.name = userInfo.name;
            session.userInfo.email = userInfo.email;
            localStorage.setItem('babble', JSON.stringify(session));
        };

        let updateCurrentMessage = function (messageContent) {
            session.currentMessage = messageContent;
            localStorage.setItem('babble', JSON.stringify(session));
        };

        let register = function (userInfo) {
            ajax({
                method: "POST",
                action: "http://localhost:9000/login",
                data: JSON.stringify({ uuid: session.uuid })
            })
            updateLocalStorage(userInfo);
        };

        let getMessages = function (counter, callback) {
            ajax({
                method: 'GET',
                action: 'http://localhost:9000/messages?counter=' + counter,
                success: function (data) {
                    callback(JSON.parse(data));
                }
            });
        };

        let postMessage = function (message, callback) {
            ajax({
                method: 'POST',
                action: 'http://localhost:9000/messages',
                data: JSON.stringify(message),
                success: function (data) {
                    console.log(data);
                    callback(JSON.parse(data));
                }
            });
        };

        let deleteMessage = function (id, callback) {
            ajax({
                method: 'DELETE',
                action: 'http://localhost:9000/messages/' + id,
                success: function (data) {
                    callback(JSON.parse(data));
                }
            });
        };

        let getStats = function (callback) {
            ajax({
                method: 'GET',
                action: 'http://localhost:9000/stats',
                success: function (data) {
                    callback(JSON.parse(data));
                }
            });
        };

        return {
            session: session,
            counter: 0,

            chatContainer: document.getElementById("js-chatContainer"),
            chatWindow: document.getElementById("js-chatWindow"),
            statsMessages: document.getElementById("js-stat-messages"),
            statsPeople: document.getElementById("js-stat-people"),

            register: register,
            getMessages: getMessages,
            postMessage: postMessage,
            deleteMessage: deleteMessage,
            getStats: getStats
        };
    }();

    /* GUI FUNCTIONS */

    function timeToTimestamp(date) {
        let hours = ("0" + date.getHours()).slice(-2);
        let minutes = ("0" + date.getMinutes()).slice(-2);
        return hours + ":" + minutes;
    }

    function getMessageHTML(message) {
        // handle timestamp
        let date = new Date(message.timestamp * 1);

        // handle button code
        let buttoncode = "";
        if (message.name !== "" && message.email !== "") {
            buttoncode = "\n<button class=\"Message-deleteBtn js-deleteMsgBtn\" aria-label=\"message\">X</button>";
            message.imageUrl = `http://localhost:9000/avatar/?mail=${message.email}`;
        } else {
            message.name = "Anonymous";
            message.imageUrl = "./images/anon.png";
        }

        // handle template code
        return `<li class="Message" id="msg-${message.id}">
                <img src="${message.imageUrl}" alt="" class="Message-image" />
                <section class="Message-inner">
                    <header class="Message-innerHead FlexGridRow">
                        <span class="Message-author">${message.name}</span>
                        <time class="Message-time" datetime="${date.toISOString()}">${timeToTimestamp(date)}</time>${buttoncode}
                    </header>
                    <div class="Message-inner-contents">
                        ${message.message}
                    </div>
                </section>
                </li>`;
    }

    function htmlToDOM(htmlStr) {
        let div = document.createElement("div");
        div.id = "lol";
        div.innerHTML = htmlStr;
        return div.firstElementChild;
    }

    function deleteMessageDOM(messageID) {
        window.Babble.chatWindow.removeChild(document.getElementById("msg-" + messageID));
        console.log(messageID);
    }

    // adds a message visually on the screen
    function addMessageDOM(message) {
        // dirty hack to create the element
        let messageDOM = htmlToDOM(getMessageHTML(message));

        // delete button
        let messageDelBtn = messageDOM.getElementsByClassName("js-deleteMsgBtn")[0];
        if (messageDelBtn) {
            messageDelBtn.addEventListener("click", function () {
                //deleteMessage(message.id);
                window.Babble.deleteMessage(message.id, function (data) {
                    console.log(data);
                })
            });
        }

        // append to chat window
        window.Babble.chatWindow.appendChild(messageDOM);
        window.Babble.chatContainer.scrollTop = window.Babble.chatWindow.scrollHeight;
    }

    // helper function to add auto-resize capabilities.
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

    // function that compiles a message
    function compileMessage(content) {
        return {
            name: window.Babble.session.userInfo.name,
            email: window.Babble.session.userInfo.email,
            message: content,
            timestamp: Date.now().toString(),
            id: 0
        };
    }

    function sendMessage(e, textarea) {
        e.preventDefault(); // prevent refresh

        if (textarea.value == "") {
            alert("You can't have an empty message");
            return;
        }

        let message = compileMessage(textarea.value);
        window.Babble.postMessage(message, function (data) {
            textarea.value = "";
        });
    }

    // a small ajax function. used to be a promise-based function
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
        xhr.send(options.data);
    }

    // function that registers certain events.
    (function load() {
        // signup dialog
        let dialog = document.getElementsByClassName("js-signupDialog")[0];
        let loginBtn = document.getElementsByClassName("js-loginBtn")[0];
        let anonBtn = document.getElementsByClassName("js-stayAnonBtn")[0];

        loginBtn.addEventListener("click", function (e) {
            window.Babble.register({
                name: document.getElementById("signup-fullname").value,
                email: document.getElementById("signup-email").value
            });
            dialog.close();
        });

        anonBtn.addEventListener("click", function (e) {
            window.Babble.register({
                name: "",
                email: ""
            });
            dialog.close();
        });

        // new message form events
        let newMsgForm = document.getElementById("js-newMessage-form");
        let textarea = document.getElementById("js-newMessage-content");
        newMsgForm.addEventListener("submit", e => sendMessage(e, textarea));
        autoResize(textarea, 100, 300);

        // event listeners
        window.addEventListener('load', function (event) {
            if (window.Babble.session.userInfo.email === "") {
                dialog.showModal();
            }
            else {
                window.Babble.register(window.Babble.session.userInfo);
            }
        });

        window.addEventListener('beforeunload', function (event) {
            navigator.sendBeacon("http://localhost:9000/logout", JSON.stringify({ uuid: window.Babble.session.uuid }))
        });
    })();

    // long polling for messages
    (function long_poll() {
        window.Babble.getMessages(window.Babble.counter, function (data) {
            if (data.delete) {
                // delete from dom.
                deleteMessageDOM(data.id);
            }
            else {
                // update internal counter
                window.Babble.counter += data.length;

                // visuallly display on the DOM
                data.forEach(function (message) {
                    addMessageDOM(message);
                });

            }
            // call the next long poll
            long_poll();
        });
    })();

    // long polling for stats.
    (function long_poll_updates() {
        window.Babble.getStats(function (data) {
            window.Babble.statsMessages.innerHTML = data.messages;
            window.Babble.statsPeople.innerHTML = data.users;

            long_poll_updates();
        });
    })();
})();
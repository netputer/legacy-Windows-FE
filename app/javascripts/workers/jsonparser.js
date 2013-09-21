this.onmessage = function (evt) {
    var resp = JSON.parse(evt.data);

    resp.state_line = resp.state_line || resp.state_code;

    this.postMessage(resp);
};

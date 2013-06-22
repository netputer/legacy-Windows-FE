onmessage = function(evt) {
    resp = JSON.parse(evt.data);
    
    resp.state_line = resp.state_line || resp.state_code;
    
    postMessage(resp);
};
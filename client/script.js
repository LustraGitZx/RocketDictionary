var request_http = null;

function input_mode(obj){
    document.getElementById('content').classList.add('content-darken');
    document.getElementById('button').classList.add('button-hidden'); 
    obj.classList.remove('search-hidden');
}

function exit_input_mode(obj){
    document.getElementById('content').classList.remove('content-darken');
    document.getElementById('button').classList.remove('button-hidden'); 
    obj.classList.add('search-hidden');
}

function search_mode(){
    document.getElementById('search-loader').classList.add("search-loader-shown");
}

function exit_search_mode(){
    document.getElementById('search-loader').classList.remove("search-loader-shown");
    if(request_http != null)
        request_http.abort();
}

function send_request(element){
    if (event.key === "Enter") {
        const word = element.value;
        if (word == "" && word.length > 20)
            return;
        
        if(request_http != null)
            request_http.abort()
        
        request_http = new XMLHttpRequest();
        const url= window.location.protocol + "//" + window.location.host + "/search?word="+word.replace(' ','');
        request_http.onreadystatechange = (e) => {
            if (request_http.readyState === XMLHttpRequest.DONE) {
                if(request_http.status === 200){
                    const responce = JSON.parse(request_http.response);
                    console.log(responce, typeof(responce));
                    if(responce == 0){
                        document.getElementById("word").textContent = '#NOT_FOUND';
                        document.getElementById("transcription").textContent = '';
                    }else{
                        document.getElementById("word").textContent = word;
                        document.getElementById("transcription").textContent = responce;
                    }
                }
                request_http.abort();
                exit_search_mode();
            }
        }

        request_http.open("GET", url);
        request_http.send();
        
        element.value = '';
        element.blur();
        
        search_mode();
    }
}
import sqlite3 from 'sqlite3';
import express from 'express';
import path from 'path';
import got from 'got';
import {parse} from 'node-html-parser';
import trscr_to_ssbe from './lib/translator.js'

const sqlite = sqlite3.verbose();
const db = new sqlite3.Database('wordbank.db');

const app = express();
async function get_html(url){
    var response = await got(url);
    while (true) {
        if (response.redirectUrls.length > 0)
            response = await got(response.redirectUrls[0].href);
        else
            return response.body;
    }
}

function parse_transcription(html){
    const arr =  parse(html).querySelector('.phons_br .phon');
    if (arr == null)
        return null;
    return arr.text.slice(1, -1);
}

function get_rp_transcription(word, callback){
    const url = `https://www.oxfordlearnersdictionaries.com/search/english/direct/?q=${word}`;
    get_html(url).then(parse_transcription).then(trscr => {callback(trscr)});
}


function get_from_oxford_dict(word, callback){

    get_rp_transcription(word, (trscr)=>{
        if (trscr == null){
            callback (null);
            return;
        }
        callback( trscr_to_ssbe(trscr))
    });

}

function add_to_local_base(word, trscr){
    db.run(`INSERT INTO WORDS (word, transcription) VALUES ('${word}', '${trscr}')`);
}

function get_form_local_base(word, callback){

    db.serialize(() => {

        db.get(`SELECT * FROM words where word='${word}'`, (err, row) => {
            if(row == undefined){
                callback(null);
                return;
            }
            callback(row.transcription);
        });
    
    });


}

function get_transcription(word, callback){
    
    get_form_local_base(word, (trscr)=>{
        if(trscr == null){
            get_from_oxford_dict(word, (trscr)=>{
                if(trscr == null){
                    callback(null);
                }else{
                    add_to_local_base(word, trscr);
                    console.log(`'${word}' has been added with transcription '${trscr}'`);
                    callback(trscr);
                }
            });
        }else{
            console.log(`'${word}' from local base '${trscr}'`);
            callback(trscr);
        }
    });
}


app.use(express.static(path.join(path.resolve(), '/client')));

app.get("/", (req, res) => {
    res.sendFile(path.join(path.resolve(), '/client/index.html'));
});

app.get("/search", (req, res) => {
    get_transcription(req.query.word.toLowerCase(),(trscr)=>{
        if(trscr == null)
            res.send(JSON.stringify(0));
        else
            res.send(JSON.stringify(trscr));
    });
});


app.listen(3000, "127.0.0.1"); //120.0.0.1
console.log("#The server has been started !");
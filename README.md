# RocketDictionary
![alt text](https://github.com/LustraGitZx/RocketDictionary/blob/main/Header.jpg?raw=true)
Translates phonetc transcription from RP accent to SSBE accent\
Dont forget to install packages after cloning the project\
type "npm install" in ther root folder of project


## How it works?
The algorithm is simple:
1. User inputs a word
2. Server serches for this word in local dictionary
   1. If the word is in a local dictionary server sends the result.
   2. Else server makes a request to Oxford dictionary
      1. If the word exist in Oxford Dictionary it translates to SSBE transcriptio and adds to local dictionary
      2. Else server return "The word doesn't exist" answer

## Check the new version out 
https://github.com/LustraGitZx/HummingBird/tree/master

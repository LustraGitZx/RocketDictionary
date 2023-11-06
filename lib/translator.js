class Sound { 

    static type = {
        vowel     : 0,
        consonant : 1,
        diphthong : 2
    }

    static stress = {
        primary   : 0,
        secondary : 1,
        none      : 2
    }

    constructor( char, type, long = false, stress = Sound.stress.none ){
        this.char = char;
        this.type = type;
        this.long = long;
        this.stress = stress;
    }

    get_char(){ return this.long ? this.char + "ː" : this.char ; }
}



function remove_parentheses(trscr){
    return trscr.replace(/\(.\)/gi, '');
}

function get_stressed_sound_id (arr, stress){
    for (let i = 0; i < arr.length; i++){
        if (arr[i].stress == stress)
            return i;
    }
    return null;
}


function get_syllable_number(sound_array){
    let counter = 0;
    for (let sound of sound_array)
        if (sound.type != Sound.type.consonant)
            counter++;
    return counter
} 

function sound_array_to_string(arr){
    let str = '';
    for (var i = 0; i < arr.length; i++){
        const s = arr[i];

        if (s.type == Sound.type.diphthong && s.stress != Sound.stress.none){
            str += `${s.char[0]}\u0301${s.char[1]}`;
        }
        else if (s.type != Sound.type.consonant && s.stress != Sound.stress.none)
            str += s.char+`\u0301`;
        else
            str += s.char;

        if (s.long)
            str += 'ː';
    }

    return str;
}



function parse_sounds(trscr){
    const DIPHTHONGS          = ['eɪ','əʊ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə'];
    const VOWELS              = ['ʌ','ɑ','æ','e','ə','ɑ','ɒ','ɔ','ʊ','u','ɜ','i','ɪ'];
    const CONSONANTS          = ['p','b','t','d','k','ɡ','f','v','θ','ð','s','z','h','m','n','ŋ','l','r','j','w','ʃ','ʒ'];
    const TWO_CHAR_CONSONANTS = ['tʃ','dʒ']; // t͡ʃ d͡ʒ
    const SIGNS = ['ː', 'ˈ', 'ˌ'];

    let sounds = [];

    let pr_stress_f = null;
    let sc_stress_f = null;

    for (let i = 0; i < trscr.length; i++){
        const char = trscr[i];
        const n_char = i + 1 < trscr.length ? trscr[i + 1] : null;

        if (SIGNS.includes(char)){
            if (char == 'ˈ')
                pr_stress_f = true;
            else if (char == 'ˌ'){
                sc_stress_f = true;
            }
            continue;
        }
           

        if (n_char == null || SIGNS.includes(n_char)){

            if (n_char == "ː"){
                if (VOWELS.includes(char)){
                    sounds.push(new Sound(char, Sound.type.vowel, true));
                }
            }
            else if (VOWELS.includes(char))
                sounds.push(new Sound(char, Sound.type.vowel));
            else if (CONSONANTS.includes(char))
                sounds.push(new Sound(char, Sound.type.consonant));

        }else{

            if (DIPHTHONGS.includes(char + n_char)){
                sounds.push(new Sound(char + n_char, Sound.type.diphthong));
                i++;
            }
            else if (VOWELS.includes(char))
                sounds.push(new Sound(char, Sound.type.vowel));
            else if (TWO_CHAR_CONSONANTS.includes(char + n_char)){
                sounds.push(new Sound(char + n_char, Sound.type.consonant));
                i++;
            }
            else if (CONSONANTS.includes(char))
                sounds.push(new Sound(char, Sound.type.consonant));
        }

        if (pr_stress_f || sc_stress_f){
            const last_sound = sounds[sounds.length - 1];

            if (last_sound.type != Sound.type.consonant){
                if (pr_stress_f){
                    last_sound.stress = Sound.stress.primary;
                    pr_stress_f = false;
                }
                else{
                    last_sound.stress = Sound.stress.secondary;
                    sc_stress_f = false;
                }                
            }
        }
    }


    if (pr_stress_f == null){
        for (let i = 0; i < sounds.length; i++){
            const sound = sounds[i];
            if (sound.type != Sound.type.consonant){
                sound.stress = Sound.stress.primary;
                break;
            }
        }
    }

    return sounds;
}

function sounds_to_ssbe(sound_array){
    let new_sounds_array = [];        

    for(let i = 0; i < sound_array.length; i++){
        const p_sound = i - 1 >= 0 ? sound_array[i - 1] : null;
        const sound   = sound_array[i];
        const n_sound = i + 1 <= sound_array.length? sound_array[i + 1] : null;

        if (sound.char == 'p' || sound.char == 't' || sound.char == 'k'){

            if (n_sound == null){
                new_sounds_array.push(new Sound(sound.char, Sound.type.consonant));
                continue;
            }

            if (sound.char == 't'){
                if (n_sound.char == 'j'){
                    new_sounds_array.push(new Sound('t͡ʃ', Sound.type.consonant));
                    i++;
                    continue;
                }else if(n_sound.char == 'r'){
                    new_sounds_array.push(new Sound('t͡ʃ', Sound.type.consonant));
                    continue;
                }
            }

            if (p_sound == null || p_sound.char != 's'){
                if(n_sound.stress != Sound.stress.none ){
                    new_sounds_array.push(new Sound(sound.char + 'ʰ', Sound.type.consonant));
                    continue;
                }
            }

            new_sounds_array.push(new Sound(sound.char, Sound.type.consonant));
            continue;
        }

        else if (sound.char == 'd'){
            if (sound.n_char == 'j'){
                new_sounds_array.push(new Sound('d͡ʒ', Sound.type.consonant));
                i++;
            }else if(sound.n_char == 'r')
                new_sounds_array.push(new Sound('d͡ʒ', Sound.type.consonant));
        }
        else if (sound.char == 'l' ){
            if (n_sound == null){
                new_sounds_array.push(new Sound('ɫ', Sound.type.consonant));
                continue;
            }else if(n_sound.type == Sound.type.consonant){
                new_sounds_array.push(new Sound('ɫ', Sound.type.consonant));
                continue;
            }
        }
        else if (sound.char == 'r'){
            new_sounds_array.push(new Sound('ɹ', Sound.type.consonant));
            continue;
        }
        else if (sound.char == 'e'){
            new_sounds_array.push(new Sound('ɛ', Sound.type.vowel, sound.long, sound.stress));
            continue;
        }
        else if (sound.char == 'ɒ'){
            new_sounds_array.push(new Sound('ɔ', Sound.type.vowel, sound.long, sound.stress));
            continue;
        }
        else if (sound.char == 'æ'){
            new_sounds_array.push(new Sound('a', Sound.type.vowel, sound.long, sound.stress));
            continue;
        }
        else if (sound.char == 'ʊ'){
            new_sounds_array.push(new Sound('ɵ', Sound.type.vowel, sound.long, sound.stress));
            continue;
        }
        else if (sound.char == 'ɪə'){
            new_sounds_array.push(new Sound('ɪ', Sound.type.vowel, true, sound.stress));
            continue;
        }
        else if (sound.char == 'eə'){
            new_sounds_array.push(new Sound('ɛ', Sound.type.vowel, true, sound.stress));
            continue;
        }
        else if (sound.char == 'ʊə'){
            new_sounds_array.push(new Sound('ɵ', Sound.type.vowel, true, sound.stress));
            continue;
        }
        else if (sound.char == 'ɜ'){
            new_sounds_array.push(new Sound('ə', Sound.type.vowel, true, sound.stress));
            continue;
        }
        else if (sound.char == 'ɔ'){
            new_sounds_array.push(new Sound('o', Sound.type.vowel, sound.long, sound.stress));
            continue;
        }
        else if (sound.char == 'i' ){
            new_sounds_array.push(new Sound('ij', Sound.type.diphthong, false, sound.stress));
            continue;
        }
        else if (sound.char == 'eɪ'){
            new_sounds_array.push(new Sound('ɛj', Sound.type.diphthong, sound.long, sound.stress));
            continue;
        }
        else if (sound.char == 'aɪ'){
            new_sounds_array.push(new Sound('ɑj', Sound.type.diphthong, sound.long, sound.stress));
            continue;
        }
        else if (sound.char == 'ɔɪ'){
            new_sounds_array.push(new Sound('oj', Sound.type.diphthong, sound.long, sound.stress));
            continue;
        }
        else if (sound.char == 'aʊ'){
            new_sounds_array.push(new Sound('aw', Sound.type.diphthong, sound.long, sound.stress));
            continue;
        }
        else if (sound.char == 'u' && sound.long){
            new_sounds_array.push(new Sound('ʉw', Sound.type.diphthong, false, sound.stress));
            continue;
        }
        else if (sound.char == 'əʊ'){
            new_sounds_array.push(new Sound('əw', Sound.type.diphthong, sound.long, sound.stress));
            continue;
        }

        //defoult;
        new_sounds_array.push( new Sound(sound.char, sound.type, sound.long, sound.stress) ); 
    }

    return new_sounds_array;
}

function trscr_to_ssbe(trscr){

    
    let rp = parse_sounds(remove_parentheses(trscr));
    let ssbe = sounds_to_ssbe(rp);
    return sound_array_to_string(ssbe)
}


export default trscr_to_ssbe


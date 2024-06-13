const stages = ["animal_vs_plant","duplicacy","field","strokes","basic_vs_gre","prime_number","same_tones","italian_vs_swedish","clock_angle","number_existence","circles","verb_vs_noun","dactyla","duplicacy_count","environmental","strokes_difference","education","prime_polynomial","third_tone","sinhala","three_hands","number_related_time","topology","grammar"];
const utage_stages = ["repetition","parity_of_lv","black_magic","meta_puzzle","ting_pai","ting_pai_hard","dou_di_zhu","number_with_count"];

function save(state) {
    let completion = bools_to_int(stages.map( lv => state.variablesState[lv + "_win"] > 0 ));
    let utage_completion = bools_to_int(utage_stages.map( lv => state.variablesState[lv + "_win"] > 0 ));
    let final_win = state.variablesState.final_win ? 1 : 0;
    let header = state.variablesState.header ?? 0;
    let highest_header_unlocked = state.variablesState.highest_header_unlocked ?? 0;
    let speed = state.variablesState.speed ?? 2;
    let lifetime_answered = state.variablesState.lifetime_answered ?? 0;
    let lifetime_correct = state.variablesState.lifetime_correct ?? 0;
    let list_page = state.variablesState.list_page ?? 1;
    let god_mode = state.variablesState.god_mode ? 1 : 0;
    let final_progress = state.variablesState.in_dark ? (state.variablesState.final_progress ?? 1) : 0;
    return [completion, utage_completion, final_win, header, highest_header_unlocked, speed, lifetime_answered, lifetime_correct, list_page, god_mode, final_progress].toString();
}

function load(state, str) {
    let [completion, utage_completion, final_win, header, highest_header_unlocked, speed, lifetime_answered, lifetime_correct, list_page, god_mode, final_progress] = str.split(',').map(Number);
    let completion_list = int_to_bools(completion, stages.length);
    for (i = 0; i < stages.length; i++) {
        state.variablesState[stages[i] + "_win"] = completion_list[i] ? 1 : 0;
    }
    let utage_completion_list = int_to_bools(utage_completion, utage_stages.length);
    for (i = 0; i < utage_stages.length; i++) {
        state.variablesState[utage_stages[i] + "_win"] = utage_completion_list[i] ? 1 : 0;
    }
    state.variablesState.final_win = final_win == 1;
    state.variablesState.header = header;
    state.variablesState.highest_header_unlocked = highest_header_unlocked;
    state.variablesState.speed = speed;
    state.variablesState.lifetime_answered = lifetime_answered;
    state.variablesState.lifetime_correct = lifetime_correct;
    state.variablesState.list_page = list_page;
    state.variablesState.god_mode = god_mode == 1;
    state.variablesState.in_dark = final_progress != 0;
    state.variablesState.final_progress = final_progress;
    if (final_win) {
        state.variablesState["meta_key"] = meta_key;
    }
    if (final_progress != 0) {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

function bools_to_int(boolArray) {
    let result = 0;
    for (let i = 0; i < boolArray.length; i++) {
        result |= (boolArray[i] ? 1 : 0) << i;
    }
    return result;
}
function int_to_bools(integer, length) {
    let boolArray = [];
    for (let i = 0; i < length; i++) {
        boolArray.push((integer & (1 << i)) !== 0);
    }
    return boolArray;
}

/*
Example State
state = 
{
   "flows":{
        ...
   },
   "currentFlowName":"DEFAULT_FLOW",
   "variablesState":{
      "lv":{
         "^->":"animal_vs_plant"
      },
      "lv_num":"^1",
      "ans":"^B",
      "resp":"^B",
      "word":"^兔",
      "bword":"^<span class=\"word\">兔</span>",
      "winflag":true,
      "count":10,
      "total":1,
      "lifetime_answered":1,
      "lifetime_correct":1,
      "classA":"^<span class=\"classA\">甲类</span>",
      "classB":"^<span class=\"classB\">乙类</span>",
      "classC":"^<span class=\"classC\">丙类</span>",
      "version_is_shown":true
   },
   "evalStack":[],
   "visitCounts":{
      "":1,
      "main_menu":1,
      "main_menu.0.c-2":1,
      "lv_list":1,
      "unlock_header_test":1,
      "win_count":1,
      "utage_win_count":1,
      "normal_win_count":2,
      "center":1,
      "lv_list.page_1":1,
      "animal_vs_plant.selection":1,
      "animal_vs_plant":3,
      "dactyla.selection":1,
      "dactyla":1,
      "duplicacy.selection":1,
      "duplicacy":1,
      "duplicacy_count.selection":1,
      "duplicacy_count":1,
      "field.selection":1,
      "field":1,
      "environmental.selection":1,
      "environmental":1,
      "strokes.selection":1,
      "strokes":1,
      "strokes_difference.selection":1,
      "strokes_difference":1,
      "lv_list.meta_page":1,
      "lv_list.page_targeting":1,
      "final_story.selection":1,
      "final_story":1,
      "color":1,
      "final_unlock":1,
      "lv_list.back_to_menu":1,
      "animal_vs_plant.selection.0.c-0":1,
      "animal_vs_plant.selection.0.g-0":1,
      "lv_target":1,
      "game_cycle":1,
      "game_cycle.8":1,
      "question":1,
      "question.0.c-1":1,
      "question.0.g-0":1,
      "question.answered_right":1,
      "animal_vs_plant.win":1,
      "animal_vs_plant.win.0.c-0":1
   },
   "turnIndices":{
      "main_menu":-1,
      "animal_vs_plant":2,
      "dactyla":0,
      "duplicacy":0,
      "duplicacy_count":0,
      "field":0,
      "environmental":0,
      "strokes":0,
      "strokes_difference":0
   },
   "turnIdx":3,
   "storySeed":52,
   "previousRandom":0,
   "inkSaveVersion":9,
   "inkFormatVersion":20
}
*/
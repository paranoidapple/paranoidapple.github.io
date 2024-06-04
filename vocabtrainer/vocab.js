const btns = $(".multi-choice-btn");
const focus = $("#focus-word");
const sliders = $(".slider");
const sliderValues = $(".slider-value");

var pool;
var answer;

async function getVocab() {
  const resp = await fetch("vocabtrainer/vocab.json");
  return resp.json();
}

let VOCAB;

getVocab().then((vocab) => {
  VOCAB = vocab;
  regenButtons();

  $(btns).on("click", function() {
    if ($(this).text() === answer) {
      $(this).addClass("correct");
      regenButtons();
    }
    else {
      $(this).addClass("disabled");
    }
  });

  // Refresh on slider update
  $(sliders).on("input", function() {
    $(this).siblings(".slider-value").val($(this).val());
    regenButtons();
  });
  $(sliderValues).on("input", function() {
    $(this).siblings(".slider").val($(this).val());
    regenButtons();
  });
});

function getConstraints() {
  let constraints = {}
  $(sliders).each(function() {
    constraints[$(this).attr("id")] = [Number($(this).attr("min")), Number($(this).val())];
  });
  return constraints;
}

function generatePool() {
  const constraints = getConstraints();
  const columnConstraints = Object.fromEntries(Object.entries(constraints).slice(0, 4));
  const maxPages = Object.values(constraints)[4][1];

  // Merge all words within constraints
  let newPool = {};
  for (const column of Object.keys(columnConstraints)) {
    for (const pageNo of Object.keys(VOCAB[column])) {
      if (pageNo <= maxPages) {
        _.merge(newPool, {[pageNo]: 
          Object.fromEntries(Object.entries(VOCAB[column][pageNo]).slice(columnConstraints[column][0], columnConstraints[column][1]))
        });
      }
    }
  }
  
  // Remove empty keys
  for (const k in newPool) {
    if (Object.keys(newPool[k]).length === 0) {
      delete newPool[k];
    }
  }

  pool = newPool;
  console.log(pool);
}

function regenButtons() {

  // Generate pool; fill pool up if it's completely empty
  generatePool();
  if (_.isEmpty(pool)) {
    $(".slider").each(function() {
      $(this).val($(this).attr("max"));  // Does't trigger "input" event
      $(this).trigger("input");
    });
    generatePool();
  }

  let sampledPages = []
  for (i = 0; i < 4; i++) {
    sampledPages.push(_.sample(Object.keys(pool)));  // Don't use sampleSize b/c it doesn't allow repeated keys
  }
  let sampledPairs = {};

  // Generate pairs to use in buttons
  sampledPages.forEach(key => {
    let randomWord = _.sample(Object.keys(pool[key]));
    Object.assign(sampledPairs, {[randomWord]: pool[key][randomWord]});
  });

  btns.each(function(i) {
    // Remove button styles
    $(this).removeClass("disabled");
    setTimeout(() => {
      $(this).removeClass("correct");
    }, "200");
    
    // Replace button text
    definition = Object.values(sampledPairs)[i];
    if (definition === undefined) {
      $(this).html("n/a");
    }
    else {
      $(this).html(definition);
    }
  });

  // Choose a correct word-answer pair & update
  let correctKey = Math.floor(Math.random() * (_.size(sampledPairs) - 1));
  let word = Object.keys(sampledPairs)[correctKey];
  answer = Object.values(sampledPairs)[correctKey];
  $(focus).html(word);
}

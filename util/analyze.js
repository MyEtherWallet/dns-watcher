
const fs = require("fs");

analyzeErrors();
function analyzeErrors(){
    let errors = require("./errors");
    let hist = {};
    for(let i=0; i<errors.length; i++){
        let runErrors = errors[i].errors;
        for(let j=0; j<runErrors.length; j++){
            // console.log(runErrors[j]);
            if(hist[runErrors[j].IP]){
                hist[runErrors[j].IP] = hist[runErrors[j].IP] +1;
            } else {
                hist[runErrors[j].IP] = 1;
            }
        }
    }
    // console.log(hist);
    writeResults(hist);
}



function writeResults(results){
    fs.writeFile('error_counts.json',  JSON.stringify(results), (err) => {
        if (err) throw err;
    });
}
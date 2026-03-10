const Vote = require("../models/Vote-model");





async function getVoteValue( postId , userId ) {
  try {

    const voteValue = await Vote.findOne({ postId , userId}).lean();
  
    // console.log("voteservie1", voteValue)
    // console.log("voteservie2", typeof voteValue)
    // console.log("voteservie2", voteValue == "null")
    // console.log("voteservie2", voteValue == null)
  
    if (voteValue === null){
      return undefined
    }
    else{
      return voteValue.value;
    }
  }
  catch{
    console.log("error: getVoteValue - no postId or on userId receieved")
    return undefined
  }

}


module.exports = {
  getVoteValue
};

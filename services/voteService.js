const Vote = require("../models/Vote-model");





async function getVoteValue( postId , userId ) {
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


module.exports = {
  getVoteValue
};

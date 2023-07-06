// Create a new word in the database
Router.post("/word", async (request, response) => {
  // Extract the word from the request body
  const { word } = request.body;

  // Create a new instance of the Word model with the given word
  const newWord = new WordModel({ word });

  try {
    // Attempt to save the new word in the database
    await newWord.save();
    // If successful, return a success message
    response.status(201).json({ msg: "Word added successfully" });
  } catch (error) {
    // If there was an error, return the error
    response.status(500).json({ error: error.message });
  }
});

// Get a word from the database by ID
Router.get("/word/:id", async (request, response) => {
  // Extract the id from the request parameters
  const { id } = request.params;

  try {
    // Attempt to find the word in the database by id
    const word = await WordModel.findOne({ _id: id });
    // If successful, return the word
    response.status(200).json({ word });
  } catch (error) {
    // If there was an error, return the error
    response.status(500).json({ error: error.message });
  }
});

// Update a word in the database by ID
Router.put("/word/:id", async (request, response) => {
  // Extract the id from the request parameters
  const { id } = request.params;
  // Extract the new word from the request body
  const { word } = request.body;

  try {
    // Attempt to update the word in the database
    await WordModel.updateOne({ _id: id }, { word });
    // If successful, return a success message
    response.status(200).json({ msg: "Word updated successfully" });
  } catch (error) {
    // If there was an error, return the error
    response.status(500).json({ error: error.message });
  }
});

// Delete a word from the database by ID
Router.delete("/word/:id", async (request, response) => {
  // Extract the id from the request parameters
  const { id } = request.params;

  try {
    // Attempt to delete the word in the database
    await WordModel.deleteOne({ _id: id });
    // If successful, return a success message
    response.status(200).json({ msg: "Word deleted successfully" });
  } catch (error) {
    // If there was an error, return the error
    response.status(500).json({ error: error.message });
  }
});

// Verify a word against a game's target word
Router.post("/verif", isLogged, async (request, response) => {
  // Extract the attempted word and the game ID from the request body
  const { word, gameId } = request.body;

  try {
    // Attempt to find the game in the database
    const game = await GameModel.findOne({ _id: gameId }).populate("word");

    // If the game could not be found, return an error message
    if (!game) {
      return response.status(404).json({ msg: "Game not found" });
    }

    // Extract the target word from the game
    const targetWord = game.word.word;
    // Generate a score for the attempted word
    const result = generateScore(targetWord, word);

    // Add the attempted word and the score to the game's tries
    game.tries.push({ word, result });
    // Save the game's state with the new attempt
    await game.save();

    // Return the word, the score, and the game's state
    response.status(200).json({
      word,
      response: result,
      game,
    });
  } catch (error) {
    // If there was an error, return the error
    response.status(500).json({ error: error.message });
  }
});

// Function to generate a score for an attempted word against a target word
function generateScore(target, attempt) {
  let score = "";
  // Loop through each character in the target word
  for (let i = 0; i < target.length; i++) {
    // If the character in the attempt is the same as in the target
    if (target[i] === attempt[i]) {
      // Add '1' to the score
      score += "1";
      // Else if the character in the attempt is in the target (but not at the same position)
    } else if (target.includes(attempt[i])) {
      // Add '0' to the score
      score += "0";
      // Else (the character in the attempt is not in the target)
    } else {
      // Add 'x' to the score
      score += "x";
    }
  }
  // Return the score
  return score;
}

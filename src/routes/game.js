const express = require('express');
const WordModel = require('../models/word');
const GameModel = require("../models/game");

const Router = express.Router();

const isLogged = (request, response, next) => {
    if (request.session.user) {
        console.log('test');
        next();
    } else {
        return response.status(500).json({ 'msg': "not logged !" })
    }
}

Router.post('/', async (request, response) => {
    const word = await WordModel.aggregate([{
        $sample: { size: 1 }
    }]);

    let game = new GameModel({
        word: word[0]._id,
        tries: [],
        user: request.session.user._id
    });

    try {
        await game.save();

        game = await GameModel.find({
            _id: game._id
        }).populate('user').populate('word')

        return response.status(200).json({
            "msg": game
        });
    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
});

Router.get('/:id', async (request, response) => {
    const { id } = request.params;

    try {
        const game = await GameModel.findOne({ _id: id });

        return response.status(200).json({
            "msg": game
        });
    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
})

Router.post('/verif', isLogged, async (request, response) => {
    // get the value from the user
    const { word, gameId } = request.body;
    try {
        // Attempt to find the game in the database
        const game = await GameModel.findOne({ _id: gameId }).populate("word");

        // If the game could not be found, return an error message
        if (!game) {
            return response.status(404).json({ msg: "Game not found" });
        }

        // get the value searched by getting the game
        const search = game.word.name.toLowerCase();

        if (typeof request.body.word === 'undefined') {
            return response.status(500).json({
                "msg": "You have to send 'word' value"
            });
        }

        const lowerCaseWord = word.toLowerCase();
        // make the verification
        let responseWord = '';
        if (search.length === lowerCaseWord.length) {
            for (let i = 0; i < search.length; i++) {
                if (lowerCaseWord[i] === search[i]) {
                    responseWord += '1';
                } else if (search.includes(lowerCaseWord[i])) {
                    responseWord += '0';
                } else {
                    responseWord += 'x';
                }
            }
        } else {
            return response.status(500).json({
                "msg": "The word length must be " + search.length.toString()
            });
        }

        return response.status(500).json({
            "word": lowerCaseWord,
            "response": responseWord,
            "game": game
        });

    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
})

module.exports = Router;
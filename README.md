# Charade Game 🎭

Welcome to the **Charade Game**, a fun and interactive way to test your guessing skills! This project allows you to create teams, set a timer, and start an engaging game of charades with your friends and family.

## Features ✨

- **Team Creation:** Divide players into teams for friendly competition.
- **Set Timer:** Customize the round duration to keep the game challenging and fair.
- **Start the Game:** Kick off the fun with a user-friendly interface that tracks turns and scores.

## Start the game
To start the game just run the following:

```npm install```

```npm start```

## Adding Pictures 🖼️

To make the game more dynamic, you can add your custom images to be used as clues in the game. Here’s how:

3. **Add Pictures to the Raw Folder:**
    - Place your images in the `pictures/raw` directory.

4. **Run the `addTextToImage` Script:**
    - The `addTextToImage` script automatically processes your images.
    - It adds the image's filename at the bottom of the picture to indicate its meaning.
    - This makes it clear what mime act needs to be passed.

   Command to run the script:
    ```bash
   cd scripts
   node addTextToImage.js
   ```

5. **Processed Images:**
    - The script outputs the updated images to the `pictures/result` directory.
    - The `pictures/result` directory is used by the UI to display the images during the game.

## Folder Structure 📁

```js
charade-game/
├── pictures/
│   ├── raw/        # Add your raw images here
│   ├── result/     # Processed images are stored here
├── scripts/
│   └── addTextToImage.js  # Script to process images
├── README.md       # Documentation
└── ...            # Other files and folders
```
## How to Play 🎮

1. **Set Up Teams:**
    - Divide the players into teams using the interface.

2. **Start the Timer:**
    - Choose the round duration and hit start.

3. **Act and Guess:**
    - A player acts out the clue shown in the image without speaking.
    - Their teammates guess the correct word or phrase based on the mime.

4. **Score Points:**
    - Keep track of the score for each team and see who wins!

## Contributing 🤝

Feel free to contribute by:
- Adding new features.
- Improving the script functionality.
- Creating a better UI for the game.

Pull requests are always welcome! 🎉

---

Enjoy the game, and may the best team win! 🏆 

Omer S.

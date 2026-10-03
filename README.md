# Sudoku

A clean, responsive Sudoku game for the web. Choose a difficulty, fill in the grid, and play with a mouse, touchscreen, or keyboard.

## Features

- Three difficulty levels: Easy, Medium, and Hard
- Randomized puzzles with a unique solution
- Responsive layout for desktop and mobile
- On-screen number pad and keyboard input
- Pencil notes, mistake tracking, hints, and board checking
- Timer and completion dialog
- No build step, server, or package installation required

## Play online

Once GitHub Pages is enabled, open the published link shown under **Repository → Settings → Pages**.

## Run locally

Open `index.html` in a modern browser, or start a local web server from this folder:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## How to play

1. Select a difficulty and start a new game.
2. Select an empty square.
3. Enter a number using the on-screen keypad or the `1`–`9` keys.
4. Use the arrow keys to move between squares. Press `Backspace`, `Delete`, or `0` to clear a square.
5. Turn on **Notes** to pencil in possible numbers. Use **Hint** or **Check my board** when needed.

Each row, column, and 3 × 3 box must contain the numbers 1 through 9 exactly once.

## Publish with GitHub Pages

1. Upload the contents of this folder to the root of a GitHub repository. Keep `index.html`, `styles.css`, and `script.js` together in the repository root.
2. Push or commit the files to the `main` branch.
3. Open **Settings → Pages** in the repository.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
5. After deployment, use the website link shown on the Pages settings screen.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Game page and interface |
| `styles.css` | Layout, styling, and responsive design |
| `script.js` | Puzzle generation and game logic |
| `LICENSE` | MIT License |
| `.gitignore` | Ignore rules for common local clutter |

## Technology

Built with HTML, CSS, and vanilla JavaScript. Google Fonts are used when available; system fonts are used as a fallback. No third-party JavaScript libraries are required.

## License

Released under the [MIT License](LICENSE).

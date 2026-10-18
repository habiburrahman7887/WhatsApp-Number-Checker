# WhatsApp Number Checker

A small static web app that helps you check a phone number before messaging it on WhatsApp, and gives a risk checklist for the person behind it.

## Features

- Country code dropdown with flags. Bangladesh (+880) is pinned at the top and selected by default.
- Auto country detection: type a number that starts with + or 00 and the country is selected for you.
- One-tap "Open WhatsApp chat" link (wa.me). If WhatsApp says the number is invalid, the number is not on WhatsApp.
- Risk checklist with an animated gauge. Each ticked warning sign adds points.
- Scammer List: mark a number, and it is saved in your browser. The app warns you when you check that number again.

## Important limits

- The app cannot detect WhatsApp registration automatically. Browsers cannot read the wa.me page, and WhatsApp has no public lookup. You confirm by opening the chat.
- The risk meter does not decide whether someone is a scammer. It only adds up the signs you tick.
- The Scammer List is stored separately in each browser. Clearing browser data removes it.

## Run locally

Open `index.html` in a browser. There is no build step and no dependencies.

## Deploy on GitHub Pages

1. Create a public repository. Public is required for GitHub Pages on a free account.
2. Upload all files, keeping the folder structure (`assets/` included).
3. Go to Settings > Pages.
4. Under "Build and deployment", choose "Deploy from a branch", select `main` and `/ (root)`, then Save.
5. After a minute or two the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Project structure

- `index.html`: page markup
- `styles.css`: styling and gauge animation
- `app.js`: search, checklist, and Scammer List logic
- `countries.js`: country names and dialing codes
- `assets/grid.jpg`: background image

## Privacy

There is no server and no analytics. Numbers you enter stay in your browser. The Scammer List is saved only in local storage on that device, and it is not part of this code.

## License

No license is set yet. Add a `LICENSE` file if you want to define terms for reuse.

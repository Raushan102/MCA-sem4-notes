# MCA Sem IV Notes: MERN app
Express + React (Vite) + optional MongoDB (Mongoose). Notes live in `content/<subject>/unit-N.html`; subjects and unit titles in `server/config.js`.

## Run locally (no database needed)
    npm install && npm run build && npm run seed && npm start      # http://localhost:3000

## Use MongoDB (e.g. free Atlas cluster)
    export MONGODB_URI="mongodb+srv://..."   # then:
    npm run seed      # uploads every note into MongoDB
    npm start         # now served from the database

## Add / update notes
1. Drop the file in `content/<subject>/` and set its file name in `server/config.js` (replace `null`).
2. `npm run seed` then restart.

## Deploy (Render / Railway / Fly)
Build command: `npm install && npm run build && npm run seed`   Start command: `npm start`   Env: MONGODB_URI (optional)

## Change the background photo / video
Put your image in `client/public/bg.jpg` (a wide 2560px+ photo looks sharpest). For a video, put `bg.mp4` in `client/public` and set `BG.video='/bg.mp4'` in `client/src/App.jsx`. Then `npm run build`.
Designed & developed by Raushan Kumar Saw.

## Deploy on Netlify (static, no server needed)
`netlify.toml` is already set up. Push the repo to GitHub, then in Netlify: Add new site → Import from Git → pick the repo → Deploy.
Build command: `npm install && npm run build:static`   Publish directory: `client/dist`   (both are read from netlify.toml)
The build exports all notes, the topic index and the search index as static files, so Express/MongoDB are only needed for the optional server mode.

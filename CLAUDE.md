# CLAUDE.md — NodeProjectSample (FixMyCity Backend)

Guidance for AI agents working in this repo. Read before making changes.

## What this is
Express 5 + MongoDB (native driver, **no Mongoose**) backend for FixMyCity — a civic complaint platform. Serves a JSON API to the [ReactProjectSample](https://github.com/debmalyo-hub07/ReactProjectSample.git) SPA and EJS pages as fallback. Fork of `debmalyo-hub07/NodeProjectSample`; changes here become PRs to the original.

## Golden rules
1. **Do not rename** files, functions, routes, collections, or data fields. The frontend binds to exact names. Renames break the SPA silently.
2. **Field names are a contract.** `id` (string, not `_id`), `issuetype`, `workstatus`, `photoUrl`, `locationUrl`, `complaintId`, `aadhar` — preserve casing exactly. See README data model.
3. **Never commit `.env`** (gitignored). `MONGO_URL` + `SESSION_SECRET` only.
4. **UI/UX is frozen for now** — current work is documentation + verification. Logic/features come later, section by section.

## Run & verify
```bash
npm install
cp .env.example .env      # fill MONGO_URL, SESSION_SECRET
npm start                 # nodemon app.js → http://localhost:3000
```
No test suite yet (`npm test` is a placeholder). Verify by booting against a real Mongo and hitting endpoints. Helper scripts exist: `test_http.js`, `test_details.js`, `test_debug.js`, `kill_port.js`.

## Layout
- `app.js` — entry: CORS → static → session → routes → `dbConnect()` → `listen(3000)`.
- `controller/` — `auth.js`, `citizen.js`, `admin.js`. Handlers are **dual-mode**: return JSON when the request is XHR / `Accept: json` / has `Authorization` header; otherwise render EJS. Keep both paths working.
- `routes/` — `auth.js`, `user.js` (`/user`, all behind `is-auth`), `admin.js` (`/admin`), `superadmin.js`, `images.js` (`/photo`).
- `middleware/is-auth.js` — parses `Authorization` (`id:role` or JSON), falls back to session. `superadmin` passes an `admin` gate.
- `models/` — thin classes over `getDb()`. `complaint.js`, `user.js`, `status.js`, `photo.js`. Photos stored as `Buffer`.
- `utils/databaseUtil.js` — `dbConnect(cb)` / `getDb()`; database name is `FixMyCity`.

## Conventions
- CommonJS (`require`/`module.exports`), not ESM.
- Port `3000` hard-coded in `app.js`.
- Multipart uploads use `multer` in-memory; the file field is **`photo`** (both complaint register and status update).
- Auth from the SPA is a header: `Authorization: <userId>:<role>`.

## Known debt (don't "fix" silently as part of unrelated work)
- Passwords are **plain text**. Flag before any deploy; don't add hashing mid-unrelated-change without discussion.
- No schema validation. IDs are `Math.random()` strings.
- Super-admin credentials/OTP live on the frontend.

## Commit etiquette
Small, scoped commits. Don't reformat untouched files. Keep diffs reviewable for the upstream PR.

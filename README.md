# FixMyCity 🏙️ — Backend (NodeProjectSample)

A civic issue reporting and management platform connecting citizens with municipal authorities. Citizens report local problems digitally; authorities track, manage, and update status in a centralized system.

This repo is the **Node.js/Express + MongoDB backend**. It pairs with the [ReactProjectSample](https://github.com/debmalyo-hub07/ReactProjectSample.git) frontend, which consumes the JSON API below.

---

## 🚀 Features
- Citizen complaint registration and tracking
- Issue categorization (roads, water, sanitation, electricity, etc.)
- Admin dashboard for managing and updating complaints
- Work-status updates with progress photos
- Super-admin usage analytics + account management
- Photo storage as binary in MongoDB, served at `/photo/:id`
- Centralized database for complaint, status, and user data

## 🛠️ Tech Stack
| Layer | Choice |
|-------|--------|
| Runtime | Node.js (≥ 20.19 recommended, to match the Vite frontend) |
| Framework | Express 5 |
| Database | MongoDB — native `mongodb` driver (**no Mongoose**), db name `FixMyCity` |
| Views | EJS (server-rendered fallback; SPA uses JSON) |
| Sessions | `express-session` |
| Uploads | `multer` (in-memory) |
| Auth | Custom header/session middleware (`middleware/is-auth.js`) |

## ⚙️ Installation & Setup

```bash
git clone https://github.com/debmalyo-hub07/NodeProjectSample.git
cd NodeProjectSample
npm install
cp .env.example .env      # then fill in real values
npm start                 # nodemon app.js → http://localhost:3000
```

### Environment (`.env`)

```
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
SESSION_SECRET=change-me-to-a-long-random-string
```

`MONGO_URL` is **required** — the app throws on boot if unset. `.env` is gitignored; never commit it.

---

## 🧭 Architecture

```
app.js                 # Express app, CORS, session, route mounting, dbConnect → listen(3000)
controller/            # Request handlers
  auth.js              # login / signup / logout
  citizen.js           # citizen home, register complaint, details, profile
  admin.js             # admin/superadmin home, status update, details, profile, usage, users
routes/                # Route tables → controllers
  auth.js  user.js  admin.js  superadmin.js  images.js
middleware/is-auth.js  # Resolves userId/role from Authorization header ("id:role") or session
models/                # Thin classes over the raw MongoDB driver
  complaint.js  user.js  status.js  photo.js
utils/                 # databaseUtil (connect/getDb), pathUtil, uploadUtil
data/                  # complaints.json, status.json (sample data)
views/                 # EJS templates (auth / citizen / admin / partials)
public/                # Static css/js/images
```

### Data model (field names are load-bearing — the SPA binds to them)

- **Complaint** (`complaints`): `id` (string), `issuetype`, `title`, `description`, `photoUrl`, `locationUrl`, `createdAt`, `_id`. **Link by string `id`, not `_id`.**
- **User** (`users`): `id`, `firstname`, `lastname`, `email`, `mobile`, `address`, `city`, `state`, `aadhar`, `password` (plain text ⚠️), `role`, `_id`.
- **Status** (`statuses`): `complaintId` (= Complaint.id), `workstatus`, `title`, `description`, `photoUrl`, `dateTime`, `userId`, `_id`.
- **Photo** (`photos`): `id`, `data` (Buffer), `contentType`, `createdAt`, `_id`. Served raw at `/photo/:photoId`.

### Roles
`citizen`, `admin`, `superadmin`. `is-auth` treats `superadmin` as satisfying an `admin` requirement. Super-admin login is OTP-gated on the frontend.

---

## 🔌 API surface

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/login` | Authenticate → `{ success, user{ id, role, name, ... } }` |
| POST | `/auth/signup` | Register (body: firstname…role) |
| POST | `/auth/logout` | Destroy session |
| GET | `/user/home` | `{ registeredComplaints[], statusMap{id:status}, isLoggedIn }` |
| POST | `/user/register` | New complaint (multipart, file field `photo`; body `issuetype,title,description,locationUrl`) |
| GET | `/user/complaintDetails/:id` | `{ success, complaint, statusUpdates[] }` |
| GET/POST | `/user/profile` · `/user/profile/update` | Citizen profile (password stripped on read) |
| GET | `/admin/home` | `{ success, complaints[], statusMap }` |
| GET | `/admin/complaintDetails/:id` | `{ success, complaint, statusUpdates[] }` |
| POST | `/admin/statusUpdate/:id` | New status (multipart, file `photo`; body `workstatus,title,description,dateTime`) |
| GET/POST | `/admin/profile` · `/admin/profile/update` | Admin profile |
| GET | `/superadmin/usage` · `/superadmin/users` | Stats + admin/citizen lists |
| GET | `/photo/:photoId` | Raw image bytes |

All `/user`, `/admin`, `/superadmin` routes require auth (`is-auth`). The SPA sends `Authorization: id:role`. CORS allows any `localhost`/`127.0.0.1` origin so the Vite dev server (`:5173`) can call the API.

---

## 🎯 Purpose
Reduce the communication gap between citizens and municipal bodies via a transparent, digital platform for civic issue reporting and resolution.

## 📌 Future Enhancements
- Hash passwords (currently plain text — **do before any real deployment**)
- Schema validation on the data layer
- Notification system (email/SMS)
- Mobile application support
- Collision-safe IDs (currently `Math.random()` strings)

See [CLAUDE.md](./CLAUDE.md) for agent/workflow conventions.

## 👤 Author
**Debarun Roy**

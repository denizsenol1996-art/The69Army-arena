# 🎮 The69Army Gaming Arena

OSRS-style gamble site met multiplayer games, wallet systeem en Discord bot.

## ⚡ Quickstart (5 minuten)

### Wat je nodig hebt
- **Node.js 18+** → [nodejs.org](https://nodejs.org)
- **MongoDB** → Kies een optie:
  - [MongoDB Atlas](https://www.mongodb.com/atlas) (gratis, cloud) ← **makkelijkst**
  - Lokaal: `brew install mongodb-community` (Mac) / `apt install mongodb` (Linux)
  - Docker: `docker run -d -p 27017:27017 mongo:7`

### Stap 1: Installeer alles
```bash
# Clone of extract het project
cd the69army-arena

# Installeer alle dependencies (root + client + server + bot)
npm install          # root (concurrently)
npm run setup        # client + server + bot
```

### Stap 2: Configuratie
```bash
# Kopieer de .env template
cp .env.example .env

# Pas aan (minimaal):
#   - MONGODB_URI als je Atlas gebruikt
#   - JWT_SECRET naar een random string
```

### Stap 3: Start alles
```bash
# Optie A: Zonder Discord bot (snelst voor testen)
npm run dev:no-bot

# Optie B: Met alles
npm run dev
```

### Stap 4: Open de site
→ **http://localhost:3000**

---

## 📁 Project Structuur

```
the69army-arena/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx            # Alle games + UI
│   │   ├── socket.js          # Socket.io client
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   └── vite.config.js
│
├── server/                    # Backend (Express + Socket.io)
│   ├── index.js               # Server entry
│   ├── models/                # MongoDB models
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   └── Game.js
│   ├── routes/
│   │   ├── auth.js            # Login/register
│   │   └── wallet.js          # Deposit/withdraw/leaderboard
│   └── socket/
│       └── handler.js         # Real-time game events
│
├── bot/                       # Discord Bot
│   └── index.js               # Commands: !link !deposit !balance etc.
│
├── docker-compose.yml         # Docker setup
├── .env.example               # Template voor environment vars
└── README.md
```

---

## 🎲 Games

| Game | Status | Type |
|------|--------|------|
| Death Roll | ✅ Ready | 1v1 |
| Liar's Dice | ✅ Ready | 2-6 spelers |
| Battle Royale Coinflip | ✅ Ready | 2-16 spelers |
| Poker Tournament | 🔜 Coming | 2-9 spelers |
| Blind Auction | 🔜 Coming | 2+ spelers |
| Chain Duel | 🔜 Coming | 2 spelers |
| King's Court | 🔜 Coming | 3+ spelers |
| The Heist | 🔜 Coming | 3+ spelers |

---

## 🤖 Discord Bot Commands

| Command | Beschrijving |
|---------|-------------|
| `!link <username>` | Link Discord aan arena account |
| `!balance` | Check je wallet |
| `!deposit <bedrag>` | Vraag een deposit aan |
| `!stats [@user]` | Bekijk stats |
| `!leaderboard` | Top 10 spelers |
| `!confirm @user <bedrag>` | (Admin) Bevestig deposit |
| `!help` | Alle commands |

### Bot Setup
1. Ga naar [Discord Developer Portal](https://discord.com/developers/applications)
2. New Application → naam: "The69Army Bot"
3. Bot tab → Add Bot → kopieer token
4. Zet **MESSAGE CONTENT INTENT** aan
5. OAuth2 → URL Generator → scopes: `bot` + `applications.commands`
6. Permissions: Send Messages, Manage Channels, Embed Links
7. Plak de token in `bot/.env`

---

## 🚀 Deployen naar VPS

### Optie A: VPS (Hetzner CX22 — €4.50/maand)
```bash
# Op je VPS
sudo apt update && sudo apt install -y nodejs npm nginx certbot

# MongoDB via Docker
docker run -d --restart always -p 27017:27017 -v mongodata:/data/db mongo:7

# Upload/clone project
cd the69army-arena
npm run setup
cd client && npm run build && cd ..

# Start met PM2
sudo npm install -g pm2
pm2 start server/index.js --name "arena-server"
pm2 start bot/index.js --name "arena-bot"
pm2 save && pm2 startup
```

### Nginx config (`/etc/nginx/sites-available/the69army`)
```nginx
server {
    server_name the69army.com;

    location / {
        root /path/to/the69army-arena/client/dist;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
    }

    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable site + SSL
sudo ln -s /etc/nginx/sites-available/the69army /etc/nginx/sites-enabled/
sudo certbot --nginx -d the69army.com
sudo systemctl restart nginx
```

### Optie B: Cloud (iets duurder, makkelijker)
| Service | Wat | Kosten |
|---------|-----|--------|
| Vercel | Frontend | Gratis |
| Railway | Backend + Bot | ~€5/mnd |
| MongoDB Atlas | Database | Gratis (512MB) |

---

## 📋 Checklist

### Week 1-2 (Must have)
- [ ] `npm run dev:no-bot` draait zonder errors
- [ ] Register + login werkt
- [ ] Death Roll speelbaar (lokaal, 2 browser tabs)
- [ ] MongoDB data persistent

### Week 3-4 (Should have)
- [ ] Discord bot actief
- [ ] Deposit/withdraw flow werkt
- [ ] Liar's Dice + Battle Royale multiplayer
- [ ] Deploy naar VPS

### Maand 2+ (Nice to have)
- [ ] Poker tournament
- [ ] Leaderboard op website
- [ ] Kick stream integration
- [ ] Custom domein + SSL

# 🤖 DoraBot

**DoraBot** is a Doraemon-inspired Discord bot combining AI tools,
collectible cards, boss raids, a Dorayaki economy, Mini-Dora
progression, games, gadgets, trading, and a companion website.

> AI • Images • Cards • Raids • Dorayaki • Mini-Dora • Games • DoraDex

------------------------------------------------------------------------

## ✨ Features

### 🤖 AI Chat

Chat with DoraBot directly in Discord and get AI-powered answers.

### 🎨 AI Image Generation

Generate images from text prompts without leaving Discord.

### 🍘 Dorayaki Economy

Dorayaki is DoraBot's main in-bot currency. Players can earn it through
daily rewards, quests, raids, Mini-Dora adventures, games, and other
rewards, then spend it in the shop and on upgrades.

### 🛒 Shop

Use `/shop` to access DoraBot's shop. Depending on the current rotation,
it can contain card packs, featured cards, Mini-Dora, and other special
items.

### 🎴 Collectible Cards

Open packs and build a Doraemon-themed card collection.

**Rarities:** Common • Rare • Epic • Mythic • Legendary

Cards can be collected, flexed, equipped, traded, and sold where
supported.

### ✨ Shiny Cards

Some cards have special **Shiny** versions with unique artwork. Shiny
variants are significantly rarer than normal versions and can also be
supported by featured shop rotations.

### ⚔️ Raid-Exclusive Cards

Certain cards are unavailable from normal packs and are reserved for
Boss Raid rewards.

  Card        Rarity   Availability
  ----------- -------- ----------------
  Mufaga      Mythic   Raid Exclusive
  Leviathan   Mythic   Raid Exclusive

------------------------------------------------------------------------

## ⚔️ Boss Raids

Players work together to defeat powerful bosses.

Raid features include: - Boss HP and health bar - Gadget-based attacks -
Attack cooldowns - Damage leaderboard and public Top 5 - Enraged boss
phase - Final-blow announcement - Defeated-boss artwork - Personal raid
rewards - MVP bonus for the highest damage dealer - Raid-specific
exclusive card rewards

Players can receive a DM when their raid attack cooldown is ready again,
including a direct link back to the raid.

After a raid ends, participants can privately check their rewards. A
raid can also select an eligible player from the Top 5 damage dealers
for a special raid-exclusive card, which can be awarded manually by an
administrator.

### 🏆 Raid MVP

The highest damage dealer can receive an additional MVP reward on top of
their normal raid earnings.

------------------------------------------------------------------------

## 🐱 Mini-Dora

Players can own and upgrade a Mini-Dora that goes on adventures and
returns with rewards.

Mini-Dora progression includes: - Multiple levels - Increasing rewards -
Shorter adventure times at higher levels - Dorayaki upgrade costs -
Bonus finds

When an adventure finishes, DoraBot can automatically DM the owner that
Mini-Dora has returned and rewards are ready.

### 🎒 Mini-Dora Finds

Possible bonus finds include: - Bonus Dorayaki - Card Packs - Lucky
Packs

Higher levels can unlock better reward possibilities.

------------------------------------------------------------------------

## 📦 Card Packs

### 🎴 Normal Cards Pack

  Rarity        Chance
  ----------- --------
  Common         52.5%
  Rare             30%
  Epic             12%
  Mythic            5%
  Legendary       0.5%

### 🍀 Lucky Pack

  Rarity        Chance
  ----------- --------
  Common           25%
  Rare             40%
  Epic             22%
  Mythic           11%
  Legendary         2%

Raid-exclusive cards are excluded from normal pack selection.

------------------------------------------------------------------------

## 🌐 DoraBot Website

DoraBot includes a companion website served by its Node.js application.

The website includes: - DoraBot branding and invite links - Feature
overview - Popular commands - Support server access - DoraDex card
gallery

### 🎴 DoraDex

**DoraDex** is a public website gallery displaying DoraBot's collectible
cards, artwork, and rarity information, including Shiny and Raid
Exclusive cards.

------------------------------------------------------------------------

## 🧰 Gadgets

Collect and use Doraemon gadgets across supported activities, including
Boss Raids.

## 🔄 Trading

Trade collectible cards with other users through DoraBot's trading
system.

## 💰 Card Selling

Supported cards can be sold for Dorayaki.

## 💪 Flex

Show off cards from your collection using DoraBot's card flex system.

------------------------------------------------------------------------

## 🎮 Main Commands

-   `/ask` --- AI chat
-   `/image` --- AI image generation
-   `/shop` --- Open the shop
-   `/pocket` --- View items and card packs
-   `/minidora` --- Manage Mini-Dora
-   `/profile` --- View player information
-   `/daily` --- Claim the daily reward
-   `/quests` --- View daily quests
-   `/flex` --- Show off an owned card
-   `/trade` --- Trade cards

Additional commands and games may be available depending on the current
version.

------------------------------------------------------------------------

## 🛠️ Tech Stack

-   Node.js
-   discord.js
-   MongoDB / Mongoose
-   Express
-   AI APIs for chat and image generation
-   HTML/CSS for the companion website

------------------------------------------------------------------------

## ⚙️ Setup

1.  Install dependencies.
2.  Configure environment variables.
3.  Connect DoraBot to MongoDB.
4.  Register Discord slash commands.
5.  Start the bot.

``` bash
npm install
node index.js
```

Keep Discord tokens, database credentials, and API keys in environment
variables. **Never commit secrets to the repository.**

------------------------------------------------------------------------

## 🔐 Environment Variables

Example:

``` env
DISCORD_TOKEN=your_discord_bot_token
MONGO_URI=your_mongodb_connection_string
```

Add any required AI/API credentials as environment variables as well.
Never upload your real `.env` file publicly.

------------------------------------------------------------------------

## 🚧 Development

DoraBot can be expanded with new: - Cards and Shiny variants - Raid
bosses and raid-exclusive cards - Gadgets - Mini-Dora levels and finds -
Shop items and featured cards - DoraDex entries - AI features - Games -
Quests, achievements, and events

------------------------------------------------------------------------

## 📌 Current Special Cards

### 🌪️ Mufaga

-   **Rarity:** Mythic
-   **Type:** Raid Exclusive
-   **Normal Pack Pull:** Disabled

### 🌊 Leviathan

-   **Rarity:** Mythic
-   **Type:** Raid Exclusive
-   **Normal Pack Pull:** Disabled

------------------------------------------------------------------------

## 💙 About

DoraBot brings AI utilities and a Doraemon-themed collecting/economy
game together inside Discord. Players can chat with AI, generate images,
collect and trade cards, grow Mini-Dora, fight bosses, earn Dorayaki,
play games, and hunt rare rewards.

The companion website extends the experience with DoraBot information
and the **DoraDex** card gallery.

------------------------------------------------------------------------

**Made for the DoraBot Discord experience.**

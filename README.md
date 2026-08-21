# 🤖 DoraBot

**DoraBot** is a feature-packed Discord bot inspired by the world of
Doraemon. It combines AI tools, collectible cards, raids, an economy,
Mini-Dora progression, gadgets, games, trading, and more in one bot.

> AI • Cards • Raids • Dorayaki • Mini-Dora • Gadgets • Games

------------------------------------------------------------------------

## ✨ Features

### 🤖 AI Chat

Chat directly with DoraBot using its AI-powered chat system.

### 🎨 AI Image Generation

Generate images from prompts directly through Discord.

### 🍪 Dorayaki Economy

Dorayaki is DoraBot's main currency. Earn it through activities such as
raids, Mini-Dora, rewards, and other bot features, then spend it in the
shop and on upgrades.

### 🛒 Shop

Use `/shop` to access the DoraBot shop.

The shop can include: - Cards Packs - Daily/featured cards - Mini-Dora -
VIP or special items - Other limited offers

### 🃏 Collectible Cards

Open packs and build your own Doraemon-themed card collection.

Card rarities include: - Common - Rare - Epic - Mythic - Legendary

Cards can be stored in your collection and used across supported card
features such as flexing, equipping, trading, and selling.

### ✨ Shiny Cards

Some cards can have special **Shiny** versions with unique artwork,
making them much rarer collectibles.

### 👹 Raid-Exclusive Cards

Certain cards are intentionally excluded from normal pack pulls and are
reserved for special raid rewards.

Current raid-exclusive Mythics include:

  Card        Rarity   Availability
  ----------- -------- ----------------
  Mufaga      Mythic   Raid Exclusive
  Leviathan   Mythic   Raid Exclusive

Raid-exclusive cards use `raidExclusive: true` and are filtered out of
normal pack selection.

### ⚔️ Boss Raids

Players can work together to defeat powerful raid bosses.

Raid features include: - Boss HP and health bar - Gadget-based attacks -
Attack cooldowns - Damage leaderboard - Top 5 damage dealers - Enraged
boss phase - Final-blow announcement - Defeated boss artwork - Personal
raid rewards - MVP bonus for the highest damage dealer

After a raid ends, participants can use **Check My Rewards** to
privately view their own reward.

A raid may also randomly select one eligible member of the Top 5 damage
dealers as the winner of a special raid-specific card. The card can be
awarded manually by an administrator.

### 🏆 Raid MVP

The highest damage dealer receives an additional MVP reward on top of
their normal raid earnings.

### 🤖 Mini-Dora

Own and upgrade a Mini-Dora to generate passive Dorayaki.

Mini-Dora progression includes: - Multiple levels - Increasing income -
Reduced collection time at higher levels - Dorayaki upgrade costs -
Bonus finds

### 🎒 Mini-Dora Finds

Higher-level Mini-Doras can occasionally return with extra rewards in
addition to their normal income.

Possible finds include: - Bonus Dorayaki - Cards Packs - Lucky Packs

Better Mini-Dora levels unlock better find possibilities.

### 🍀 Lucky Packs

Lucky Packs provide improved rarity odds compared with normal Cards
Packs and can be obtained through selected rewards and Mini-Dora finds.

### 🧰 Gadgets

Collect and use Doraemon gadgets across supported activities, including
boss raids.

### 🔄 Trading

Players can trade cards with other users using DoraBot's card trading
system.

### 💰 Card Selling

Cards can be sold for Dorayaki based on their rarity.

### 💪 Flex

Show off cards from your collection with the card flex system.

------------------------------------------------------------------------

## 🎮 Main Commands

DoraBot contains commands for its different systems, including commands
such as:

-   `/shop` --- Open the shop
-   `/pocket` --- View your items/packs and access pack opening
-   `/minidora` --- View and manage your Mini-Dora
-   `/flex` --- Flex one of your owned cards
-   `/trade` --- Trade cards with another player

Additional commands may be available depending on the current bot
version.

------------------------------------------------------------------------

## 📦 Card Pack System

Opening a Cards Pack rolls a rarity and then selects an eligible card of
that rarity.

Raid-exclusive cards are protected from normal pulls with:

``` js
!c.raidExclusive
```

Example exclusive card:

``` js
{
  id: 'm_mufaga',
  name: 'Mufaga',
  rarity: 'Mythic',
  raidExclusive: true,
  url: 'CARD_IMAGE_URL'
}
```

This allows the card to remain part of `CARD_POOL` for inventory, flex,
equip and trading features while preventing it from appearing in
ordinary packs.

------------------------------------------------------------------------

## ⚔️ Raid Rewards

Raid rewards are based on participation and damage dealt.

The raid system can provide: - Dorayaki based on damage - Cards Packs -
Lucky Packs - MVP bonus - Special raid-card winner selection

The public results show the Top 5 damage dealers, while personal reward
information is shown privately through the rewards button.

------------------------------------------------------------------------

## 🛠️ Tech

DoraBot is built primarily with:

-   Node.js
-   discord.js
-   MongoDB / Mongoose
-   AI APIs for chat and image-generation features

------------------------------------------------------------------------

## ⚙️ Setup

1.  Install the project dependencies.
2.  Configure the required environment variables.
3.  Connect the bot to MongoDB.
4.  Register the Discord slash commands.
5.  Start the bot.

Example:

``` bash
npm install
node index.js
```

Keep secrets such as Discord bot tokens, database credentials, and API
keys in environment variables. **Never commit them to the repository.**

------------------------------------------------------------------------

## 🔐 Environment Variables

The exact variables depend on your current DoraBot configuration, but a
typical `.env` setup may contain values for:

``` env
DISCORD_TOKEN=your_discord_bot_token
MONGODB_URI=your_mongodb_connection_string
```

Add any AI/API credentials required by your version of DoraBot as
environment variables as well.

Do not upload your real `.env` file to a public repository.

------------------------------------------------------------------------

## 🚧 Development

DoraBot is actively expandable. Systems can be extended with new:

-   Cards and shiny variants
-   Raid bosses
-   Raid-exclusive cards
-   Gadgets
-   Mini-Dora levels and finds
-   Shop items
-   AI features
-   Games
-   Achievements and events

------------------------------------------------------------------------

## 📌 Current Special Cards

### Mufaga

-   **Rarity:** Mythic
-   **Type:** Raid Exclusive
-   **Pack Pull:** Disabled

### Leviathan

-   **Rarity:** Mythic
-   **Type:** Raid Exclusive
-   **Pack Pull:** Disabled

------------------------------------------------------------------------

## 💙 About

DoraBot brings AI utilities and a Doraemon-themed collecting/economy
game together inside Discord. Players can chat with AI, generate images,
collect cards, grow their Mini-Dora, fight bosses, earn Dorayaki, trade
with friends, and hunt rare rewards.

------------------------------------------------------------------------

**Made for the DoraBot Discord experience.**

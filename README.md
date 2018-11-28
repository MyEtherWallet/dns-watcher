# DNS Checker

## Install

```bash
npm install
```

### Temporary:

```bash
sudo apt install redis-server
```

## Environment

Edit the .env file located in the root of the project

```
# Domain to check
DOMAIN=myetherwallet.com

# URL of production website
PRODUCTION_SITE=https://www.myetherwallet.com

# Name/URL of status site (for title purposes mostly)
STATUS_SITE=status.myetherwallet.com

# URL of github source for file validation
GITHUB_SITE=https://raw.githubusercontent.com/kvhnuke/etherwallet/gh-pages

# Telegram Info
TELEGRAM_KEY=key_here
TELEGRAM_CHAT_ID=chat_id_here
```

## Usage

### DNS Check + Vue Production Build

```bash
npm start
```

### Development Frontend Server

```bash
npm run dev
```

### Production Superstatic Server

```bash
npm run prod
```
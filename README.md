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

### DNS Check

```bash
npm run start:watcher
```

### Development Frontend Server

```bash
npm run start:dev
```

## References

https://stackoverflow.com/questions/10777657/node-js-dns-lookup-how-to-set-timeout
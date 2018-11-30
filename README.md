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
# Port to run on
PORT=8080

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
TELEGRAM_CHAT_ID=-290489995
```

## Usage

### Start DNS Check

```bash
npm run start:watcher
```

### Start Development Frontend Server

```bash
npm run start:dev
```

### Build Production Frontend

```bash
npm run build:prod
```

### Start Production Frontend

```bash
npm run start:prod
```

## References

The `package.json` file has some options: RES_OPTIONS='retrans:2500 retry:2'
This is to override some default options when looking up DNS records. See:
https://stackoverflow.com/questions/10777657/node-js-dns-lookup-how-to-set-timeout
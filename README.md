
![MyEtherWallet Logo](https://www.myetherwallet.com/images/myetherwallet-logo.png)

# DNS Checker

This application was built to monitor the DNS resolutions of MyEtherWallet.com across every known nameserver. It continuously retrieves an updated list of nameservers from [public-dns.info](https://public-dns.info/nameservers.csv), and checks their resolved A records against a configureable list of valid ips for MyEtherWallet.com. The results of each nameserver resolution are stored in [Redis](https://redis.io/) for live, up-to-date status reports of each nameserver.

This application also includes a lightweight frontend to interface with the results of the DNS results. It is built in [VueJS](https://vuejs.org/) and uses [Superstatic](https://www.npmjs.com/package/superstatic) to both serve the built static pages, and operate as a very minimal backend to retrieve the status updates from Redis.

# Environment

## .env File

This application requires a .env file be located in the root of the project. Below are the required variables:

```
# Domain to check/validate
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

# Allowed IPs JSON
ALLOWED_IPS=allowed-mew-ips.json
```

## Port

By default, this application runs on port `8080`

## Allowed IPs

By default, the application includes an `allowed-mew-ips.json` file with an array of valid ips of A record resolutions for [MyEtherWallet.com](https://www.myetherwallet.com). This file can either be altered to include a desired array of valid ips for a different domain name, or the `.env` file can be updated with the variable ALLOWED_IPS to point to a different `.json` file containing a similarly formatted array of ips.

# Development

To work on changes to this application, the following commands are recommended. Because Redis is used in this application, it is required that it be installed. Although the production setup uses a [Docker](https://www.docker.com/) image of Redis, it is also possible to use redis-server for development purposes.

## Install

```bash
npm install
```

```bash
sudo apt install redis-server
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

# Production

The recommended way to run this application in a production environment is with [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/), although it is perfectly plausible to run without it.

## Usage (via Docker)

### Build Docker Image

```
docker-compose build --no-cache
```

### Start Built Docker Container

```
docker-compose up
```

## Usage (via NPM)

### Start DNS Check

```bash
npm run start:watcher
```

### Build Production Frontend

```bash
npm run build:prod
```

### Start Production Frontend

```bash
npm run start:prod
```

# References

The `package.json` file has some options: `RES_OPTIONS='retrans:2500 retry:2'`

This is to override some default options when looking up DNS records. See:
https://stackoverflow.com/questions/10777657/node-js-dns-lookup-how-to-set-timeout
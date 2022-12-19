#Get base image
FROM node:8.14.0

# Set environment variables.
ENV HOME /root
ARG STATUS_SITE
ARG GITHUB_SITE
ARG PRODUCTION_SITE
ARG ALLOWED_IPS
ARG FORCE_KEY

# Copy everything
WORKDIR /root
COPY . .

# Install
RUN npm install npm@6.4.1 -g
RUN cd /root/ && \
    npm install

RUN cp ${ALLOWED_IPS} watcher/src/lists/allowed-resolutions.json

# Build
RUN npm run build:prod

# Move files
RUN mv frontend/dist . &&  mv frontend/web-server.js . && mv frontend/package.json ./package-frontend.json && \
    rm -rf frontend && mkdir frontend && \
    mv dist frontend/ && mv web-server.js frontend/ && mv package-frontend.json frontend/package.json

# Install "correct" phantomjs
RUN npm install phantom

# Delete installed packages
RUN npm cache clean --force 

# Expose the ports
EXPOSE 8080
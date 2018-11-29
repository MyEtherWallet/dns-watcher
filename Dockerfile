FROM node:10.7.0
WORKDIR /app
COPY . /app
EXPOSE 8080
RUN npm install --unsafe-perm
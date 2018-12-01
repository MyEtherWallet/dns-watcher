#Get base image
FROM alpine:3.8

# Set environment variables.
ENV HOME /root

# Copy everything
WORKDIR /root
COPY . .

#Run some commands
RUN apk add --update nodejs nodejs-npm && \
    npm install npm@latest -g

RUN cd /root/ && \
    npm install && \
    npm run build:prod

RUN mv frontend/dist . &&  mv frontend/web-server.js . && \
    rm -rf frontend && mkdir frontend && \
    mv dist frontend/ && mv web-server.js frontend/

#Delete installed packages
RUN npm cache clean --force 

#expose the ports
EXPOSE 8080
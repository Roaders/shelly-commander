FROM nginx:alpine

WORKDIR /app

COPY /dist/shelly-commander /usr/share/nginx/html
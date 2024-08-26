FROM node:20
COPY . /app
WORKDIR /app
RUN pwd && ls -la && npm install && npm run build:local
EXPOSE 8787
CMD ["npm", "run", "start:local"]

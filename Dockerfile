FROM node:alpine

WORKDIR /app
COPY package.json tsconfig.json ./
COPY src src
RUN npm install
EXPOSE 8787
CMD ["npm", "run", "start:local"]

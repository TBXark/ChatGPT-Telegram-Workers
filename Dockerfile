FROM node:20
WORKDIR /app
COPY adapter/local /app/adapter/local/
COPY src /app/src
WORKDIR /app/adapter/local
RUN npm install
EXPOSE 8787
CMD ["npm", "run", "run:local"]

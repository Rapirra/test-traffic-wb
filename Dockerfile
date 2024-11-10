FROM node:18
WORKDIR /usr/src/app
COPY testtraffic/package*.json ./
RUN npm install
COPY testtraffic .
CMD ["npm", "run", "script"]
EXPOSE 8000

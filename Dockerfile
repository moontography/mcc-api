FROM node:16.3.0

LABEL AUTHOR="Lance Whatley"

# specify working directory
WORKDIR /usr/mcc

# Install dependencies
COPY package.json .

RUN npm install

COPY . .

RUN npm run build

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

# Default command
CMD npm start

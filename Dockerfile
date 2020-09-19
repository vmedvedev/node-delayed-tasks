FROM node:12

# create app dir
WORKDIR /usr/src/app

# dependencies install
COPY package*.json ./

RUN npm i
# for production
RUN if [ "$NODE_ENV" = "production" ] ; then npm ci --only=production; fi

RUN npm i nodemon -g

# install an operating system agnostic package for setting environment variables
RUN npm i -D cross-env

# copy source code
COPY . .

EXPOSE 8080

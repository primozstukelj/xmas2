FROM node:14

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

# Create app directory.
WORKDIR /usr/src/node-app

# Copy all file to docker container.
COPY * ./

USER node

# Install dependencies.
RUN npm install

# Bundle app source.
COPY --chown=node:node . .

# Default port.
EXPOSE 3000


# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:22-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Build the Vite app for production
RUN npm run build

# Ensure the server runs in production mode
ENV NODE_ENV=production

# Run the web service on container startup.
CMD [ "npm", "start" ]

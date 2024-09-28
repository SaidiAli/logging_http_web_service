# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

RUN npm run build

ENV SESSION_SECRET="banana"
ENV ACCESS_TOKEN_SECRET="banana"

# Expose the app's port
EXPOSE 3030

# Command to run the app
CMD ["npm", "start"]

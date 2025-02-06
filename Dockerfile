# Use a lightweight Node.js image to build the app
FROM arm64v8/node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app and build it
COPY . .
RUN npm run build

RUN npm install -g serve

# Uses port which is used by the actual application
EXPOSE 5000

# Run application
#CMD [ "npm", "start" ]
CMD serve -s build
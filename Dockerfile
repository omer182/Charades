# Use a lightweight Node.js image to build the app
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the app and build it
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

# Set working directory
WORKDIR /app

# Copy built files from the previous stage
COPY --from=build /app ./

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

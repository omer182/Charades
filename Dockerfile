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

# Use Nginx to serve the React app
FROM nginx:alpine AS runtime

# Copy the built React app to Nginx's default public directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
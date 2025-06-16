# Use official Node image
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start the app
CMD ["node", "dist/src/index.js"]
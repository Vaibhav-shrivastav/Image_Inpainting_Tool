# Use Node image for building the frontend
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copy all frontend files
COPY . .

# Expose port 5173 for Vite
EXPOSE 5173

# Start the React app using Vite
CMD ["npm", "run", "dev", "--", "--host"]

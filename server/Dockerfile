# Use an official Python image as the base
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy the requirements file to install dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files into the container
COPY . .

# Expose the port for FastAPI (default port is 8000)
EXPOSE 8000

# Command to run FastAPI using 'fastapi run'
CMD ["fastapi", "run", "app.py", "--host", "0.0.0.0", "--port", "8000"]
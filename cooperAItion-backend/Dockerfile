# Use the official Python image as a base image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn  # Add production WSGI server

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
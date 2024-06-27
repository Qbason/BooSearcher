# Use the official MongoDB image as the base image
FROM mongo:latest

# Copy the generate-keyfile.sh script to the container
COPY generate-keyfile.sh /generate-keyfile.sh

# Create the keyfile directory and generate the keyfile during the image build
RUN mkdir -p /etc/mongodb/pki/ && \
    /bin/bash /generate-keyfile.sh

# Expose the MongoDB port
EXPOSE 27017
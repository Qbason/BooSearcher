# BooSearcher

BooSearcher is an innovative application designed to help users monitor their favorite booking offers for places and accommodations. With BooSearcher, you can easily keep track of new deals and offers that match your preferences. When new offers appear, users receive an email notification with all the necessary details, ensuring you never miss out on the best deals.

## Getting Started

To start using BooSearcher, simply follow these steps:

1. Visit the BooSearcher main page.
2. Copy the URL of your favorite place along with the desired date range from any booking website.
3. Paste the copied URL into the field provided on the BooSearcher main page.

The application is designed to be intuitive and user-friendly, guiding you through the rest of the process.

## Features

- **Email Notifications:** Receive email alerts as soon as new offers that match your criteria are found.
- **User-Friendly Interface:** Adding your first search request is as simple as copying and pasting a URL.
- **Watcher System:** BooSearcher employs a sophisticated watcher system that regularly visits booking sites to check for new offers. This system is responsible for ensuring that you are always up to date with the latest deals.

## How It Works

BooSearcher uses a powerful `Watcher` mechanism that continuously monitors booking websites for new offers based on the users' preferences. When it identifies new offers, the application processes these offers and sends a detailed email to the user. This email includes all the necessary information about the offer, allowing users to quickly decide whether it matches their needs.

The core of BooSearcher's functionality lies in its ability to efficiently search and retrieve offers. The `BookingSearcher` component is at the heart of this process, utilizing advanced web scraping techniques to find and extract offer details from booking websites.

# Technology Stack Overview

BooSearcher leverages a modern technology stack designed for full-stack web development, automation, and seamless deployment. Here's a concise overview:

- **Next.js**: Powers the UI and web application structure, enabling server-side rendering and static site generation for React apps.
- **Prisma**: Facilitates database access and management, simplifying interactions with databases.
- **React**: The core library for building UI components, utilized by Next.js.
- **Puppeteer**: Automates web scraping and testing by controlling Chrome or Chromium via the DevTools Protocol.
- **MongoDB**: A flexible and scalable NoSQL database for storing application data.
- **Helm & Kubernetes**: Manage and orchestrate containerized application deployments in CI/CD pipelines.
- **GitLab CI/CD**: Automates the build, test, and deployment processes, ensuring continuous integration and delivery.
- **Nodemailer**: Enables the application to send emails, supporting features like notifications or password resets.
- **NextUI**: Provides a collection of beautifully designed, customizable UI components.
- **NextAuth.js**: Offers a complete authentication solution, making it easier to build secure systems.
- **Dev Containers**: Utilize development containers to ensure a consistent development environment across all team members. This approach leverages Docker to create containerized environments that include all necessary dependencies and tools, streamlining the setup process and minimizing "works on my machine" issues.

This stack ensures BooSearcher is built on a foundation of cutting-edge technologies for robust, scalable web applications.

## Contributing

We welcome contributions to BooSearcher! If you have suggestions for improvements or new features, please feel free to contribute. Check out our [contribution guidelines](CONTRIBUTING.md) for more information.

## License

BooSearcher is released under the [MIT License](LICENSE). Feel free to use, modify, and distribute the application as per the license terms.

## Acknowledgments

A big thank you to everyone who has contributed to the development and improvement of BooSearcher. Your support and contributions have been invaluable.

Start monitoring your favorite booking offers with BooSearcher today and never miss out on the best deals again!

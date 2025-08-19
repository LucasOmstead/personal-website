# Homepage Frontend

This is the Angular frontend for Lucas Omstead's personal portfolio website.

## Development

To run this Angular app locally:

```bash
npm install
npm start
```

The app will be available at `http://localhost:4200/`.

## Build

To build for production:

```bash
npm run build:prod
```

The build artifacts will be stored in the `dist/` directory.

## Docker

This app is containerized and runs as part of the larger personal-website Docker setup. The Dockerfile creates a multi-stage build that compiles the Angular app and serves it with nginx.

## Architecture

- **Framework**: Angular 18 with standalone components
- **Styling**: SCSS with modern CSS features
- **Build**: Angular CLI with production optimizations
- **Deployment**: Multi-stage Docker build with nginx

## Features

- Modern responsive design
- Social media links with SVG icons
- Project showcase
- Professional portfolio layout

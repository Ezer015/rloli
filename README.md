# Rloli

A proxy for the [Lolicon API](https://api.lolicon.app/).

## Features

- **Random Image Proxy**: Fetch random pixiv IDs via Lolicon API.
- **Size Selection**: Support for multiple image sizes (`original`, `regular`, `small`, `thumb_mini`).
- **Aspect Ratio Filtering**: Filter images based on aspect ratio patterns (e.g., `gt1`, `lt1`).
- **Convenience Endpoints**: Quick access to horizontal (`/h`) and vertical (`/v`) images.
- **RESTful Image Proxy**: Direct access to Pixiv images with size and proxy configuration.

## Endpoints

### `GET /`

The main endpoint to fetch a random image. Redirects to the proxied image URL.

**Query Parameters:**

- `aspectRatio`: A pattern to filter by aspect ratio. Format: `((gt|gte|lt|lte|eq)[\d.]+){1,2}`. Example: `gt1.7lt1.8`.
- `size`: The image size. One of `original`, `regular`, `small`, `thumb_mini`. Default: `original`.
- `proxy`: The proxy domain to use. Default: `i.yuki.sh`.

### `GET /h`

Alias for `/?aspectRatio=gt1`. Redirects to a horizontal image.

### `GET /v`

Alias for `/?aspectRatio=lt1`. Redirects to a vertical image.

### `GET /img/:id/:page`

Redirects to a specific Pixiv image page via a proxy.

**Path Parameters:**

- `id`: The Pixiv image ID.
- `page`: The page number of the image.

**Query Parameters:**

- `size`: The image size. One of `original`, `regular`, `small`, `thumb_mini`. Default: `original`.
- `proxy`: The proxy domain to use. Default: `i.yuki.sh`.

## Development

To start the development server:

```bash
bun install
bun run dev
```

The server will run at `http://localhost:3000`.

## License

This project is licensed under the [MIT](./LICENSE) open source license.

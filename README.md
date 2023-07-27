# Nano-API/Deploy

GitHub Action for starting a Nano API build and deploying your code as a swarm of serverless functions.

## Usage

Create a workflow (e.g. `.github/workflows/deploy.yml`) with the following content:

```yaml
name: nanoapi_build_and_deploy

on: [push]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      # Request build and stream output
      - name: Build Serverless functions and deploy via Nano API
        uses: Nano-API/Deploy@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          # Best practice is to store your API key as a secret
          api_key: ${{ secrets.NANO_API_KEY }}
```

## Inputs

### `token`

**Required** The GitHub token to use for authentication. We use this to load additional metadata on the repo that is using this action.

### `api_key`

**Optional** The Nano API key to use for authentication. To get this, visit the [Nano API dashboard](https:/app./nanoapi.io) and create a new API key.

# Developing

## Building for Local Dev

To build the action for local development, run `npm run build`. This will create a `dist` folder containing the distributable code.

## Testing

To run the tests, run `npm test`.

## Releasing

To release a new version, run `npm run release`. This will create a new tree-shaken build using `@vercel/ncc`. You will then need to maunally tag the release and push the tag to GitHub. GitHub Actions will then automatically publish the new release to the GitHub Marketplace.
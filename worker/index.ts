/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS?: Fetcher;
  IMAGES?: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

function fetchAsset(path: string, request: Request, env: Env): Promise<Response> {
  const assetRequest = new Request(new URL(path, request.url), {
    headers: request.headers,
  });

  // Cloudflare injects ASSETS in production. The Vite development server
  // serves files from `public` directly and does not create that binding, so
  // fetch the same-origin file through Vite when running locally.
  return env.ASSETS ? env.ASSETS.fetch(assetRequest) : fetch(assetRequest);
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageHandlers = {
        fetchAsset: (path: string) => fetchAsset(path, request, env),
        ...(env.IMAGES
          ? {
              transformImage: async (
                body: ReadableStream,
                { width, format, quality }: { width: number; format: string; quality: number },
              ) => {
                const result = await env.IMAGES!
                  .input(body)
                  .transform(width > 0 ? { width } : {})
                  .output({ format, quality });
                return result.response();
              },
            }
          : {}),
      };

      return handleImageOptimization(request, imageHandlers, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;

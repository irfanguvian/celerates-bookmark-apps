import { Context, MiddlewareHandler } from "hono";

export const timingMiddleware = (): MiddlewareHandler => {
	return async (c: Context, next) => {
		const start = performance.now();

		await next();

		const end = performance.now();
		const responseTime = end - start;

		// Add the response time to headers
		c.res.headers.set("X-Response-Time", `${responseTime.toFixed(2)}ms`);

		// Log the timing
		console.log(`${c.req.method} ${c.req.path} - ${responseTime.toFixed(2)}ms`);
	};
};

import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	errors?: any;
}
export const successResponse = <T>(
	c: Context,
	data: T,
	message = "Success",
	status = 200 as ContentfulStatusCode,
): Response => {
	const response: ApiResponse<T> = {
		success: true,
		data,
		message,
	};
	return c.json(response, status);
};

export const errorResponse = (
	c: Context,
	message = "Error occurred",
	errors?: any,
	status = 400 as ContentfulStatusCode,
): Response => {
	const response: ApiResponse<null> = {
		success: false,
		message,
		errors,
	};
	return c.json(response, status);
};

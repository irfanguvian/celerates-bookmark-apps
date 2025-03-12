import { Context } from 'hono';
import { successResponse, errorResponse } from '../../utils/apiResponses';
import BookmarkController from '../../controllers/BookmarkController';
import { IBookmarkService } from '../../entities/BookmarkService';
import BookmarkService from '../../services/BookmarkService';
import { prismaMock } from '../singleton';

// Mock dependencies
jest.mock('../../services/BookmarkService');
jest.mock('../../utils/apiResponses');

describe('BookmarkController', () => {
    let mockContext: Partial<Context>;
    let mockReq: { json: jest.Mock; query: jest.Mock; param: jest.Mock };
    let bookmarkController: BookmarkController;
    let bookmarkService: IBookmarkService;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock context and request
        mockReq = {
            json: jest.fn(),
            query: jest.fn(),
            param: jest.fn()
        };
        mockContext = {
            req: mockReq as any,
            get: jest.fn().mockImplementation((key) => {
                if (key === 'user') return { id: 'user123', email: 'test@example.com' };
                return null;
            })
        };

        (successResponse as jest.Mock).mockReturnValue('success');
        (errorResponse as jest.Mock).mockReturnValue('error');

        bookmarkService = new BookmarkService(prismaMock)
        bookmarkController = new BookmarkController(bookmarkService);
    });

    describe('getAllBookmarks', () => {
        it('should successfully get all bookmarks', async () => {
            // Arrange
            const queryParams = { limit: 10, offset: 0, search: 'test' };
            const serviceResponse = [
                { id: 'bookmark1', title: 'Test Bookmark 1' },
                { id: 'bookmark2', title: 'Test Bookmark 2' }
            ];

            mockReq.query.mockReturnValue(queryParams);
            (bookmarkService.getAllBookmarks as jest.Mock).mockResolvedValue(serviceResponse);

            // Act
            const result = await bookmarkController.getAllBookmarks(mockContext as Context);

            // Assert
            expect(bookmarkService.getAllBookmarks).toHaveBeenCalledWith('user123', queryParams);
            expect(successResponse).toHaveBeenCalledWith(
                mockContext,
                { bookmarks: serviceResponse },
                'Get Bookmarks successfully'
            );
            expect(result).toBe('success');
        });

        it('should handle errors when getting all bookmarks', async () => {
            // Arrange
            const error = new Error('Database error');

            mockReq.query.mockReturnValue({});
            (bookmarkService.getAllBookmarks as jest.Mock).mockRejectedValue(error);

            // Act
            const result = await bookmarkController.getAllBookmarks(mockContext as Context);

            // Assert
            expect(errorResponse).toHaveBeenCalledWith(
                mockContext,
                'Error occurred',
                error
            );
            expect(result).toBe('error');
        });
    });

    describe('createBookmark', () => {
        it('should successfully create a bookmark', async () => {
            // Arrange
            const bookmarkData = { title: 'New Bookmark', url: 'https://example.com' };
            const serviceResponse = { id: 'bookmark1', ...bookmarkData };

            mockReq.json.mockResolvedValue(bookmarkData);
            (bookmarkService.createBookmark as jest.Mock).mockResolvedValue(serviceResponse);

            // Act
            const result = await bookmarkController.createBookmark(mockContext as Context);

            // Assert
            expect(bookmarkService.createBookmark).toHaveBeenCalledWith('user123', bookmarkData);
            expect(successResponse).toHaveBeenCalledWith(
                mockContext,
                { bookmark: serviceResponse },
                'Bookmark Created successfully'
            );
            expect(result).toBe('success');
        });

        it('should handle errors when creating a bookmark', async () => {
            // Arrange
            const bookmarkData = { title: 'Invalid Bookmark' };
            const error = new Error('Validation error');

            mockReq.json.mockResolvedValue(bookmarkData);
            (bookmarkService.createBookmark as jest.Mock).mockRejectedValue(error);

            // Act
            const result = await bookmarkController.createBookmark(mockContext as Context);

            // Assert
            expect(errorResponse).toHaveBeenCalledWith(
                mockContext,
                'Error occurred',
                error
            );
            expect(result).toBe('error');
        });
    });

    describe('getBookmarkById', () => {
        it('should successfully get a bookmark by id', async () => {
            // Arrange
            const bookmarkId = 'bookmark1';
            const serviceResponse = { id: bookmarkId, title: 'Test Bookmark', url: 'https://example.com' };

            mockReq.param.mockReturnValue(bookmarkId);
            (bookmarkService.getBookmarkById as jest.Mock).mockResolvedValue(serviceResponse);

            // Act
            const result = await bookmarkController.getBookmarkById(mockContext as Context);

            // Assert
            expect(bookmarkService.getBookmarkById).toHaveBeenCalledWith('user123', bookmarkId);
            expect(successResponse).toHaveBeenCalledWith(
                mockContext,
                { bookmark: serviceResponse },
                'Bookmark Get successfully'
            );
            expect(result).toBe('success');
        });

        it('should handle errors when getting a bookmark by id', async () => {
            // Arrange
            const bookmarkId = 'nonexistent';
            const error = new Error('Bookmark not found');

            mockReq.param.mockReturnValue(bookmarkId);
            (bookmarkService.getBookmarkById as jest.Mock).mockRejectedValue(error);

            // Act
            const result = await bookmarkController.getBookmarkById(mockContext as Context);

            // Assert
            expect(errorResponse).toHaveBeenCalledWith(
                mockContext,
                'Error occurred',
                error
            );
            expect(result).toBe('error');
        });
    });

    describe('updateBookmark', () => {
        it('should successfully update a bookmark', async () => {
            // Arrange
            const bookmarkId = 'bookmark1';
            const updateData = { title: 'Updated Bookmark' };
            const serviceResponse = { id: bookmarkId, title: 'Updated Bookmark', url: 'https://example.com' };

            mockReq.param.mockReturnValue(bookmarkId);
            mockReq.json.mockResolvedValue(updateData);
            (bookmarkService.updateBookmark as jest.Mock).mockResolvedValue(serviceResponse);

            // Act
            const result = await bookmarkController.updateBookmark(mockContext as Context);

            // Assert
            expect(bookmarkService.updateBookmark).toHaveBeenCalledWith('user123', bookmarkId, updateData);
            expect(successResponse).toHaveBeenCalledWith(
                mockContext,
                { bookmark: serviceResponse },
                'Bookmark Update successfully'
            );
            expect(result).toBe('success');
        });

        it('should handle errors when updating a bookmark', async () => {
            // Arrange
            const bookmarkId = 'bookmark1';
            const updateData = { title: 'Invalid Update' };
            const error = new Error('Update failed');

            mockReq.param.mockReturnValue(bookmarkId);
            mockReq.json.mockResolvedValue(updateData);
            (bookmarkService.updateBookmark as jest.Mock).mockRejectedValue(error);

            // Act
            const result = await bookmarkController.updateBookmark(mockContext as Context);

            // Assert
            expect(errorResponse).toHaveBeenCalledWith(
                mockContext,
                'Error occurred',
                error
            );
            expect(result).toBe('error');
        });
    });

    describe('deleteBookmark', () => {
        it('should successfully delete a bookmark', async () => {
            // Arrange
            const bookmarkId = 'bookmark1';

            mockReq.param.mockReturnValue(bookmarkId);
            (bookmarkService.deleteBookmark as jest.Mock).mockResolvedValue(undefined);

            // Act
            const result = await bookmarkController.deleteBookmark(mockContext as Context);

            // Assert
            expect(bookmarkService.deleteBookmark).toHaveBeenCalledWith('user123', bookmarkId);
            expect(successResponse).toHaveBeenCalledWith(
                mockContext,
                {},
                'Bookmark Delete successfully'
            );
            expect(result).toBe('success');
        });

        it('should handle errors when deleting a bookmark', async () => {
            // Arrange
            const bookmarkId = 'bookmark1';
            const error = new Error('Delete failed');

            mockReq.param.mockReturnValue(bookmarkId);
            (bookmarkService.deleteBookmark as jest.Mock).mockRejectedValue(error);

            // Act
            const result = await bookmarkController.deleteBookmark(mockContext as Context);

            // Assert
            expect(errorResponse).toHaveBeenCalledWith(
                mockContext,
                'Error occurred',
                error
            );
            expect(result).toBe('error');
        });
    });
});

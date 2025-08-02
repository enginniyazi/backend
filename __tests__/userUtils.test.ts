import { formatUserResponse } from '../src/utils/userUtils.js';
import { HydratedUserDocument } from '../src/types/userTypes.js';

describe('formatUserResponse', () => {
  it('should format user object and remove sensitive fields', () => {
    const user = {
      _id: '123',
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'avatar.png',
      role: 'Student',
      password: 'hashedpassword',
      enrolledCourses: [],
    } as unknown as HydratedUserDocument;

    const result = formatUserResponse(user);

    expect(result).toEqual({
      _id: '123',
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'avatar.png',
      role: 'Student',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('enrolledCourses');
  });
});

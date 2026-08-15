import { Member, StandardMember, StudentMember, StaffMember } from './Member';

/**
 * Factory class for creating different types of Member objects (Factory Pattern).
 */
export class MemberFactory {
  private static idCounter: number = 0;

  /**
   * Creates a Member object based on the specified member type.
   * @param {string} type - The type of member ('standard', 'student', 'staff').
   * @param {string} name - The name of the member.
   * @returns {Member} A concrete instance of a Member subclass.
   * @throws {Error} If an unsupported member type is provided.
   */
  public static createMember(type: string, name: string): Member {
    const normalizedType = type.toLowerCase();
    const id = `mem-${++MemberFactory.idCounter}`;

    switch (normalizedType) {
      case 'standard':
        return new StandardMember(id, name);
      case 'student':
        return new StudentMember(id, name);
      case 'staff':
        return new StaffMember(id, name);
      default:
        throw new Error(`Invalid member type: ${type}`);
    }
  }
}

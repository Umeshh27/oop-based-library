import { Book } from './Book';

/**
 * Represents a library member (Observer pattern).
 */
export abstract class Member {
  public id: string;
  public name: string;
  public type: string;
  public borrowingLimit: number;
  public activeReservationsCount: number;

  /**
   * Constructs a Member instance.
   * @param {string} id - Unique identifier for member.
   * @param {string} name - Name of the member.
   * @param {string} type - Member type ('standard', 'student', 'staff').
   * @param {number} borrowingLimit - Maximum number of books the member can reserve.
   */
  constructor(id: string, name: string, type: string, borrowingLimit: number) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.borrowingLimit = borrowingLimit;
    this.activeReservationsCount = 0;
  }

  /**
   * Observer pattern update method. Notifies member when a book becomes available.
   * @param {Book} book - The available book.
   */
  public update(book: Book): void {
    console.log(`Notification for ${this.name}: The book "${book.title}" is now available.`);
  }
}

/**
 * Represents a standard member with a borrowing limit of 3.
 */
export class StandardMember extends Member {
  constructor(id: string, name: string) {
    super(id, name, 'standard', 3);
  }
}

/**
 * Represents a student member with a borrowing limit of 5.
 */
export class StudentMember extends Member {
  constructor(id: string, name: string) {
    super(id, name, 'student', 5);
  }
}

/**
 * Represents a staff member with a borrowing limit of 10.
 */
export class StaffMember extends Member {
  constructor(id: string, name: string) {
    super(id, name, 'staff', 10);
  }
}

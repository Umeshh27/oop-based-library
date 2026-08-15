import { Book } from './Book';
import { Member } from './Member';
import { MemberFactory } from './MemberFactory';

/**
 * Interface representing a reservation record.
 */
export interface Reservation {
  memberId: string;
  bookTitle: string;
  dueDate: Date;
}

/**
 * Library class acting as the central facade for library operations.
 */
export class Library {
  private books: Map<string, Book>;
  private members: Map<string, Member>;
  private reservations: Reservation[];

  /**
   * Constructs a new Library instance.
   */
  constructor() {
    this.books = new Map<string, Book>();
    this.members = new Map<string, Member>();
    this.reservations = [];
  }

  /**
   * Adds a new book to the library's collection.
   * @param {string} title - The title of the book.
   * @param {string} author - The author of the book.
   * @returns {Book} The newly created Book instance.
   */
  public addBook(title: string, author: string): Book {
    const book = new Book(title, author);
    this.books.set(title, book);
    return book;
  }

  /**
   * Registers a new member using the MemberFactory.
   * @param {string} name - The name of the member.
   * @param {string} type - The member type ('standard', 'student', 'staff').
   * @returns {Member} The newly registered Member instance.
   */
  public registerMember(name: string, type: string): Member {
    const member = MemberFactory.createMember(type, name);
    this.members.set(member.id, member);
    return member;
  }

  /**
   * Finds a book in the library collection by title.
   * @param {string} title - The title of the book to find.
   * @returns {Book | undefined} The found book, or undefined if not found.
   */
  public findBook(title: string): Book | undefined {
    return this.books.get(title);
  }

  /**
   * Finds a member in the library collection by ID.
   * @param {string} id - The ID of the member to find.
   * @returns {Member | undefined} The found member, or undefined if not found.
   */
  public findMember(id: string): Member | undefined {
    return this.members.get(id);
  }

  /**
   * Reserves a book for a given member.
   * @param {string} memberId - The ID of the member reserving the book.
   * @param {string} bookTitle - The title of the book to reserve.
   * @throws {Error} If the member or book is not found.
   * @throws {Error} If the member has reached their reservation limit.
   */
  public reserveBook(memberId: string, bookTitle: string): void {
    const member = this.findMember(memberId);
    if (!member) {
      throw new Error(`Member with ID "${memberId}" not found.`);
    }

    const book = this.findBook(bookTitle);
    if (!book) {
      throw new Error(`Book with title "${bookTitle}" not found.`);
    }

    if (member.activeReservationsCount >= member.borrowingLimit) {
      throw new Error('Reservation limit reached.');
    }

    if (book.isReserved) {
      book.addToWaitlist(member);
    } else {
      book.reserve(member);
      member.activeReservationsCount++;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // Standard 14-day loan period
      this.reservations.push({
        memberId: member.id,
        bookTitle: book.title,
        dueDate,
      });
    }
  }

  /**
   * Returns a book to the library, notifying waitlisted members and transferring reservation if applicable.
   * @param {string} bookTitle - The title of the book being returned.
   * @throws {Error} If the book is not found.
   */
  public returnBook(bookTitle: string): void {
    const book = this.findBook(bookTitle);
    if (!book) {
      throw new Error(`Book with title "${bookTitle}" not found.`);
    }

    // Decrement reservation count for current borrower if present
    if (book.reservedBy) {
      book.reservedBy.activeReservationsCount = Math.max(0, book.reservedBy.activeReservationsCount - 1);
    }

    // Notify all members on the waitlist (Observer pattern requirement)
    book.notifyObservers();

    if (book.waitlist.length > 0) {
      // FIFO waitlist: Assign book to the first member who joined the waitlist
      const nextMember = book.waitlist.shift()!;
      book.reserve(nextMember);
      nextMember.activeReservationsCount++;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      this.reservations.push({
        memberId: nextMember.id,
        bookTitle: book.title,
        dueDate,
      });
    } else {
      book.returnBook();
    }
  }

  /**
   * Calculates the overdue fine for a reservation at a fixed rate of $0.50 per day.
   * @param {Reservation | { dueDate: Date } | string} param - A reservation object containing a dueDate, or a member ID.
   * @returns {number} The total fine amount in dollars.
   */
  public calculateFine(param: { dueDate: Date } | string): number {
    const DAILY_FINE_RATE = 0.5;

    if (typeof param === 'string') {
      const memberReservations = this.reservations.filter((r) => r.memberId === param);
      const now = new Date();
      let totalFine = 0;
      for (const res of memberReservations) {
        if (now > res.dueDate) {
          const daysOverdue = Math.floor((now.getTime() - res.dueDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysOverdue > 0) {
            totalFine += daysOverdue * DAILY_FINE_RATE;
          }
        }
      }
      return totalFine;
    }

    if (param && param.dueDate) {
      const now = new Date();
      if (now > param.dueDate) {
        const daysOverdue = Math.floor((now.getTime() - param.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, daysOverdue * DAILY_FINE_RATE);
      }
      return 0;
    }

    return 0;
  }
}

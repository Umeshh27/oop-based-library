import { Member } from './Member';

/**
 * Represents a book in the library system (Subject in Observer pattern).
 */
export class Book {
  public title: string;
  public author: string;
  public isReserved: boolean;
  public reservedBy: Member | null;
  public waitlist: Member[];

  /**
   * Constructs a new Book instance.
   * @param {string} title - The title of the book.
   * @param {string} author - The author of the book.
   */
  constructor(title: string, author: string) {
    this.title = title;
    this.author = author;
    this.isReserved = false;
    this.reservedBy = null;
    this.waitlist = [];
  }

  /**
   * Marks the book as reserved.
   * @param {Member} [member] - Optional member who is reserving the book.
   */
  public reserve(member?: Member): void {
    this.isReserved = true;
    if (member) {
      this.reservedBy = member;
    }
  }

  /**
   * Marks the book as returned (not reserved).
   */
  public returnBook(): void {
    this.isReserved = false;
    this.reservedBy = null;
  }

  /**
   * Adds a member to the book's waitlist (Observer pattern).
   * @param {Member} member - The member to add to the waitlist.
   */
  public addToWaitlist(member: Member): void {
    if (!this.waitlist.some((m) => m.id === member.id)) {
      this.waitlist.push(member);
    }
  }

  /**
   * Removes a member from the book's waitlist.
   * @param {Member} member - The member to remove from the waitlist.
   */
  public removeFromWaitlist(member: Member): void {
    this.waitlist = this.waitlist.filter((m) => m.id !== member.id);
  }

  /**
   * Notifies all members on the waitlist that the book is available (Observer pattern).
   */
  public notifyObservers(): void {
    for (const observer of this.waitlist) {
      observer.update(this);
    }
  }
}

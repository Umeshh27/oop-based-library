import fs from 'fs';
import path from 'path';
import { Library } from '../src/Library';
import { Book } from '../src/Book';
import { MemberFactory } from '../src/MemberFactory';
import { StandardMember, StudentMember, StaffMember } from '../src/Member';

describe('OOP-Based Library Reservation System', () => {
  // Requirement 1: Directory structure and core class files existence
  describe('Requirement 1: Directory Structure & File Verification', () => {
    test('src and tests directories exist with core files', () => {
      const rootDir = path.resolve(__dirname, '..');
      expect(fs.existsSync(path.join(rootDir, 'src'))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, 'tests'))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, 'src', 'Book.ts'))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, 'src', 'Member.ts'))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, 'src', 'Library.ts'))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, 'src', 'MemberFactory.ts'))).toBe(true);
      expect(fs.existsSync(path.join(rootDir, 'tests', 'Library.test.ts'))).toBe(true);
    });
  });

  // Requirement 2: MemberFactory class implementation
  describe('Requirement 2: MemberFactory Implementation', () => {
    test('creates student member with borrowing limit of 5', () => {
      const member = MemberFactory.createMember('student', 'Ada Lovelace');
      expect(member.name).toBe('Ada Lovelace');
      expect(member.type).toBe('student');
      expect(member.borrowingLimit).toBe(5);
      expect(member instanceof StudentMember).toBe(true);
      expect(member.id).toBeDefined();
    });

    test('creates standard member with borrowing limit of 3', () => {
      const member = MemberFactory.createMember('standard', 'John Doe');
      expect(member.name).toBe('John Doe');
      expect(member.type).toBe('standard');
      expect(member.borrowingLimit).toBe(3);
      expect(member instanceof StandardMember).toBe(true);
    });

    test('creates staff member with borrowing limit of 10', () => {
      const member = MemberFactory.createMember('staff', 'Jane Smith');
      expect(member.name).toBe('Jane Smith');
      expect(member.type).toBe('staff');
      expect(member.borrowingLimit).toBe(10);
      expect(member instanceof StaffMember).toBe(true);
    });

    test('throws error for invalid member type', () => {
      expect(() => MemberFactory.createMember('guest', 'Bob')).toThrow('Invalid member type: guest');
    });
  });

  // Requirement 3: Enforcing borrowing limit for members
  describe('Requirement 3: Reservation Limit Enforcement', () => {
    test('throws exact error "Reservation limit reached." when limit is exceeded', () => {
      const library = new Library();
      const member = library.registerMember('Standard User', 'standard'); // limit 3

      library.addBook('Book 1', 'Author 1');
      library.addBook('Book 2', 'Author 2');
      library.addBook('Book 3', 'Author 3');
      library.addBook('Book 4', 'Author 4');

      library.reserveBook(member.id, 'Book 1');
      library.reserveBook(member.id, 'Book 2');
      library.reserveBook(member.id, 'Book 3');

      expect(() => {
        library.reserveBook(member.id, 'Book 4');
      }).toThrow('Reservation limit reached.');
    });
  });

  // Requirement 4: Waitlist notification via console log (Observer pattern)
  describe('Requirement 4: Observer Pattern Waitlist Notification', () => {
    test('notifies all members on waitlist with exact formatted console output', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const library = new Library();
      const hobbit = library.addBook('The Hobbit', 'J.R.R. Tolkien');
      const charlie = library.registerMember('Charlie', 'student');
      const alice = library.registerMember('Alice', 'student');
      const bob = library.registerMember('Bob', 'student');

      library.reserveBook(charlie.id, 'The Hobbit');
      library.reserveBook(alice.id, 'The Hobbit');
      library.reserveBook(bob.id, 'The Hobbit');

      library.returnBook('The Hobbit');

      expect(consoleSpy).toHaveBeenCalledWith('Notification for Alice: The book "The Hobbit" is now available.');
      expect(consoleSpy).toHaveBeenCalledWith('Notification for Bob: The book "The Hobbit" is now available.');

      consoleSpy.mockRestore();
    });
  });

  // Requirement 5: Waitlist FIFO ordering & automatic reservation transfer
  describe('Requirement 5: Waitlist FIFO and Automatic Reservation', () => {
    test('assigns returned book to first waiter in FIFO order and keeps second on waitlist', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const library = new Library();
      const dune = library.addBook('Dune', 'Frank Herbert');
      const charlie = library.registerMember('Charlie', 'student');
      const dave = library.registerMember('Dave', 'student');
      const eve = library.registerMember('Eve', 'student');

      // Reserve "Dune" for Charlie
      library.reserveBook(charlie.id, 'Dune');
      expect(dune.isReserved).toBe(true);
      expect(dune.reservedBy?.name).toBe('Charlie');

      // Dave joins waitlist first
      library.reserveBook(dave.id, 'Dune');
      // Eve joins waitlist second
      library.reserveBook(eve.id, 'Dune');

      expect(dune.waitlist.map((m) => m.name)).toEqual(['Dave', 'Eve']);

      // Charlie returns "Dune"
      library.returnBook('Dune');

      // "Dune" should now be automatically reserved for "Dave"
      expect(dune.isReserved).toBe(true);
      expect(dune.reservedBy?.name).toBe('Dave');

      // "Eve" should remain on waitlist
      expect(dune.waitlist.map((m) => m.name)).toEqual(['Eve']);

      consoleSpy.mockRestore();
    });
  });

  // Requirement 6: Fine Calculation
  describe('Requirement 6: Overdue Fine Calculation', () => {
    test('calculates fine correctly at $0.50 per day overdue (10 days = $5.00)', () => {
      const library = new Library();
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days in the past
      const reservation = { dueDate: pastDate };

      const fine = library.calculateFine(reservation);
      expect(fine).toBe(5);
    });

    test('returns 0 fine for non-overdue reservation', () => {
      const library = new Library();
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const reservation = { dueDate: futureDate };

      const fine = library.calculateFine(reservation);
      expect(fine).toBe(0);
    });
  });

  // Requirement 7: JSDoc Documentation Verification
  describe('Requirement 7: JSDoc Documentation Check', () => {
    test('verifies presence of JSDoc comments on required public methods', () => {
      const rootDir = path.resolve(__dirname, '..');
      const libraryContent = fs.readFileSync(path.join(rootDir, 'src', 'Library.ts'), 'utf-8');
      const factoryContent = fs.readFileSync(path.join(rootDir, 'src', 'MemberFactory.ts'), 'utf-8');

      // Check for JSDoc blocks before method definitions
      expect(libraryContent).toMatch(/\/\*\*[\s\S]*?\*\/\s*public\s+addBook/);
      expect(libraryContent).toMatch(/\/\*\*[\s\S]*?\*\/\s*public\s+registerMember/);
      expect(libraryContent).toMatch(/\/\*\*[\s\S]*?\*\/\s*public\s+reserveBook/);
      expect(libraryContent).toMatch(/\/\*\*[\s\S]*?\*\/\s*public\s+returnBook/);
      expect(factoryContent).toMatch(/\/\*\*[\s\S]*?\*\/\s*public\s+static\s+createMember/);
    });
  });

  // Requirement 9: Book class implementation
  describe('Requirement 9: Book Class Functionality', () => {
    test('instantiates with title and author and manages reservation state', () => {
      const myBook = new Book('1984', 'George Orwell');
      expect(myBook.title).toBe('1984');
      expect(myBook.author).toBe('George Orwell');
      expect(myBook.isReserved).toBe(false);

      myBook.reserve();
      expect(myBook.isReserved).toBe(true);

      myBook.returnBook();
      expect(myBook.isReserved).toBe(false);
    });
  });

  // Requirement 10: Library class facade
  describe('Requirement 10: Library Facade Operations', () => {
    test('adds and finds books and members correctly', () => {
      const library = new Library();
      library.addBook('Foundation', 'Isaac Asimov');

      const foundBook = library.findBook('Foundation');
      expect(foundBook).toBeInstanceOf(Book);
      expect(foundBook?.title).toBe('Foundation');
      expect(foundBook?.author).toBe('Isaac Asimov');

      const nonExistentBook = library.findBook('Non-Existent Book');
      expect(nonExistentBook).toBeUndefined();

      const member = library.registerMember('Ada Lovelace', 'student');
      const foundMember = library.findMember(member.id);
      expect(foundMember?.name).toBe('Ada Lovelace');
      expect(foundMember?.type).toBe('student');

      const nonExistentMember = library.findMember('invalid-id');
      expect(nonExistentMember).toBeUndefined();
    });
  });
});

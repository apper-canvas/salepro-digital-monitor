import contactsData from "@/services/mockData/contacts.json";

class ContactService {
  constructor() {
    this.contacts = [...contactsData];
  }

  async getAll() {
    await this.delay();
    return [...this.contacts];
  }

  async getById(id) {
    await this.delay();
    return this.contacts.find(contact => contact.Id === parseInt(id));
  }

  async create(contactData) {
    await this.delay();
    const newContact = {
      ...contactData,
      Id: Math.max(...this.contacts.map(c => c.Id)) + 1,
      lastInteraction: new Date().toISOString()
    };
    this.contacts.push(newContact);
    return { ...newContact };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.contacts.findIndex(contact => contact.Id === parseInt(id));
    if (index !== -1) {
      this.contacts[index] = { ...this.contacts[index], ...updateData };
      return { ...this.contacts[index] };
    }
    throw new Error("Contact not found");
  }

  async delete(id) {
    await this.delay();
    const index = this.contacts.findIndex(contact => contact.Id === parseInt(id));
    if (index !== -1) {
      const deleted = this.contacts.splice(index, 1)[0];
      return { ...deleted };
    }
    throw new Error("Contact not found");
  }

  async getByAccount(accountId) {
    await this.delay();
    return this.contacts.filter(contact => contact.accountId === accountId);
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export default new ContactService();
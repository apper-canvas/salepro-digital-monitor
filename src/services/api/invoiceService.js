import invoicesData from "@/services/mockData/invoices.json";

class InvoiceService {
  constructor() {
    this.invoices = [...invoicesData];
  }

  async getAll() {
    await this.delay();
    return [...this.invoices];
  }

  async getById(id) {
    await this.delay();
    return this.invoices.find(invoice => invoice.Id === parseInt(id));
  }

  async create(invoiceData) {
    await this.delay();
    const invoiceNumber = `INV-2024-${String(Math.max(...this.invoices.map(i => i.Id)) + 1).padStart(3, '0')}`;
    const newInvoice = {
      ...invoiceData,
      Id: Math.max(...this.invoices.map(i => i.Id)) + 1,
      invoiceNumber,
      issueDate: new Date().toISOString(),
      status: "Draft"
    };
    this.invoices.push(newInvoice);
    return { ...newInvoice };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.invoices.findIndex(invoice => invoice.Id === parseInt(id));
    if (index !== -1) {
      this.invoices[index] = { ...this.invoices[index], ...updateData };
      return { ...this.invoices[index] };
    }
    throw new Error("Invoice not found");
  }

  async delete(id) {
    await this.delay();
    const index = this.invoices.findIndex(invoice => invoice.Id === parseInt(id));
    if (index !== -1) {
      const deleted = this.invoices.splice(index, 1)[0];
      return { ...deleted };
    }
    throw new Error("Invoice not found");
  }

  async getByStatus(status) {
    await this.delay();
    return this.invoices.filter(invoice => invoice.status === status);
  }

  async getByContact(contactId) {
    await this.delay();
    return this.invoices.filter(invoice => invoice.contactId === contactId);
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export default new InvoiceService();
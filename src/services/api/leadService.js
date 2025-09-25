import leadsData from "@/services/mockData/leads.json";

class LeadService {
  constructor() {
    this.leads = [...leadsData];
  }

  async getAll() {
    await this.delay();
    return [...this.leads];
  }

  async getById(id) {
    await this.delay();
    return this.leads.find(lead => lead.Id === parseInt(id));
  }

  async create(leadData) {
    await this.delay();
    const newLead = {
      ...leadData,
      Id: Math.max(...this.leads.map(l => l.Id)) + 1,
      createdDate: new Date().toISOString(),
      lastContact: new Date().toISOString()
    };
    this.leads.push(newLead);
    return { ...newLead };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.leads.findIndex(lead => lead.Id === parseInt(id));
    if (index !== -1) {
      this.leads[index] = { ...this.leads[index], ...updateData };
      return { ...this.leads[index] };
    }
    throw new Error("Lead not found");
  }

  async delete(id) {
    await this.delay();
    const index = this.leads.findIndex(lead => lead.Id === parseInt(id));
    if (index !== -1) {
      const deleted = this.leads.splice(index, 1)[0];
      return { ...deleted };
    }
    throw new Error("Lead not found");
  }

  async getByStatus(status) {
    await this.delay();
    return this.leads.filter(lead => lead.status === status);
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export default new LeadService();
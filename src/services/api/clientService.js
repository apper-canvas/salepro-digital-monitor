import clientsData from "@/services/mockData/clients.json";

class ClientService {
  constructor() {
    this.clients = [...clientsData];
  }

  // Simulate API delay
  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  async getAll() {
    await this.delay();
    return [...this.clients];
  }

  async getById(id) {
    await this.delay();
    const client = this.clients.find(client => client.Id === parseInt(id));
    if (!client) {
      throw new Error("Client not found");
    }
    return { ...client };
  }

  async create(clientData) {
    await this.delay();
    const newId = this.clients.length > 0 ? Math.max(...this.clients.map(c => c.Id)) + 1 : 1;
    const newClient = {
      Id: newId,
      ...clientData,
      lastInteraction: new Date().toISOString()
    };
    this.clients.push(newClient);
    return { ...newClient };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.clients.findIndex(client => client.Id === parseInt(id));
    if (index !== -1) {
      this.clients[index] = { ...this.clients[index], ...updateData };
      return { ...this.clients[index] };
    }
    throw new Error("Client not found");
  }

  async delete(id) {
    await this.delay();
    const index = this.clients.findIndex(client => client.Id === parseInt(id));
    if (index !== -1) {
      const deletedClient = this.clients.splice(index, 1)[0];
      return { ...deletedClient };
    }
    throw new Error("Client not found");
  }

  async getByRelationshipLevel(relationshipLevel) {
    await this.delay();
    return this.clients.filter(client => client.relationshipLevel === relationshipLevel);
  }

  async getByCompany(company) {
    await this.delay();
    return this.clients.filter(client => 
      client.company.toLowerCase().includes(company.toLowerCase())
    );
  }
}

export default new ClientService();
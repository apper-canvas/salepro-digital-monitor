import dealsData from "@/services/mockData/deals.json";
import contactService from "@/services/api/contactService";
import clientService from "@/services/api/clientService";

class DealService {
  constructor() {
    this.deals = [...dealsData];
  }

  async getAll() {
    await this.delay();
    return [...this.deals];
  }

  async getById(id) {
    await this.delay();
    return this.deals.find(deal => deal.Id === parseInt(id));
  }

async create(dealData) {
    await this.delay();
    const newDeal = {
      ...dealData,
      Id: this.deals.length > 0 ? Math.max(...this.deals.map(d => d.Id)) + 1 : 1,
      status: "Open",
      createdDate: new Date().toISOString().split('T')[0]
    };
    this.deals.push(newDeal);
    return { ...newDeal };
  }

async update(id, updateData) {
    await this.delay();
    const index = this.deals.findIndex(deal => deal.Id === parseInt(id));
    if (index !== -1) {
      const originalDeal = { ...this.deals[index] };
      
      // If stage is being updated and no stageUpdatedAt provided, add timestamp
      if (updateData.stage && !updateData.stageUpdatedAt) {
        updateData.stageUpdatedAt = new Date().toISOString();
      }
      
      // Update the deal
      this.deals[index] = { ...this.deals[index], ...updateData };
      
      // Auto-create client when deal status becomes "Closed Won"
      if (updateData.stage === "Closed Won" && originalDeal.stage !== "Closed Won") {
        try {
          // Get the related contact
          const contact = await contactService.getById(this.deals[index].contactId);
          
          // Check if client already exists for this contact
          const existingClients = await clientService.getAll();
          const clientExists = existingClients.some(client => 
            client.email === contact.email && client.accountId === contact.accountId
          );
          
          if (!clientExists) {
            // Create client from contact data
            const clientData = {
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              phone: contact.phone,
              company: contact.company,
              jobTitle: contact.jobTitle,
              accountId: contact.accountId,
              relationshipLevel: contact.relationshipLevel,
              notes: `Converted from contact after successful deal closure: ${this.deals[index].title}`
            };
            
            await clientService.create(clientData);
          }
        } catch (err) {
          console.log(`Note: Could not auto-create client for deal ${id}:`, err.message);
        }
      }
      
      return { ...this.deals[index] };
    }
    throw new Error("Deal not found");
  }

  async delete(id) {
    await this.delay();
    const index = this.deals.findIndex(deal => deal.Id === parseInt(id));
    if (index !== -1) {
      const deleted = this.deals.splice(index, 1)[0];
      return { ...deleted };
    }
    throw new Error("Deal not found");
  }

  async getByStage(stage) {
    await this.delay();
    return this.deals.filter(deal => deal.stage === stage);
  }

  async getByContact(contactId) {
    await this.delay();
    return this.deals.filter(deal => deal.contactId === contactId);
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export default new DealService();
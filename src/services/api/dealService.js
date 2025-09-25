import dealsData from "@/services/mockData/deals.json";

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
      Id: Math.max(...this.deals.map(d => d.Id)) + 1,
      status: "Open"
    };
    this.deals.push(newDeal);
    return { ...newDeal };
  }

async update(id, updateData) {
    await this.delay();
    const index = this.deals.findIndex(deal => deal.Id === parseInt(id));
    if (index !== -1) {
      // If stage is being updated and no stageUpdatedAt provided, add timestamp
      if (updateData.stage && !updateData.stageUpdatedAt) {
        updateData.stageUpdatedAt = new Date().toISOString();
      }
      
      this.deals[index] = { ...this.deals[index], ...updateData };
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
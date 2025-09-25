import activitiesData from "@/services/mockData/activities.json";

class ActivityService {
  constructor() {
    this.activities = [...activitiesData];
  }

  async getAll() {
    await this.delay();
    return [...this.activities].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getById(id) {
    await this.delay();
    return this.activities.find(activity => activity.Id === parseInt(id));
  }

  async create(activityData) {
    await this.delay();
    const newActivity = {
      ...activityData,
      Id: Math.max(...this.activities.map(a => a.Id)) + 1,
      date: new Date().toISOString()
    };
    this.activities.push(newActivity);
    return { ...newActivity };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.activities.findIndex(activity => activity.Id === parseInt(id));
    if (index !== -1) {
      this.activities[index] = { ...this.activities[index], ...updateData };
      return { ...this.activities[index] };
    }
    throw new Error("Activity not found");
  }

  async delete(id) {
    await this.delay();
    const index = this.activities.findIndex(activity => activity.Id === parseInt(id));
    if (index !== -1) {
      const deleted = this.activities.splice(index, 1)[0];
      return { ...deleted };
    }
    throw new Error("Activity not found");
  }

  async getByContact(contactId) {
    await this.delay();
    return this.activities
      .filter(activity => activity.contactId === contactId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getByDeal(dealId) {
    await this.delay();
    return this.activities
      .filter(activity => activity.dealId === dealId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getByType(type) {
    await this.delay();
    return this.activities
      .filter(activity => activity.type === type)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export default new ActivityService();
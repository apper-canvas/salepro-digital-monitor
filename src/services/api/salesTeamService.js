import { toast } from 'react-toastify';

class SalesTeamService {
  constructor() {
    this.apperClient = null;
  }

  initializeClient() {
    if (!this.apperClient) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "team_lead_c"}},
          {"field": {"Name": "region_c"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords('sales_team_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(team => ({
        Id: team.Id,
        name: team.Name,
        description: team.description_c,
        teamLead: team.team_lead_c,
        region: team.region_c
      }));
    } catch (error) {
      console.error("Error fetching sales teams:", error?.response?.data?.message || error);
      toast.error("Failed to load sales teams");
      return [];
    }
  }

  async getById(id) {
    try {
      this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "team_lead_c"}},
          {"field": {"Name": "region_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('sales_team_c', parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }
      
      return {
        Id: response.data.Id,
        name: response.data.Name,
        description: response.data.description_c,
        teamLead: response.data.team_lead_c,
        region: response.data.region_c
      };
    } catch (error) {
      console.error(`Error fetching sales team ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }
}

const salesTeamService = new SalesTeamService();
export default salesTeamService;
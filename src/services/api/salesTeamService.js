import { toast } from "react-toastify";
import React from "react";

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
{"field": {"Name": "region_c"}},
          {"field": {"Name": "user_c"}},
          {"field": {"Name": "Name_c"}}
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
region: team.region_c,
        user: team.user_c,
        memberName: team.Name_c
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
          {"field": {"Name": "region_c"}},
          {"field": {"Name": "Name_c"}},
          {"field": {"Name": "user_c"}}
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
region: response.data.region_c,
        user: response.data.user_c,
        memberName: response.data.Name_c
      };
    } catch (error) {
      console.error(`Error fetching sales team ${id}:`, error?.response?.data?.message || error);
      return null;
} catch (error) {
      console.error(`Error fetching sales team ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(teamData) {
    try {
      this.initializeClient();
      
      const params = {
        records: [{
          Name: teamData.name,
          Name_c: teamData.memberName
        }]
      };
      
      const response = await this.apperClient.createRecord('sales_team_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} sales team members:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Sales team member created successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating sales team member:", error?.response?.data?.message || error);
      toast.error("Failed to create sales team member");
return null;
    }
  }

  async initializeDefaultTeams() {
    try {
      // Check if teams already exist
      const existingTeams = await this.getAll();
      const teamNames = ['Pravin test', 'John doe', 'Mark deno'];
      
      for (const teamName of teamNames) {
        const exists = existingTeams.some(team => 
          team.memberName === teamName || team.name === teamName
        );
        
        if (!exists) {
          await this.create({
            name: teamName,
            memberName: teamName
          });
        }
      }
    } catch (error) {
      console.error("Error initializing default sales teams:", error);

const salesTeamService = new SalesTeamService();
export default salesTeamService;
import { toast } from 'react-toastify';

class LeadService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'lead_c';
    this.initializeClient();
  }

  initializeClient() {
    if (window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "job_title_c"}},
          {"field": {"Name": "industry_c"}},
          {"field": {"Name": "lead_source_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "created_date_c"}},
          {"field": {"Name": "last_contact_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching leads:", response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching leads:", error?.response?.data?.message || error);
      toast.error("Failed to fetch leads");
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "job_title_c"}},
          {"field": {"Name": "industry_c"}},
          {"field": {"Name": "lead_source_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "created_date_c"}},
          {"field": {"Name": "last_contact_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error("Error fetching lead:", response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching lead:", error?.response?.data?.message || error);
      return null;
    }
  }

  async create(leadData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include updateable fields
      const createData = {
        Name: `${leadData.first_name_c} ${leadData.last_name_c}`,
        first_name_c: leadData.first_name_c,
        last_name_c: leadData.last_name_c,
        email_c: leadData.email_c,
        phone_c: leadData.phone_c,
        company_c: leadData.company_c,
        job_title_c: leadData.job_title_c,
        industry_c: leadData.industry_c,
        lead_source_c: leadData.lead_source_c,
        status_c: leadData.status_c || "New",
        score_c: leadData.score_c || 0,
        created_date_c: new Date().toISOString(),
        last_contact_c: new Date().toISOString()
      };

      const params = {
        records: [createData]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error creating lead:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} leads:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
if (successful.length > 0) {
          toast.success("Lead created successfully!");
          
          // Send Slack notification for new lead
          try {
            const { ApperClient } = window.ApperSDK;
            const apperClient = new ApperClient({
              apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
              apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
            });
            
            await apperClient.functions.invoke(import.meta.env.VITE_SEND_SLACK_NOTIFICATION, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(successful[0].data)
            });
          } catch (notificationError) {
            console.error('Failed to send Slack notification:', notificationError);
            // Don't throw error - lead creation should succeed even if notification fails
          }
          
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating lead:", error?.response?.data?.message || error);
      toast.error("Failed to create lead");
      return null;
    }
  }

  async update(id, updateData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include updateable fields
      const updatePayload = {
        Id: parseInt(id)
      };

      // Add only provided updateable fields
      if (updateData.first_name_c !== undefined) updatePayload.first_name_c = updateData.first_name_c;
      if (updateData.last_name_c !== undefined) updatePayload.last_name_c = updateData.last_name_c;
      if (updateData.email_c !== undefined) updatePayload.email_c = updateData.email_c;
      if (updateData.phone_c !== undefined) updatePayload.phone_c = updateData.phone_c;
      if (updateData.company_c !== undefined) updatePayload.company_c = updateData.company_c;
      if (updateData.job_title_c !== undefined) updatePayload.job_title_c = updateData.job_title_c;
      if (updateData.industry_c !== undefined) updatePayload.industry_c = updateData.industry_c;
      if (updateData.lead_source_c !== undefined) updatePayload.lead_source_c = updateData.lead_source_c;
      if (updateData.status_c !== undefined) updatePayload.status_c = updateData.status_c;
      if (updateData.score_c !== undefined) updatePayload.score_c = updateData.score_c;
      if (updateData.last_contact_c !== undefined) updatePayload.last_contact_c = updateData.last_contact_c;
      
      // Update Name if first/last name changed
      if (updateData.first_name_c !== undefined || updateData.last_name_c !== undefined) {
        updatePayload.Name = `${updateData.first_name_c || ''} ${updateData.last_name_c || ''}`.trim();
      }

      const params = {
        records: [updatePayload]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error updating lead:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} leads:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Lead updated successfully!");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating lead:", error?.response?.data?.message || error);
      toast.error("Failed to update lead");
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error deleting lead:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} leads:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Lead deleted successfully!");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting lead:", error?.response?.data?.message || error);
      toast.error("Failed to delete lead");
      return false;
    }
  }

  async getByStatus(status) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "job_title_c"}},
          {"field": {"Name": "industry_c"}},
          {"field": {"Name": "lead_source_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "created_date_c"}},
          {"field": {"Name": "last_contact_c"}}
        ],
        where: [
          {"FieldName": "status_c", "Operator": "EqualTo", "Values": [status], "Include": true}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching leads by status:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching leads by status:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new LeadService();
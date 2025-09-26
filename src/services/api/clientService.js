import { toast } from 'react-toastify';

class ClientService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'client_c';
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
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "relationship_level_c"}},
          {"field": {"Name": "last_interaction_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching clients:", response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching clients:", error?.response?.data?.message || error);
      toast.error("Failed to fetch clients");
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
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "relationship_level_c"}},
          {"field": {"Name": "last_interaction_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error("Error fetching client:", response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching client:", error?.response?.data?.message || error);
      return null;
    }
  }

  async create(clientData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include updateable fields
      const createData = {
        Name: `${clientData.first_name_c} ${clientData.last_name_c}`,
        first_name_c: clientData.first_name_c,
        last_name_c: clientData.last_name_c,
        email_c: clientData.email_c,
        phone_c: clientData.phone_c,
        company_c: clientData.company_c,
        job_title_c: clientData.job_title_c,
        account_id_c: clientData.account_id_c,
        relationship_level_c: clientData.relationship_level_c || "Champion",
        last_interaction_c: new Date().toISOString(),
        notes_c: clientData.notes_c || ""
      };

      const params = {
        records: [createData]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error creating client:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} clients:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
if (successful.length > 0) {
          const createdClient = successful[0].data;
          toast.success("Client created successfully!");
          
          // Send welcome email asynchronously
          this.sendWelcomeEmail(createdClient).catch(error => {
            console.error("Failed to send welcome email:", error);
            // Don't show error to user as client was created successfully
          });
          
          return createdClient;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating client:", error?.response?.data?.message || error);
      toast.error("Failed to create client");
      return null;
    }
  }

  async sendWelcomeEmail(clientData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const result = await apperClient.functions.invoke(import.meta.env.VITE_SEND_WELCOME_EMAIL || 'send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_c: clientData.email_c,
          first_name_c: clientData.first_name_c,
          last_name_c: clientData.last_name_c,
          company_c: clientData.company_c,
          job_title_c: clientData.job_title_c
        })
      });

      if (result && result.success) {
        console.log(`Welcome email sent successfully to ${clientData.email_c}`);
        return result;
      } else {
        throw new Error(result?.message || 'Failed to send welcome email');
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
      throw error;
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
      if (updateData.account_id_c !== undefined) updatePayload.account_id_c = updateData.account_id_c;
      if (updateData.relationship_level_c !== undefined) updatePayload.relationship_level_c = updateData.relationship_level_c;
      if (updateData.last_interaction_c !== undefined) updatePayload.last_interaction_c = updateData.last_interaction_c;
      if (updateData.notes_c !== undefined) updatePayload.notes_c = updateData.notes_c;
      
      // Update Name if first/last name changed
      if (updateData.first_name_c !== undefined || updateData.last_name_c !== undefined) {
        updatePayload.Name = `${updateData.first_name_c || ''} ${updateData.last_name_c || ''}`.trim();
      }

      const params = {
        records: [updatePayload]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error updating client:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} clients:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Client updated successfully!");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating client:", error?.response?.data?.message || error);
      toast.error("Failed to update client");
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
        console.error("Error deleting client:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} clients:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Client deleted successfully!");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting client:", error?.response?.data?.message || error);
      toast.error("Failed to delete client");
      return false;
    }
  }

  async getByRelationshipLevel(relationshipLevel) {
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
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "relationship_level_c"}},
          {"field": {"Name": "last_interaction_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [
          {"FieldName": "relationship_level_c", "Operator": "EqualTo", "Values": [relationshipLevel], "Include": true}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching clients by relationship level:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching clients by relationship level:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByCompany(company) {
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
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "relationship_level_c"}},
          {"field": {"Name": "last_interaction_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [
          {"FieldName": "company_c", "Operator": "Contains", "Values": [company], "Include": true}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching clients by company:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching clients by company:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new ClientService();
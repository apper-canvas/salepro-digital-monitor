import { toast } from 'react-toastify';

class DealService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'deal_c';
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "actual_close_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "products_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "contact_id_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching deals:", response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error);
      toast.error("Failed to fetch deals");
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "actual_close_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "products_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "contact_id_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error("Error fetching deal:", response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching deal:", error?.response?.data?.message || error);
      return null;
    }
  }

  async create(dealData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include updateable fields
      const createData = {
        Name: dealData.title_c,
        title_c: dealData.title_c,
        contact_id_c: parseInt(dealData.contact_id_c),
        account_id_c: dealData.account_id_c,
        value_c: parseFloat(dealData.value_c) || 0,
        probability_c: parseInt(dealData.probability_c) || 50,
        stage_c: dealData.stage_c || "New",
        expected_close_date_c: dealData.expected_close_date_c,
        status_c: dealData.status_c || "Open",
        products_c: dealData.products_c || "",
        notes_c: dealData.notes_c || ""
      };

      const params = {
        records: [createData]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error creating deal:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Deal created successfully!");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating deal:", error?.response?.data?.message || error);
      toast.error("Failed to create deal");
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
      if (updateData.title_c !== undefined) {
        updatePayload.title_c = updateData.title_c;
        updatePayload.Name = updateData.title_c;
      }
      if (updateData.contact_id_c !== undefined) updatePayload.contact_id_c = parseInt(updateData.contact_id_c);
      if (updateData.account_id_c !== undefined) updatePayload.account_id_c = updateData.account_id_c;
      if (updateData.value_c !== undefined) updatePayload.value_c = parseFloat(updateData.value_c);
      if (updateData.probability_c !== undefined) updatePayload.probability_c = parseInt(updateData.probability_c);
      if (updateData.stage_c !== undefined) updatePayload.stage_c = updateData.stage_c;
      if (updateData.expected_close_date_c !== undefined) updatePayload.expected_close_date_c = updateData.expected_close_date_c;
      if (updateData.actual_close_date_c !== undefined) updatePayload.actual_close_date_c = updateData.actual_close_date_c;
      if (updateData.status_c !== undefined) updatePayload.status_c = updateData.status_c;
      if (updateData.products_c !== undefined) updatePayload.products_c = updateData.products_c;
      if (updateData.notes_c !== undefined) updatePayload.notes_c = updateData.notes_c;

      const params = {
        records: [updatePayload]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error updating deal:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Deal updated successfully!");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating deal:", error?.response?.data?.message || error);
      toast.error("Failed to update deal");
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
        console.error("Error deleting deal:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Deal deleted successfully!");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting deal:", error?.response?.data?.message || error);
      toast.error("Failed to delete deal");
      return false;
    }
  }

  async getByStage(stage) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "actual_close_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "products_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "contact_id_c"}}
        ],
        where: [
          {"FieldName": "stage_c", "Operator": "EqualTo", "Values": [stage], "Include": true}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching deals by stage:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals by stage:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByContact(contactId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "actual_close_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "products_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "contact_id_c"}}
        ],
        where: [
          {"FieldName": "contact_id_c", "Operator": "EqualTo", "Values": [parseInt(contactId)], "Include": true}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching deals by contact:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals by contact:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new DealService();

export default new DealService();